import { NextRequest, NextResponse } from "next/server";
import { getCurrentAdmin } from "@/lib/admin-auth";
import { writeAuditLog } from "@/lib/audit";
import {
  getProductDetail,
  updateProductBasic,
  setProductPriceAndStock,
} from "@/lib/queries/admin/products";

export async function PUT(
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

  const before = await getProductDetail(productId);
  if (!before) return NextResponse.json({ error: "Product not found" }, { status: 404 });

  const body = await req.json().catch(() => ({}));
  const section = body.section as string;

  if (section === "info") {
    const name = typeof body.name === "string" ? body.name.trim() : undefined;
    if (name !== undefined && name.length === 0) {
      return NextResponse.json({ error: "Nama tidak boleh kosong" }, { status: 400 });
    }
    await updateProductBasic(productId, {
      name,
      category_id: body.category_id ? Number(body.category_id) : null,
      brand_id: body.brand_id ? Number(body.brand_id) : null,
      sku: typeof body.sku === "string" ? body.sku.trim() || null : undefined,
      gtin: typeof body.gtin === "string" ? body.gtin.trim() || null : undefined,
      updatedBy: admin.id,
    });
  } else if (section === "description") {
    const description = typeof body.description === "string" ? body.description : "";
    if (description.length > 5000) {
      return NextResponse.json({ error: "Deskripsi maksimal 5000 karakter" }, { status: 400 });
    }
    await updateProductBasic(productId, {
      description,
      updatedBy: admin.id,
    });
  } else if (section === "sales_simple") {
    const price = Number(body.base_price);
    const stock = Number(body.stock);
    if (!Number.isFinite(price) || price <= 0) {
      return NextResponse.json({ error: "Harga harus lebih dari 0" }, { status: 400 });
    }
    if (!Number.isInteger(stock) || stock < 0) {
      return NextResponse.json({ error: "Stok harus angka bulat ≥ 0" }, { status: 400 });
    }
    await setProductPriceAndStock(productId, { base_price: price, stock });
  } else {
    return NextResponse.json({ error: "Unknown section" }, { status: 400 });
  }

  const after = await getProductDetail(productId);

  await writeAuditLog({
    adminId: admin.id,
    action: `update_product_${section}`,
    entityType: "product",
    entityId: productId,
    oldValues: pickAuditFields(before),
    newValues: pickAuditFields(after),
    ipAddress: req.headers.get("x-forwarded-for"),
  });

  return NextResponse.json({ ok: true });
}

function pickAuditFields(p: Awaited<ReturnType<typeof getProductDetail>>) {
  if (!p) return null;
  return {
    name: p.name,
    category_id: p.category_id,
    brand_id: p.brand_id,
    sku: p.sku,
    gtin: p.gtin,
    description: p.description,
    base_price: p.base_price,
    stock: p.stock,
    has_variant: p.has_variant,
  };
}
