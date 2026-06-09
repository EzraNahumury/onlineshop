import { NextRequest, NextResponse } from "next/server";
import { getCurrentAdmin } from "@/lib/admin-auth";
import { writeAuditLog } from "@/lib/audit";
import {
  createShipmentForOrder,
  getOrderStatusOnly,
} from "@/lib/queries/admin/order-detail";

const SHIPPABLE = new Set(["paid", "processing", "ready_to_ship"]);

export async function POST(req: NextRequest) {
  const admin = await getCurrentAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const ids = Array.isArray(body.order_ids)
    ? body.order_ids.map((x: number) => Number(x)).filter((x: number) => Number.isInteger(x) && x > 0)
    : [];
  const method = body.method as "pickup" | "drop_off" | "manual";

  if (ids.length === 0) {
    return NextResponse.json({ error: "Pilih minimal 1 pesanan" }, { status: 400 });
  }
  if (!["pickup", "drop_off", "manual"].includes(method)) {
    return NextResponse.json({ error: "Metode pengiriman tidak valid" }, { status: 400 });
  }

  const courierId = body.courier_id != null && body.courier_id !== ""
    ? Number(body.courier_id)
    : null;

  const results: { order_id: number; ok: boolean; error?: string }[] = [];
  for (const orderId of ids) {
    try {
      const order = await getOrderStatusOnly(orderId);
      if (!order) {
        results.push({ order_id: orderId, ok: false, error: "Order tidak ditemukan" });
        continue;
      }
      if (!SHIPPABLE.has(order.order_status)) {
        results.push({
          order_id: orderId,
          ok: false,
          error: `Status "${order.order_status}" tidak bisa dikirim`,
        });
        continue;
      }
      await createShipmentForOrder({
        orderId,
        courierId,
        method,
        trackingNumber: null,
        changedBy: admin.email,
        changedByName: admin.name,
      });
      results.push({ order_id: orderId, ok: true });
    } catch (e) {
      results.push({
        order_id: orderId,
        ok: false,
        error: (e as Error).message || "Gagal",
      });
    }
  }

  const successCount = results.filter((r) => r.ok).length;
  await writeAuditLog({
    adminId: admin.id,
    action: "bulk_ship_orders",
    entityType: "order",
    entityId: 0,
    newValues: { method, courier_id: courierId, success: successCount, failed: ids.length - successCount },
    ipAddress: req.headers.get("x-forwarded-for"),
  });

  return NextResponse.json({
    success: successCount,
    failed: ids.length - successCount,
    results,
  });
}
