import { db } from "@/lib/db";
import { RowDataPacket } from "mysql2";
import {
  getOrderDetail,
  getOrderItems,
  createShipmentForOrder,
  type AddressSnapshot,
} from "@/lib/queries/admin/order-detail";
import { resolveJneDestinationForAddress } from "@/lib/queries/jne-destinations";
import { getCartWeightGrams, JNE_ORIGIN_CODE } from "@/lib/queries/shipping";
import {
  createJnePickup,
  gramsToBillableKg,
  type JnePickupAddress,
} from "@/lib/jne";
import { SHOP_PROFILE } from "@/lib/shop-profile";

export interface CreateJneShipmentInput {
  orderId: number;
  pickupDate: string; // DD-MM-YYYY
  pickupTime: string; // HH:MM (24h)
  pickupVehicle: "Motor" | "Mobil" | "Truck";
  type: "PICKUP" | "DROP";
  changedBy: string;
  changedByName?: string | null;
}

// Builds the full Pickup/Cashless payload from an existing order (address,
// items, the JNE service already chosen at checkout) and the shop's own
// shipper profile, calls JNE to mint a real AWB, then records the shipment
// exactly like the manual "Atur Pengiriman" flow does.
export async function createJneShipmentForOrder(
  input: CreateJneShipmentInput
): Promise<{ shipmentId: number; cnoteNo: string }> {
  const order = await getOrderDetail(input.orderId);
  if (!order) throw new Error("Order tidak ditemukan.");

  const address: AddressSnapshot =
    typeof order.address_snapshot === "string"
      ? JSON.parse(order.address_snapshot)
      : order.address_snapshot;

  if (!address?.city) {
    throw new Error("Alamat pengiriman pada order ini tidak lengkap.");
  }

  const destination = await resolveJneDestinationForAddress({
    city: address.city,
    district: address.district ?? null,
  });
  if (!destination) {
    throw new Error(
      `Kode tujuan JNE untuk "${address.city}${address.district ? `, ${address.district}` : ""}" belum terdaftar. Tambahkan dulu di Master > Kode Tujuan JNE.`
    );
  }

  const serviceCode = order.shipping_service_code;
  if (!serviceCode) {
    throw new Error(
      "Order ini tidak memakai layanan JNE spesifik (ongkir gratis/flat) — gunakan metode pengiriman manual untuk order ini."
    );
  }

  const itemRows = await getOrderItems(input.orderId);
  if (itemRows.length === 0) throw new Error("Order tidak punya item.");

  const weightGrams = await getCartWeightGrams(
    itemRows.map((it) => ({
      productId: it.product_id,
      variantId: it.variant_id,
      quantity: it.quantity,
    }))
  );
  const weightKg = gramsToBillableKg(weightGrams);
  const qty = itemRows.reduce((sum, it) => sum + it.quantity, 0);
  const goodsDesc = itemRows.map((it) => it.product_name).join(", ").slice(0, 60);

  const shipper: JnePickupAddress = {
    name: SHOP_PROFILE.name,
    addr1: SHOP_PROFILE.addr1,
    addr2: SHOP_PROFILE.addr2,
    city: SHOP_PROFILE.city,
    zip: SHOP_PROFILE.zip,
    region: SHOP_PROFILE.region,
    contact: SHOP_PROFILE.contact,
    phone: SHOP_PROFILE.phone,
  };

  const receiver: JnePickupAddress = {
    name: address.receiver_name || order.user_name || "Pelanggan",
    addr1: address.address_line || "-",
    addr2: address.address_detail || "",
    city: address.city,
    zip: address.postal_code || "00000",
    region: address.province || "",
    contact: address.receiver_name || order.user_name || "Pelanggan",
    phone: address.phone || order.user_phone || "-",
  };

  const result = await createJnePickup({
    orderId: order.order_number,
    pickupDate: input.pickupDate,
    pickupTime: input.pickupTime,
    pickupDistrict: SHOP_PROFILE.district,
    pickupCity: SHOP_PROFILE.city,
    pickupVehicle: input.pickupVehicle,
    type: input.type,
    shipper,
    receiver,
    originCode: JNE_ORIGIN_CODE,
    destinationCode: destination.jne_code,
    serviceCode,
    weightKg,
    qty,
    goodsDesc: goodsDesc || "Paket",
    goodsAmount: Number(order.subtotal),
  });

  const [courierRows] = await db.query<RowDataPacket[]>(
    `SELECT id FROM couriers WHERE code = 'jne' LIMIT 1`
  );
  const courierId = (courierRows[0]?.id as number) ?? null;

  const shipmentId = await createShipmentForOrder({
    orderId: input.orderId,
    courierId,
    method: input.type === "PICKUP" ? "pickup" : "drop_off",
    trackingNumber: result.cnoteNo,
    changedBy: input.changedBy,
    changedByName: input.changedByName,
  });

  return { shipmentId, cnoteNo: result.cnoteNo };
}
