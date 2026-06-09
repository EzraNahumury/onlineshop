import { NextRequest, NextResponse } from "next/server";
import { getCurrentAdmin } from "@/lib/admin-auth";
import { writeAuditLog } from "@/lib/audit";
import {
  createShipmentForOrder,
  getOrderStatusOnly,
} from "@/lib/queries/admin/order-detail";

const SHIPPABLE = new Set(["paid", "processing", "ready_to_ship"]);

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
  if (!SHIPPABLE.has(order.order_status)) {
    return NextResponse.json(
      { error: `Order tidak bisa dikirim dari status "${order.order_status}"` },
      { status: 409 }
    );
  }

  const body = await req.json().catch(() => ({}));
  const method = body.method as "pickup" | "drop_off" | "manual";
  if (!["pickup", "drop_off", "manual"].includes(method)) {
    return NextResponse.json({ error: "Metode pengiriman tidak valid" }, { status: 400 });
  }

  const courierId = body.courier_id != null && body.courier_id !== ""
    ? Number(body.courier_id)
    : null;
  const tracking = typeof body.tracking_number === "string" && body.tracking_number.trim()
    ? body.tracking_number.trim()
    : null;

  const shipmentId = await createShipmentForOrder({
    orderId,
    courierId,
    method,
    trackingNumber: tracking,
    changedBy: admin.email,
    changedByName: admin.name,
  });

  await writeAuditLog({
    adminId: admin.id,
    action: "ship_order",
    entityType: "order",
    entityId: orderId,
    oldValues: { order_status: order.order_status },
    newValues: { order_status: "shipped", method, courier_id: courierId, tracking_number: tracking },
    ipAddress: req.headers.get("x-forwarded-for"),
  });

  return NextResponse.json({ ok: true, shipment_id: shipmentId });
}
