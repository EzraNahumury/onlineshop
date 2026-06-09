import { NextRequest, NextResponse } from "next/server";
import { getCurrentAdmin } from "@/lib/admin-auth";
import { writeAuditLog } from "@/lib/audit";
import {
  deletePromotion,
  getPromotionDetail,
  updatePromotionBasic,
} from "@/lib/queries/admin/promotions";

const MAX_DAYS = 180;

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

  const before = await getPromotionDetail(promoId);
  if (!before) return NextResponse.json({ error: "Promo not found" }, { status: 404 });
  if (before.status === "ended" || before.status === "cancelled") {
    return NextResponse.json(
      { error: "Promo yang sudah berakhir/dibatalkan tidak bisa diedit" },
      { status: 409 }
    );
  }

  const body = await req.json().catch(() => ({}));
  const name = typeof body.name === "string" ? body.name.trim() : undefined;
  const description = typeof body.description === "string"
    ? body.description.trim() || null
    : undefined;

  if (name !== undefined && name.length === 0) {
    return NextResponse.json({ error: "Nama tidak boleh kosong" }, { status: 400 });
  }

  let startAt: Date | undefined;
  let endAt: Date | undefined;
  if (body.start_at) {
    startAt = new Date(body.start_at);
    if (Number.isNaN(startAt.getTime())) {
      return NextResponse.json({ error: "Format tanggal mulai tidak valid" }, { status: 400 });
    }
  }
  if (body.end_at) {
    endAt = new Date(body.end_at);
    if (Number.isNaN(endAt.getTime())) {
      return NextResponse.json({ error: "Format tanggal selesai tidak valid" }, { status: 400 });
    }
  }
  const finalStart = startAt || before.start_at;
  const finalEnd = endAt || before.end_at;
  if (finalEnd <= finalStart) {
    return NextResponse.json(
      { error: "Tanggal selesai harus setelah tanggal mulai" },
      { status: 400 }
    );
  }
  const days = (finalEnd.getTime() - finalStart.getTime()) / 86400000;
  if (days > MAX_DAYS) {
    return NextResponse.json({ error: `Durasi maksimal ${MAX_DAYS} hari` }, { status: 400 });
  }

  let maxPerUser: number | null | undefined;
  if (body.max_purchase_per_user !== undefined) {
    maxPerUser = body.max_purchase_per_user === null || body.max_purchase_per_user === ""
      ? null
      : Number(body.max_purchase_per_user);
    if (maxPerUser !== null && (!Number.isInteger(maxPerUser) || maxPerUser < 1)) {
      return NextResponse.json({ error: "Batas/user harus ≥ 1" }, { status: 400 });
    }
  }

  await updatePromotionBasic(promoId, {
    name,
    description,
    start_at: startAt,
    end_at: endAt,
    max_purchase_per_user: maxPerUser,
  });

  await writeAuditLog({
    adminId: admin.id,
    action: "update_promotion_basic",
    entityType: "promotion",
    entityId: promoId,
    oldValues: {
      name: before.name,
      start_at: before.start_at,
      end_at: before.end_at,
      max_purchase_per_user: before.max_purchase_per_user,
    },
    newValues: { name, start_at: startAt, end_at: endAt, max_purchase_per_user: maxPerUser },
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

  const promo = await getPromotionDetail(promoId);
  if (!promo) return NextResponse.json({ error: "Promo not found" }, { status: 404 });

  await deletePromotion(promoId);

  await writeAuditLog({
    adminId: admin.id,
    action: "delete_promotion",
    entityType: "promotion",
    entityId: promoId,
    oldValues: { name: promo.name, type: promo.type, status: promo.status },
    ipAddress: req.headers.get("x-forwarded-for"),
  });

  return NextResponse.json({ ok: true });
}
