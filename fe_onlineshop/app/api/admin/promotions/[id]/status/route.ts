import { NextRequest, NextResponse } from "next/server";
import { getCurrentAdmin } from "@/lib/admin-auth";
import { writeAuditLog } from "@/lib/audit";
import {
  setPromotionStatus,
  getPromotionDetail,
  type PromoStatus,
} from "@/lib/queries/admin/promotions";

const ALLOWED: PromoStatus[] = ["active", "paused", "cancelled", "scheduled"];

export async function POST(
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

  const body = await req.json().catch(() => ({}));
  const target = body.status as PromoStatus;
  if (!ALLOWED.includes(target)) {
    return NextResponse.json({ error: "Status tidak valid" }, { status: 400 });
  }

  const before = await getPromotionDetail(promoId);
  if (!before) return NextResponse.json({ error: "Promo not found" }, { status: 404 });

  if (before.status === "ended" || before.status === "cancelled") {
    return NextResponse.json(
      { error: "Promo yang sudah berakhir/dibatalkan tidak bisa diubah" },
      { status: 409 }
    );
  }

  await setPromotionStatus(promoId, target);

  await writeAuditLog({
    adminId: admin.id,
    action: `set_promotion_status_${target}`,
    entityType: "promotion",
    entityId: promoId,
    oldValues: { status: before.status },
    newValues: { status: target },
    ipAddress: req.headers.get("x-forwarded-for"),
  });

  return NextResponse.json({ ok: true, status: target });
}
