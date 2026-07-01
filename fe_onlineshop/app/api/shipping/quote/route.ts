import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/user-auth";
import { getUserAddress } from "@/lib/queries/addresses";
import { getCartWeightGrams, resolveShippingQuote } from "@/lib/queries/shipping";

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
  const items = rawItems.map((it: Record<string, unknown>) => ({
    productId: Number(it.productId),
    variantId: it.variantId != null ? Number(it.variantId) : null,
    quantity: Number(it.quantity),
  }));
  const subtotal = Number(body.subtotal) || 0;

  if (items.length === 0 || items.some((it: { productId: number }) => !Number.isFinite(it.productId))) {
    return NextResponse.json({ error: "Keranjang tidak valid." }, { status: 400 });
  }

  const address = await getUserAddress(user.id, addressId);
  if (!address) {
    return NextResponse.json({ error: "Alamat tidak ditemukan." }, { status: 404 });
  }

  const weightGrams = await getCartWeightGrams(items);
  const quote = await resolveShippingQuote(address, subtotal, weightGrams);

  return NextResponse.json({ ok: true, quote });
}
