import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/user-auth";
import {
  createOrderFromCart,
  CheckoutError,
  type CheckoutItemInput,
} from "@/lib/queries/checkout";

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Silakan login dulu." }, { status: 401 });
  }

  const body = await req.json().catch(() => ({}));
  const addressId = Number(body.address_id);
  if (!Number.isInteger(addressId) || addressId <= 0) {
    return NextResponse.json({ error: "Pilih alamat pengiriman." }, { status: 400 });
  }

  const rawItems = Array.isArray(body.items) ? body.items : [];
  const items: CheckoutItemInput[] = rawItems.map((it: Record<string, unknown>) => ({
    productId: Number(it.productId),
    variantId: it.variantId != null ? Number(it.variantId) : null,
    quantity: Number(it.quantity),
  }));

  if (items.length === 0 || items.some((it) => !Number.isFinite(it.productId))) {
    return NextResponse.json({ error: "Keranjang tidak valid." }, { status: 400 });
  }

  const shippingServiceCode =
    typeof body.shipping_service_code === "string" && body.shipping_service_code.trim()
      ? body.shipping_service_code.trim()
      : null;

  try {
    const result = await createOrderFromCart(user.id, addressId, items, shippingServiceCode);
    return NextResponse.json({
      ok: true,
      order_number: result.orderNumber,
      grand_total: result.grandTotal,
    });
  } catch (err) {
    if (err instanceof CheckoutError) {
      return NextResponse.json({ error: err.message }, { status: 400 });
    }
    console.error("Checkout failed:", err);
    return NextResponse.json(
      { error: "Gagal membuat pesanan. Coba lagi." },
      { status: 500 }
    );
  }
}
