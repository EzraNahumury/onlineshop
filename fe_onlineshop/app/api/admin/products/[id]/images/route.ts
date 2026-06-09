import { NextRequest, NextResponse } from "next/server";
import { getCurrentAdmin } from "@/lib/admin-auth";
import { writeAuditLog } from "@/lib/audit";
import { addProductImage, productExists } from "@/lib/queries/admin/products";
import { saveProductImage, UploadError } from "@/lib/upload";

export async function POST(
  req: NextRequest,
  ctx: { params: Promise<{ id: string }> }
) {
  const admin = await getCurrentAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await ctx.params;
  const productId = Number(id);
  if (!Number.isInteger(productId) || productId <= 0) {
    return NextResponse.json({ error: "Invalid product id" }, { status: 400 });
  }

  const exists = await productExists(productId);
  if (!exists) return NextResponse.json({ error: "Product not found" }, { status: 404 });

  let formData: FormData;
  try {
    formData = await req.formData();
  } catch {
    return NextResponse.json({ error: "Invalid form data" }, { status: 400 });
  }

  const files = formData.getAll("images").filter((f): f is File => f instanceof File && f.size > 0);
  if (files.length === 0) {
    return NextResponse.json({ error: "Tidak ada file yang dikirim" }, { status: 400 });
  }

  const saved: { id: number; url: string }[] = [];
  try {
    for (const file of files) {
      const out = await saveProductImage(file, productId);
      const imageId = await addProductImage(productId, out.publicUrl, null);
      saved.push({ id: imageId, url: out.publicUrl });
    }
  } catch (err) {
    if (err instanceof UploadError) {
      return NextResponse.json({ error: err.message }, { status: 400 });
    }
    throw err;
  }

  await writeAuditLog({
    adminId: admin.id,
    action: "upload_product_images",
    entityType: "product",
    entityId: productId,
    newValues: { added: saved.map((s) => s.url) },
    ipAddress: req.headers.get("x-forwarded-for"),
  });

  return NextResponse.json({ images: saved });
}
