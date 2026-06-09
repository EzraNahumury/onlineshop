import { NextRequest, NextResponse } from "next/server";
import { getCurrentAdmin } from "@/lib/admin-auth";
import { writeAuditLog } from "@/lib/audit";
import {
  getOrderStatusOnly,
  transitionOrderStatus,
} from "@/lib/queries/admin/order-detail";

const ALLOWED_TRANSITIONS: Record<string, ("completed" | "cancelled")[]> = {
  unpaid: ["cancelled"],
  pending_payment: ["cancelled"],
  paid: ["cancelled"],
  processing: ["cancelled"],
  ready_to_ship: ["cancelled"],
  shipped: ["completed"],
};

export async function POST(
  req: NextRequest,
  ctx: { params: Promise<{ id: string }> }
) {
  const admin = await getCurrentAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await ctx.params;
  const orderId = Number(id);
  if (!Number.isInteger(orderId) || orderId <= 0) {
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  }

  const body = await req.json().catch(() => ({}));
  const target = body.status as "completed" | "cancelled";
  if (!["completed", "cancelled"].includes(target)) {
    return NextResponse.json({ error: "Status tidak valid" }, { status: 400 });
  }

  const order = await getOrderStatusOnly(orderId);
  if (!order) return NextResponse.json({ error: "Order not found" }, { status: 404 });

  const allowed = ALLOWED_TRANSITIONS[order.order_status] || [];
  if (!allowed.includes(target)) {
    return NextResponse.json(
      { error: `Tidak bisa transisi dari "${order.order_status}" ke "${target}"` },
      { status: 409 }
    );
  }

  const note = typeof body.note === "string" && body.note.trim() ? body.note.trim() : undefined;
  await transitionOrderStatus(orderId, order.order_status, target, admin.name, note);

  await writeAuditLog({
    adminId: admin.id,
    action: `set_order_status_${target}`,
    entityType: "order",
    entityId: orderId,
    oldValues: { order_status: order.order_status },
    newValues: { order_status: target, note },
    ipAddress: req.headers.get("x-forwarded-for"),
  });

  return NextResponse.json({ ok: true });
}
