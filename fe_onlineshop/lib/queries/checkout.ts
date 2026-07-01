import { db } from "@/lib/db";
import { RowDataPacket, ResultSetHeader } from "mysql2";
import { generateOrderNumber } from "@/lib/utils";
import { orderHash } from "@/lib/order-hash";
import { getUserAddress } from "@/lib/queries/addresses";
import { getActiveStorePromoForProduct } from "@/lib/queries/pricing";
import { applyAndConsumeDisplayPromo } from "@/lib/queries/display-promo";
import { PAYMENT_WINDOW_MINUTES } from "@/lib/payment-config";
import { getCartWeightGrams, resolveShippingForOrder } from "@/lib/queries/shipping";

export interface CheckoutItemInput {
  productId: number;
  variantId: number | null;
  quantity: number;
}

export interface CreateOrderResult {
  orderId: number;
  orderNumber: string;
  grandTotal: number;
}

export class CheckoutError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "CheckoutError";
  }
}

interface ResolvedItem {
  productId: number;
  variantId: number | null;
  productName: string;
  variantName: string | null;
  imageUrl: string | null;
  originalUnitPrice: number; // base/variant price before any promo
  unitPrice: number; // effective price (store promo applied; display promo added at checkout)
  quantity: number;
  subtotal: number;
}

// Resolve every cart item from the DB — never trust client-sent prices.
async function resolveItems(items: CheckoutItemInput[]): Promise<ResolvedItem[]> {
  const resolved: ResolvedItem[] = [];

  for (const raw of items) {
    const qty = Math.floor(Number(raw.quantity));
    if (!Number.isInteger(qty) || qty < 1) {
      throw new CheckoutError("Jumlah produk tidak valid.");
    }

    const [prodRows] = await db.query<RowDataPacket[]>(
      `SELECT p.id, p.name, p.base_price, p.status, p.has_variant, p.stock,
              (SELECT pi.image_url FROM product_images pi
                WHERE pi.product_id = p.id
                ORDER BY pi.is_primary DESC, pi.sort_order ASC LIMIT 1) AS primary_image
         FROM products p WHERE p.id = ? LIMIT 1`,
      [raw.productId]
    );
    const product = prodRows[0];
    if (!product || product.status !== "live") {
      throw new CheckoutError("Salah satu produk tidak tersedia lagi.");
    }

    let unitPrice: number;
    let originalUnitPrice: number;
    let variantName: string | null = null;
    let imageUrl: string | null = product.primary_image || null;

    if (raw.variantId != null) {
      const [varRows] = await db.query<RowDataPacket[]>(
        `SELECT id, product_id, option_value_1, option_value_2, price, stock, is_active, image_url
           FROM product_variants WHERE id = ? AND product_id = ? LIMIT 1`,
        [raw.variantId, raw.productId]
      );
      const variant = varRows[0];
      if (!variant || !variant.is_active) {
        throw new CheckoutError("Salah satu variasi produk tidak tersedia lagi.");
      }
      if (variant.stock < qty) {
        throw new CheckoutError(`Stok "${product.name}" tidak mencukupi.`);
      }
      unitPrice = Number(variant.price);
      originalUnitPrice = unitPrice;
      variantName = [variant.option_value_1, variant.option_value_2]
        .filter(Boolean)
        .join(" / ") || null;
      if (variant.image_url) imageUrl = variant.image_url;
    } else {
      if (product.has_variant) {
        throw new CheckoutError(`Pilih variasi untuk "${product.name}".`);
      }
      if (product.stock < qty) {
        throw new CheckoutError(`Stok "${product.name}" tidak mencukupi.`);
      }
      originalUnitPrice = Number(product.base_price);
      unitPrice = originalUnitPrice;
      // Apply active store promo (non-variant products only — mirrors product page).
      const promo = await getActiveStorePromoForProduct(product.id);
      if (promo) unitPrice = promo.discount_price;
    }

    resolved.push({
      productId: product.id,
      variantId: raw.variantId,
      productName: product.name,
      variantName,
      imageUrl,
      originalUnitPrice,
      unitPrice,
      quantity: qty,
      subtotal: unitPrice * qty,
    });
  }

  return resolved;
}

// Pick a 3-digit unique code (1..999) avoiding a clash with another open invoice
// that would produce the same grand total.
async function pickUniqueCode(baseTotal: number): Promise<number> {
  for (let attempt = 0; attempt < 25; attempt++) {
    const code = 1 + Math.floor(Math.random() * 999);
    const candidate = baseTotal + code;
    const [rows] = await db.query<RowDataPacket[]>(
      `SELECT 1 FROM invoices
        WHERE status = 'pending' AND expired_at > NOW() AND amount = ?
        LIMIT 1`,
      [candidate]
    );
    if (rows.length === 0) return code;
  }
  // Fallback: still return a code even if a (rare) clash remains.
  return 1 + Math.floor(Math.random() * 999);
}

