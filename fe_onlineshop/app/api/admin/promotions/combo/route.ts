import { NextRequest, NextResponse } from "next/server";
import { getCurrentAdmin } from "@/lib/admin-auth";
import { writeAuditLog } from "@/lib/audit";
import {
  insertPromotionBase,
  insertComboMain,
  insertComboAddons,
  type ComboAddonInput,
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
  const mainIds = Array.isArray(body.main_product_ids)
    ? body.main_product_ids.map((x: number) => Number(x)).filter((x: number) => Number.isInteger(x) && x > 0)
    : [];
  const addonsRaw = Array.isArray(body.addons) ? body.addons : [];

  if (!name) return NextResponse.json({ error: "Nama kombo wajib diisi" }, { status: 400 });
  if (!startStr || !endStr) {
    return NextResponse.json({ error: "Periode wajib diisi" }, { status: 400 });
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
    return NextResponse.json({ error: `Durasi maksimal ${MAX_DAYS} hari` }, { status: 400 });
  }

  if (mainIds.length === 0) {
    return NextResponse.json({ error: "Pilih minimal 1 produk utama" }, { status: 400 });
  }
  if (addonsRaw.length === 0) {
    return NextResponse.json({ error: "Tambahkan minimal 1 produk tambahan" }, { status: 400 });
  }

  const allIds = Array.from(new Set([...mainIds, ...addonsRaw.map((a: { product_id: number }) => Number(a.product_id))]));
  const products = await getProductsByIds(allIds);
  const productMap = new Map(products.map((p) => [p.id, p]));

  for (const mid of mainIds) {
    if (!productMap.has(mid)) {
      return NextResponse.json({ error: `Produk utama #${mid} tidak ditemukan` }, { status: 400 });
    }
  }

  const addons: ComboAddonInput[] = [];
  for (let i = 0; i < addonsRaw.length; i++) {
    const a = addonsRaw[i];
    const productId = Number(a.product_id);
    const product = productMap.get(productId);
    if (!product) {
      return NextResponse.json({ error: `Produk tambahan #${productId} tidak ditemukan` }, { status: 400 });
    }
    const original = Number(product.base_price);
    const combo = Number(a.combo_price);
    const stock = Number(a.stock);
    const limit = a.purchase_limit != null && a.purchase_limit !== ""
      ? Number(a.purchase_limit)
      : null;

    if (!Number.isFinite(combo) || combo <= 0) {
      return NextResponse.json({ error: `Harga kombo ${product.name} harus > 0` }, { status: 400 });
    }
    if (combo >= original) {
      return NextResponse.json(
        { error: `Harga kombo ${product.name} harus lebih kecil dari harga normal` },
        { status: 400 }
      );
    }
    if (!Number.isInteger(stock) || stock <= 0) {
      return NextResponse.json(
        { error: `Stok kombo ${product.name} harus angka bulat > 0` },
        { status: 400 }
      );
    }
    const percent = ((original - combo) / original) * 100;

    addons.push({
      product_id: productId,
      variant_id: null,
      original_price: original,
      combo_price: combo,
      combo_discount_percent: Math.round(percent * 100) / 100,
      stock,
      purchase_limit: limit,
      is_active: a.is_active !== false,
    });
  }

  const promotionId = await insertPromotionBase({
    type: "combo_deal",
    name,
    description: typeof body.description === "string" && body.description.trim() ? body.description.trim() : null,
    start_at: start,
    end_at: end,
    max_purchase_per_user: body.max_purchase_per_user != null && body.max_purchase_per_user !== ""
      ? Number(body.max_purchase_per_user)
      : null,
    created_by: admin.id,
  });
  await insertComboMain(promotionId, mainIds);
  await insertComboAddons(promotionId, addons);

  await writeAuditLog({
    adminId: admin.id,
    action: "create_promotion_combo",
    entityType: "promotion",
    entityId: promotionId,
    newValues: { name, main: mainIds.length, addons: addons.length },
    ipAddress: req.headers.get("x-forwarded-for"),
  });

  return NextResponse.json({ id: promotionId });
}
