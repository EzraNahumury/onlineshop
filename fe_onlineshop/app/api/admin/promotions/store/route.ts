import { NextRequest, NextResponse } from "next/server";
import { getCurrentAdmin } from "@/lib/admin-auth";
import { writeAuditLog } from "@/lib/audit";
import {
  insertPromotionBase,
  insertStoreItems,
  type StoreItemInput,
} from "@/lib/queries/admin/promotions";
import { getProductsByIds } from "@/lib/queries/admin/products";

const MAX_DAYS = 180;

export async function POST(req: NextRequest) {
  const admin = await getCurrentAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const name = String(body.name || "").trim();
  const startStr = String(body.start_at || "");
  const endStr = String(body.end_at || "");
  const itemsRaw = Array.isArray(body.items) ? body.items : [];

  if (!name) return NextResponse.json({ error: "Nama promo wajib diisi" }, { status: 400 });
  if (!startStr || !endStr) {
    return NextResponse.json({ error: "Periode promo wajib diisi" }, { status: 400 });
  }

  const start = new Date(startStr);
  const end = new Date(endStr);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
    return NextResponse.json({ error: "Format tanggal tidak valid" }, { status: 400 });
  }
  if (end <= start) {
    return NextResponse.json({ error: "Tanggal selesai harus setelah tanggal mulai" }, { status: 400 });
  }
  const days = (end.getTime() - start.getTime()) / 86400000;
  if (days > MAX_DAYS) {
    return NextResponse.json(
      { error: `Durasi promo maksimal ${MAX_DAYS} hari` },
      { status: 400 }
    );
  }

  if (itemsRaw.length === 0) {
    return NextResponse.json({ error: "Tambahkan minimal 1 produk ke promo" }, { status: 400 });
  }

  const productIds: number[] = Array.from(
    new Set(itemsRaw.map((i: { product_id: number }) => Number(i.product_id)))
  );
  const products = await getProductsByIds(productIds);
  const productMap = new Map(products.map((p) => [p.id, p]));

  const items: StoreItemInput[] = [];
  for (let i = 0; i < itemsRaw.length; i++) {
    const it = itemsRaw[i];
    const productId = Number(it.product_id);
    const product = productMap.get(productId);
    if (!product) {
      return NextResponse.json({ error: `Produk #${productId} tidak ditemukan` }, { status: 400 });
    }
    const original = Number(product.base_price);
    const discount = Number(it.discount_price);
    const stock = Number(it.promo_stock);
    const limit = it.purchase_limit != null && it.purchase_limit !== ""
      ? Number(it.purchase_limit)
      : null;

    if (!Number.isFinite(discount) || discount <= 0) {
      return NextResponse.json({ error: `Harga diskon ${product.name} harus > 0` }, { status: 400 });
    }
    if (discount >= original) {
      return NextResponse.json(
        { error: `Harga diskon ${product.name} harus lebih kecil dari harga awal` },
        { status: 400 }
      );
    }
    if (!Number.isInteger(stock) || stock <= 0) {
      return NextResponse.json(
        { error: `Stok promo ${product.name} harus angka bulat > 0` },
        { status: 400 }
      );
    }
    if (stock > product.stock) {
      return NextResponse.json(
        { error: `Stok promo ${product.name} (${stock}) melebihi stok tersedia (${product.stock})` },
        { status: 400 }
      );
    }
    if (limit !== null && (!Number.isInteger(limit) || limit < 1)) {
      return NextResponse.json(
        { error: `Batas pembelian ${product.name} harus ≥ 1` },
        { status: 400 }
      );
    }

    const percent = ((original - discount) / original) * 100;

    items.push({
      product_id: productId,
      variant_id: null,
      original_price: original,
      discount_price: discount,
      discount_percent: Math.round(percent * 100) / 100,
      promo_stock: stock,
      purchase_limit: limit,
      is_active: it.is_active !== false,
    });
  }

  const promotionId = await insertPromotionBase({
    type: "store_promo",
    name,
    description: typeof body.description === "string" && body.description.trim() ? body.description.trim() : null,
    start_at: start,
    end_at: end,
    max_purchase_per_user: body.max_purchase_per_user != null && body.max_purchase_per_user !== ""
      ? Number(body.max_purchase_per_user)
      : null,
    created_by: admin.id,
  });
  await insertStoreItems(promotionId, items);

  await writeAuditLog({
    adminId: admin.id,
    action: "create_promotion_store",
    entityType: "promotion",
    entityId: promotionId,
    newValues: { name, items: items.length },
    ipAddress: req.headers.get("x-forwarded-for"),
  });

  return NextResponse.json({ id: promotionId });
}
