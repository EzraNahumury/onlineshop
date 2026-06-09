import { NextRequest, NextResponse } from "next/server";
import { getCurrentAdmin } from "@/lib/admin-auth";
import { writeAuditLog } from "@/lib/audit";
import { createDraftProduct, addProductImage } from "@/lib/queries/admin/products";
import { saveProductImage, UploadError } from "@/lib/upload";

export async function POST(req: NextRequest) {
  const admin = await getCurrentAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const ct = req.headers.get("content-type") || "";
  if (!ct.includes("multipart/form-data")) {
    return NextResponse.json({ error: "Expected multipart/form-data" }, { status: 415 });
  }

  let formData: FormData;
  try {
    formData = await req.formData();
  } catch {
    return NextResponse.json({ error: "Invalid form data" }, { status: 400 });
  }

  const name = String(formData.get("name") || "").trim();
  const sku = String(formData.get("sku") || "").trim() || null;
  const gtin = String(formData.get("gtin") || "").trim() || null;
  const categoryRaw = String(formData.get("category_id") || "").trim();
  const category_id = categoryRaw ? Number(categoryRaw) : null;

  if (!name) {
    return NextResponse.json({ error: "Nama produk wajib diisi" }, { status: 400 });
  }
  if (name.length > 255) {
    return NextResponse.json({ error: "Nama produk terlalu panjang" }, { status: 400 });
  }
  if (category_id !== null && !Number.isFinite(category_id)) {
    return NextResponse.json({ error: "Kategori tidak valid" }, { status: 400 });
  }

  const productId = await createDraftProduct({
    name,
    sku,
    gtin,
    category_id,
    createdBy: admin.id,
  });

  const files = formData.getAll("images").filter((f): f is File => f instanceof File && f.size > 0);
  const uploadedUrls: string[] = [];
  try {
    for (const file of files) {
      const saved = await saveProductImage(file, productId);
      await addProductImage(productId, saved.publicUrl, null);
      uploadedUrls.push(saved.publicUrl);
    }
  } catch (err) {
    if (err instanceof UploadError) {
      return NextResponse.json(
        { error: err.message, productId },
        { status: 400 }
      );
    }
    throw err;
  }

  await writeAuditLog({
    adminId: admin.id,
    action: "create_product_draft",
    entityType: "product",
    entityId: productId,
    newValues: { name, sku, gtin, image_count: uploadedUrls.length },
    ipAddress: req.headers.get("x-forwarded-for"),
  });

  return NextResponse.json({ id: productId, uploadedUrls });
}
