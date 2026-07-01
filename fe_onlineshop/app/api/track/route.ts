import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { RowDataPacket } from "mysql2";
import { getCurrentUser } from "@/lib/user-auth";
import { trackJneShipment } from "@/lib/jne";

// Customer-scoped tracking lookup — only resolves a shipment that actually
// belongs to the logged-in user's own order, so this can't be used as an
// open proxy to probe arbitrary JNE AWB numbers.
export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Silakan login dulu." }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const orderNumber = String(body.order_number || "").trim();
  if (!orderNumber) return NextResponse.json({ error: "Order tidak valid." }, { status: 400 });

  const [rows] = await db.query<RowDataPacket[]>(
    `SELECT s.tracking_number, c.name AS courier_name
       FROM orders o
       JOIN shipments s ON s.order_id = o.id
       LEFT JOIN couriers c ON c.id = s.courier_id
      WHERE o.order_number = ? AND o.user_id = ?
      ORDER BY s.created_at DESC LIMIT 1`,
    [orderNumber, user.id]
  );

  const shipment = rows[0];
  if (!shipment?.tracking_number || shipment.courier_name !== "JNE") {
    return NextResponse.json({ error: "Belum ada resi JNE untuk pesanan ini." }, { status: 404 });
  }

  const tracking = await trackJneShipment(shipment.tracking_number);
  if (!tracking) {
    return NextResponse.json(
      { error: "Status pengiriman belum tersedia dari JNE saat ini." },
      { status: 502 }
    );
  }

  return NextResponse.json({ ok: true, tracking_number: shipment.tracking_number, tracking });
}
