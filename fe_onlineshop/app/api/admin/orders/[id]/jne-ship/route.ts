import { NextRequest, NextResponse } from "next/server";
import { getCurrentAdmin } from "@/lib/admin-auth";
import { writeAuditLog } from "@/lib/audit";
import { getOrderStatusOnly } from "@/lib/queries/admin/order-detail";
import { createJneShipmentForOrder } from "@/lib/queries/admin/jne-shipping";
import { isJnePickupConfigured, JnePickupError } from "@/lib/jne";
import { isShopProfileComplete } from "@/lib/shop-profile";

const SHIPPABLE = new Set(["paid", "processing", "ready_to_ship"]);

const DATE_RE = /^\d{2}-\d{2}-\d{4}$/;
const TIME_RE = /^\d{2}:\d{2}$/;

export async function POST(
  req: NextRequest,
  ctx: { params: Promise<{ id: string }> }
) {
  const admin = await getCurrentAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  if (!isJnePickupConfigured()) {
    return NextResponse.json(
      {
        error:
          "JNE_CUST_ID_REG / JNE_MERCHANT_ID belum diisi di server. Set dulu di environment lalu restart/redeploy.",
      },
      { status: 503 }
    );
  }

  if (!isShopProfileComplete()) {
    return NextResponse.json(
      {
        error:
          "Alamat gudang pengirim belum lengkap (SHOP_PHONE / SHOP_ADDRESS_1 / SHOP_ZIP). Isi dengan alamat gudang ASLI di environment dulu — kalau tidak, kurir bisa dijemput ke alamat yang salah.",
      },
      { status: 503 }
    );
  }

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
  const pickupDate = String(body.pickup_date || "");
  const pickupTime = String(body.pickup_time || "");
  const pickupVehicle = body.pickup_vehicle as "Motor" | "Mobil" | "Truck";
  const type = body.type as "PICKUP" | "DROP";

  if (!DATE_RE.test(pickupDate)) {
    return NextResponse.json({ error: "Tanggal jemput tidak valid (format DD-MM-YYYY)." }, { status: 400 });
  }
  if (!TIME_RE.test(pickupTime)) {
    return NextResponse.json({ error: "Jam jemput tidak valid (format HH:MM)." }, { status: 400 });
  }
  if (!["Motor", "Mobil", "Truck"].includes(pickupVehicle)) {
    return NextResponse.json({ error: "Kendaraan tidak valid." }, { status: 400 });
  }
  if (!["PICKUP", "DROP"].includes(type)) {
    return NextResponse.json({ error: "Tipe pengiriman tidak valid." }, { status: 400 });
  }

  try {
    const { shipmentId, cnoteNo } = await createJneShipmentForOrder({
      orderId,
      pickupDate,
      pickupTime,
      pickupVehicle,
      type,
      changedBy: admin.email,
      changedByName: admin.name,
    });

    await writeAuditLog({
      adminId: admin.id,
      action: "jne_create_shipment",
      entityType: "order",
      entityId: orderId,
      oldValues: { order_status: order.order_status },
      newValues: { order_status: "shipped", courier: "jne", type, tracking_number: cnoteNo },
      ipAddress: req.headers.get("x-forwarded-for"),
    });

    return NextResponse.json({ ok: true, shipment_id: shipmentId, tracking_number: cnoteNo });
  } catch (err) {
    const message =
      err instanceof JnePickupError || err instanceof Error ? err.message : "Gagal membuat resi JNE.";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
