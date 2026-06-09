import { NextRequest, NextResponse } from "next/server";
import { getCurrentAdmin } from "@/lib/admin-auth";
import { writeAuditLog } from "@/lib/audit";
import {
  getProductDetail,
  setProductStatus,
  getProductImages,
} from "@/lib/queries/admin/products";

export async function POST(
  req: NextRequest,
  ctx: { params: Promise<{ id: string }> }
) {
  const admin = await getCurrentAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await ctx.params;
  const productId = Number(id);
  if (!Number.isInteger(productId) || productId <= 0) {
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  }

  const body = await req.json().catch(() => ({}));
  const target = body.status as "live" | "draft" | "archived";
  if (!["live", "draft", "archived"].includes(target)) {
    return NextResponse.json({ error: "Invalid target status" }, { status: 400 });
  }

  const product = await getProductDetail(productId);
  if (!product) return NextResponse.json({ error: "Product not found" }, { status: 404 });

  if (target === "live") {
    if (!product.name) {
      return NextResponse.json({ error: "Nama produk wajib diisi" }, { status: 400 });
    }
    const images = await getProductImages(productId);
    if (images.length === 0) {
      return NextResponse.json({ error: "Produk wajib punya minimal 1 foto" }, { status: 400 });
    }
    if (!product.has_variant && Number(product.base_price) <= 0) {
      return NextResponse.json({ error: "Atur harga produk dulu di tab Penjualan" }, { status: 400 });
    }
    if (product.weight_grams <= 0) {
      return NextResponse.json({ error: "Atur berat produk dulu di tab Pengiriman" }, { status: 400 });
    }
  }

  await setProductStatus(productId, target);

  await writeAuditLog({
    adminId: admin.id,
    action: `set_product_status_${target}`,
    entityType: "product",
    entityId: productId,
    oldValues: { status: product.status },
    newValues: { status: target },
    ipAddress: req.headers.get("x-forwarded-for"),
  });

  return NextResponse.json({ ok: true, status: target });
}
