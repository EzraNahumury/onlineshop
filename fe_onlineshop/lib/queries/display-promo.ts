import { db } from "@/lib/db";
import { RowDataPacket, ResultSetHeader } from "mysql2";
import type { PoolConnection } from "mysql2/promise";

export type DisplayDiscountType = "percentage" | "fixed_amount";

// Apply a display-promo discount to a base price (whole rupiah, never below 0).
export function applyDisplayDiscount(
  base: number,
  type: DisplayDiscountType,
  value: number
): number {
  const p = type === "percentage" ? base * (1 - value / 100) : base - value;
  return Math.max(0, Math.round(p));
}

export interface ProductDisplayDiscount {
  promoId: number;
  discount_type: DisplayDiscountType;
  discount_value: number;
}

// For a set of products, the active display-promo discount that still has stock.
// One promo per product (soonest-ending wins).
export async function getDisplayPromoMapForProducts(
  productIds: number[]
): Promise<Map<number, ProductDisplayDiscount>> {
  const map = new Map<number, ProductDisplayDiscount>();
  const ids = [...new Set(productIds.filter((n) => Number.isInteger(n) && n > 0))];
  if (ids.length === 0) return map;
  const ph = ids.map(() => "?").join(",");
  const [rows] = await db.query<RowDataPacket[]>(
    `SELECT dpp.product_id, dp.id AS promo_id, dp.discount_type, dp.discount_value
       FROM display_promo_products dpp
       JOIN display_promos dp ON dp.id = dpp.display_promo_id
      WHERE dp.is_active = 1 AND NOW() BETWEEN dp.start_at AND dp.end_at
        AND (dp.stock IS NULL OR dp.sold < dp.stock)
        AND dpp.product_id IN (${ph})
      ORDER BY dp.end_at ASC`,
    ids
  );
  for (const r of rows) {
    const pid = Number(r.product_id);
    if (!map.has(pid)) {
      map.set(pid, {
        promoId: Number(r.promo_id),
        discount_type: r.discount_type,
        discount_value: Number(r.discount_value),
      });
    }
  }
  return map;
}

export async function getDisplayPromoForProduct(
  productId: number
): Promise<ProductDisplayDiscount | null> {
  const m = await getDisplayPromoMapForProducts([productId]);
  return m.get(productId) ?? null;
}

// Lowest effective price across base, store-promo price, and display-promo discount.
export function effectivePromoPrice(
  base: number,
  storePrice: number | null,
  display: ProductDisplayDiscount | undefined | null
): { price: number; original?: number } {
  const dPrice = display
    ? applyDisplayDiscount(base, display.discount_type, display.discount_value)
    : base;
  const sPrice = storePrice ?? base;
  const price = Math.min(base, sPrice, dPrice);
  return price < base ? { price, original: base } : { price };
}

// Inside a checkout transaction: if an active display promo (with remaining
// stock) covers this product, return the discounted unit price and consume the
// promo stock by `qty`. Row is locked FOR UPDATE to avoid overselling.
export async function applyAndConsumeDisplayPromo(
  conn: PoolConnection,
  productId: number,
  qty: number,
  basePrice: number
): Promise<number | null> {
  const [rows] = await conn.query<RowDataPacket[]>(
    `SELECT dp.id, dp.discount_type, dp.discount_value, dp.stock, dp.sold
       FROM display_promo_products dpp
       JOIN display_promos dp ON dp.id = dpp.display_promo_id
      WHERE dpp.product_id = ?
        AND dp.is_active = 1 AND NOW() BETWEEN dp.start_at AND dp.end_at
        AND (dp.stock IS NULL OR dp.sold < dp.stock)
      ORDER BY dp.end_at ASC
      LIMIT 1
      FOR UPDATE`,
    [productId]
  );
  const promo = rows[0];
  if (!promo) return null;

  const discounted = applyDisplayDiscount(
    basePrice,
    promo.discount_type,
    Number(promo.discount_value)
  );
  if (discounted >= basePrice) return null;

  if (promo.stock !== null) {
    await conn.query<ResultSetHeader>(
      `UPDATE display_promos SET sold = LEAST(stock, sold + ?) WHERE id = ?`,
      [qty, promo.id]
    );
  }
  return discounted;
}

export interface DisplayPromoProduct {
  id: number;
  name: string;
  slug: string;
  base_price: number;
  image: string | null;
}

export interface ActiveDisplayPromo {
  id: number;
  title: string;
  subtitle: string | null;
  discount_type: "percentage" | "fixed_amount";
  discount_value: number;
  stock: number | null;
  // Remaining time computed on the server (timezone-proof) for the countdown.
  seconds_remaining: number;
  products: DisplayPromoProduct[];
}

// The currently-running display promo (active flag + within its time window),
// preferring the one that ends soonest. Returns null when none is live.
export async function getActiveDisplayPromo(): Promise<ActiveDisplayPromo | null> {
  const [rows] = await db.query<RowDataPacket[]>(
    `SELECT id, title, subtitle, discount_type, discount_value,
            CASE WHEN stock IS NULL THEN NULL ELSE GREATEST(stock - sold, 0) END AS stock,
            GREATEST(TIMESTAMPDIFF(SECOND, NOW(), end_at), 0) AS seconds_remaining
       FROM display_promos
      WHERE is_active = 1 AND NOW() BETWEEN start_at AND end_at
      ORDER BY end_at ASC
      LIMIT 1`
  );
  const promo = rows[0];
  if (!promo) return null;

  const [prodRows] = await db.query<RowDataPacket[]>(
    `SELECT p.id, p.name, p.slug, p.base_price,
            (SELECT pi.image_url FROM product_images pi
              WHERE pi.product_id = p.id
              ORDER BY pi.is_primary DESC, pi.sort_order ASC LIMIT 1) AS image
       FROM display_promo_products dpp
       JOIN products p ON p.id = dpp.product_id
      WHERE dpp.display_promo_id = ?
      ORDER BY dpp.id ASC
      LIMIT 6`,
    [promo.id]
  );

  return {
    id: Number(promo.id),
    title: String(promo.title),
    subtitle: promo.subtitle ? String(promo.subtitle) : null,
    discount_type: promo.discount_type,
    discount_value: Number(promo.discount_value),
    stock: promo.stock != null ? Number(promo.stock) : null,
    seconds_remaining: Number(promo.seconds_remaining) || 0,
    products: prodRows.map((r) => ({
      id: Number(r.id),
      name: String(r.name),
      slug: String(r.slug),
      base_price: Number(r.base_price),
      image: r.image ? String(r.image) : null,
    })),
  };
}
