import { NextRequest, NextResponse } from "next/server";
import { getCurrentAdmin } from "@/lib/admin-auth";
import { writeAuditLog } from "@/lib/audit";
import {
  insertPromotionBase,
  insertPackageTiers,
  insertPackageItems,
  type PackageTierInput,
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
  const tiersRaw = Array.isArray(body.tiers) ? body.tiers : [];
  const productIds = Array.isArray(body.product_ids)
    ? body.product_ids.map((x: number) => Number(x)).filter((x: number) => Number.isInteger(x) && x > 0)
    : [];

  if (!name) return NextResponse.json({ error: "Nama paket wajib diisi" }, { status: 400 });
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

  if (tiersRaw.length === 0) {
    return NextResponse.json({ error: "Tambahkan minimal 1 tingkatan diskon" }, { status: 400 });
  }
  if (productIds.length === 0) {
    return NextResponse.json({ error: "Pilih minimal 1 produk" }, { status: 400 });
  }

  const tiers: PackageTierInput[] = [];
  const seenQty = new Set<number>();
  for (let i = 0; i < tiersRaw.length; i++) {
    const t = tiersRaw[i];
    const minQty = Number(t.min_quantity);
    const dType = String(t.discount_type) as PackageTierInput["discount_type"];
    const dValue = Number(t.discount_value);

    if (!Number.isInteger(minQty) || minQty < 1) {
      return NextResponse.json({ error: `Tingkatan #${i + 1}: min jumlah harus ≥ 1` }, { status: 400 });
    }
    if (seenQty.has(minQty)) {
      return NextResponse.json({ error: `Tingkatan dengan min jumlah ${minQty} duplikat` }, { status: 400 });
    }
    seenQty.add(minQty);

    if (!["percentage", "fixed_amount", "fixed_price"].includes(dType)) {
      return NextResponse.json({ error: `Tingkatan #${i + 1}: jenis diskon tidak valid` }, { status: 400 });
    }
    if (!Number.isFinite(dValue) || dValue <= 0) {
      return NextResponse.json({ error: `Tingkatan #${i + 1}: nilai diskon harus > 0` }, { status: 400 });
    }
    if (dType === "percentage" && dValue > 100) {
      return NextResponse.json({ error: `Tingkatan #${i + 1}: persentase maksimal 100` }, { status: 400 });
    }

    tiers.push({
      min_quantity: minQty,
      discount_type: dType,
      discount_value: dValue,
      sort_order: i,
    });
  }

  const products = await getProductsByIds(productIds);
  if (products.length !== productIds.length) {
    return NextResponse.json({ error: "Sebagian produk tidak ditemukan" }, { status: 400 });
  }

  const promotionId = await insertPromotionBase({
    type: "package_discount",
    name,
    description: typeof body.description === "string" && body.description.trim() ? body.description.trim() : null,
    start_at: start,
    end_at: end,
    max_purchase_per_user: body.max_purchase_per_user != null && body.max_purchase_per_user !== ""
      ? Number(body.max_purchase_per_user)
      : null,
    created_by: admin.id,
  });
  await insertPackageTiers(promotionId, tiers);
  await insertPackageItems(promotionId, productIds);

  await writeAuditLog({
    adminId: admin.id,
    action: "create_promotion_package",
    entityType: "promotion",
    entityId: promotionId,
    newValues: { name, tiers: tiers.length, items: productIds.length },
    ipAddress: req.headers.get("x-forwarded-for"),
  });

  return NextResponse.json({ id: promotionId });
}
