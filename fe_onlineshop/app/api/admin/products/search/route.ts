import { NextRequest, NextResponse } from "next/server";
import { getCurrentAdmin } from "@/lib/admin-auth";
import { searchProductsForPicker } from "@/lib/queries/admin/products";

export async function GET(req: NextRequest) {
  const admin = await getCurrentAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const url = new URL(req.url);
  const q = url.searchParams.get("q") || "";
  const limit = Math.min(60, Math.max(1, Number(url.searchParams.get("limit")) || 30));
  const products = await searchProductsForPicker(q, limit);
  return NextResponse.json({ products });
}
