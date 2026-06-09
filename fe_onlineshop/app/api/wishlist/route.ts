import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/user-auth";
import {
  getUserWishlist,
  addToWishlist,
  removeFromWishlist,
} from "@/lib/queries/wishlist";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const items = await getUserWishlist(user.id);
  return NextResponse.json({ items });
}

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const body = await req.json().catch(() => ({}));
  const productId = Number(body.product_id);
  if (!Number.isFinite(productId) || productId <= 0) {
    return NextResponse.json({ error: "product_id tidak valid" }, { status: 400 });
  }
  const added = await addToWishlist(user.id, productId);
  return NextResponse.json({ ok: true, added });
}

export async function DELETE(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const body = await req.json().catch(() => ({}));
  const productId = Number(body.product_id);
  if (!Number.isFinite(productId) || productId <= 0) {
    return NextResponse.json({ error: "product_id tidak valid" }, { status: 400 });
  }
  const removed = await removeFromWishlist(user.id, productId);
  return NextResponse.json({ ok: true, removed });
}
