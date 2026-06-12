import { NextRequest, NextResponse } from "next/server";
import { getCurrentAdmin } from "@/lib/admin-auth";
import { writeAuditLog } from "@/lib/audit";
import {
  updateDisplayPromo,
  deleteDisplayPromo,
  displayPromoExists,
  getTotalProductStock,
} from "@/lib/queries/admin/display-promos";
import { parseDisplayPromoBody } from "../validate";

export async function PUT(
  req: NextRequest,
  ctx: { params: Promise<{ id: string }> }
) {
  const admin = await getCurrentAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await ctx.params;
  const promoId = Number(id);
  if (!Number.isInteger(promoId) || promoId <= 0) {
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  }
  if (!(await displayPromoExists(promoId))) {
    return NextResponse.json({ error: "Display promo tidak ditemukan" }, { status: 404 });
  }

  const body = await req.json().catch(() => ({}));
  const parsed = parseDisplayPromoBody(body);
  if ("error" in parsed) {
    return NextResponse.json({ error: parsed.error }, { status: 400 });
  }

  if (parsed.value.stock != null) {
    const total = await getTotalProductStock(parsed.value.productIds);
    if (parsed.value.stock > total) {
      return NextResponse.json(
        { error: `Stok promo (${parsed.value.stock}) melebihi total stok produk yang dipilih (${total}).` },
        { status: 400 }
      );
    }
  }

  await updateDisplayPromo(promoId, parsed.value);

  await writeAuditLog({
    adminId: admin.id,
    action: "update_display_promo",
    entityType: "display_promo",
    entityId: promoId,
    newValues: { title: parsed.value.title },
    ipAddress: req.headers.get("x-forwarded-for"),
  });

  return NextResponse.json({ ok: true });
}

export async function DELETE(
  req: NextRequest,
  ctx: { params: Promise<{ id: string }> }
) {
  const admin = await getCurrentAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await ctx.params;
  const promoId = Number(id);
  if (!Number.isInteger(promoId) || promoId <= 0) {
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  }
  if (!(await displayPromoExists(promoId))) {
    return NextResponse.json({ error: "Display promo tidak ditemukan" }, { status: 404 });
  }

  await deleteDisplayPromo(promoId);

  await writeAuditLog({
    adminId: admin.id,
    action: "delete_display_promo",
    entityType: "display_promo",
    entityId: promoId,
    ipAddress: req.headers.get("x-forwarded-for"),
  });

  return NextResponse.json({ ok: true });
}
