import { NextRequest, NextResponse } from "next/server";
import { getCurrentAdmin } from "@/lib/admin-auth";
import { writeAuditLog } from "@/lib/audit";
import { getOrderStatusOnly, verifyOrderPayment } from "@/lib/queries/admin/order-detail";

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

  const order = await getOrderStatusOnly(orderId);
  if (!order) return NextResponse.json({ error: "Order not found" }, { status: 404 });

  if (!["unpaid", "pending_payment"].includes(order.order_status)) {
    return NextResponse.json(
      { error: `Pesanan tidak dalam status menunggu pembayaran (sekarang: ${order.order_status}).` },
      { status: 409 }
    );
  }

  await verifyOrderPayment(orderId, order.order_status, admin.name);

  await writeAuditLog({
    adminId: admin.id,
    action: "verify_order_payment",
    entityType: "order",
    entityId: orderId,
    oldValues: { order_status: order.order_status },
    newValues: { order_status: "paid" },
    ipAddress: req.headers.get("x-forwarded-for"),
  });

  return NextResponse.json({ ok: true });
}
