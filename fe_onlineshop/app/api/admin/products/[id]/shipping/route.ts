import { NextRequest, NextResponse } from "next/server";
import { getCurrentAdmin } from "@/lib/admin-auth";
import { writeAuditLog } from "@/lib/audit";
import { upsertShipping, productExists } from "@/lib/queries/admin/products";

export async function PUT(
  req: NextRequest,
  ctx: { params: Promise<{ id: string }> }
) {
  const admin = await getCurrentAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await ctx.params;
  const productId = Number(id);
  if (!Number.isInteger(productId) || productId <= 0) {
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  }

  const exists = await productExists(productId);
  if (!exists) return NextResponse.json({ error: "Product not found" }, { status: 404 });

  const body = await req.json().catch(() => ({}));

  const weight = Number(body.weight_grams);
  if (!Number.isFinite(weight) || weight <= 0) {
    return NextResponse.json({ error: "Berat wajib diisi (gram)" }, { status: 400 });
  }

  const minPurchase = Number(body.min_purchase) || 1;
  if (!Number.isInteger(minPurchase) || minPurchase < 1) {
    return NextResponse.json({ error: "Min pembelian harus ≥ 1" }, { status: 400 });
  }

  const maxPurchase = body.max_purchase != null && body.max_purchase !== ""
    ? Number(body.max_purchase)
    : null;
  if (maxPurchase !== null && (!Number.isInteger(maxPurchase) || maxPurchase < minPurchase)) {
    return NextResponse.json({ error: "Max pembelian harus ≥ min pembelian" }, { status: 400 });
  }

  function dim(v: unknown): number | null {
    if (v == null || v === "") return null;
    const n = Number(v);
    return Number.isFinite(n) && n > 0 ? n : null;
  }

  await upsertShipping(productId, {
    weight_grams: Math.round(weight),
    length_cm: dim(body.length_cm),
    width_cm: dim(body.width_cm),
    height_cm: dim(body.height_cm),
    min_purchase: minPurchase,
    max_purchase: maxPurchase,
    is_free_shipping: !!body.is_free_shipping,
    notes: typeof body.notes === "string" && body.notes.trim() ? body.notes.trim() : null,
  });

  await writeAuditLog({
    adminId: admin.id,
    action: "update_product_shipping",
    entityType: "product",
    entityId: productId,
    newValues: {
      weight_grams: Math.round(weight),
      min_purchase: minPurchase,
      max_purchase: maxPurchase,
      is_free_shipping: !!body.is_free_shipping,
    },
    ipAddress: req.headers.get("x-forwarded-for"),
  });

  return NextResponse.json({ ok: true });
}