export async function createOrderFromCart(
  userId: number,
  addressId: number,
  items: CheckoutItemInput[],
  shippingServiceCode: string | null = null
): Promise<CreateOrderResult> {
  if (!Array.isArray(items) || items.length === 0) {
    throw new CheckoutError("Keranjang kosong.");
  }

  const address = await getUserAddress(userId, addressId);
  if (!address) {
    throw new CheckoutError("Alamat pengiriman tidak ditemukan. Pilih alamat dulu.");
  }

  const resolved = await resolveItems(items);

  const addressSnapshot = {
    receiver_name: address.receiver_name,
    phone: address.phone,
    province: address.province,
    city: address.city,
    district: address.district,
    village: address.village,
    postal_code: address.postal_code,
    address_line: address.address_line,
    address_detail: address.address_detail,
    label: address.label,
  };

  const orderNumber = generateOrderNumber();
  const invoiceNumber = orderNumber.replace(/^AYR/, "INV");

  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();

    // Apply display-promo discounts atomically (locks promo rows, consumes stock).
    // Display promo wins only if it beats the already-resolved (store) price.
    for (const it of resolved) {
      const dp = await applyAndConsumeDisplayPromo(
        conn,
        it.productId,
        it.quantity,
        it.originalUnitPrice
      );
      if (dp != null && dp < it.unitPrice) {
        it.unitPrice = dp;
        it.subtotal = dp * it.quantity;
      }
    }

    const subtotal = resolved.reduce((s, it) => s + it.subtotal, 0);
    const discount = 0;
    const weightGrams = await getCartWeightGrams(items);
    const shippingQuote = await resolveShippingForOrder(
      address,
      subtotal,
      weightGrams,
      shippingServiceCode
    );
    const shipping = shippingQuote.amount;
    const baseTotal = subtotal - discount + shipping;
    const uniqueCode = await pickUniqueCode(baseTotal);
    const grandTotal = baseTotal + uniqueCode;

    const [orderRes] = await conn.query<ResultSetHeader>(
      `INSERT INTO orders
         (user_id, order_number, address_snapshot, subtotal, discount_amount,
          shipping_amount, shipping_courier, shipping_service_code, shipping_service_label, shipping_etd,
          service_fee, grand_total, unique_code,
          order_status, fulfillment_status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, ?, ?, 'unpaid', 'pending')`,
      [
        userId,
        orderNumber,
        JSON.stringify(addressSnapshot),
        subtotal,
        discount,
        shipping,
        shippingQuote.courier,
        shippingQuote.serviceCode,
        shippingQuote.serviceLabel,
        shippingQuote.etd,
        grandTotal,
        uniqueCode,
      ]
    );
    const orderId = orderRes.insertId;

    // Obfuscated id for URLs (deterministic SHA-256 of the order id).
    await conn.query<ResultSetHeader>(
      `UPDATE orders SET hash_id = ? WHERE id = ?`,
      [orderHash(orderId), orderId]
    );

    const itemValues = resolved.map(() => `(?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`).join(", ");
    const itemParams: unknown[] = [];
    for (const it of resolved) {
      const discPerItem = Math.max(0, it.originalUnitPrice - it.unitPrice);
      itemParams.push(
        orderId,
        it.productId,
        it.variantId,
        it.productName,
        it.variantName,
        it.imageUrl,
        it.quantity,
        it.unitPrice,
        discPerItem,
        it.subtotal
      );
    }
    await conn.query<ResultSetHeader>(
      `INSERT INTO order_items
         (order_id, product_id, variant_id, product_name, variant_name, image_url,
          quantity, unit_price, discount_per_item, subtotal)
       VALUES ${itemValues}`,
      itemParams
    );

    await conn.query<ResultSetHeader>(
      `INSERT INTO invoices (order_id, invoice_number, amount, status, expired_at)
       VALUES (?, ?, ?, 'pending', DATE_ADD(NOW(), INTERVAL ? MINUTE))`,
      [orderId, invoiceNumber, grandTotal, PAYMENT_WINDOW_MINUTES]
    );

    await conn.query<ResultSetHeader>(
      `INSERT INTO order_status_histories (order_id, from_status, to_status, note, changed_by)
       VALUES (?, NULL, 'unpaid', 'Order dibuat, menunggu pembayaran', 'customer')`,
      [orderId]
    );

    await conn.commit();
    return { orderId, orderNumber, grandTotal };
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
}
