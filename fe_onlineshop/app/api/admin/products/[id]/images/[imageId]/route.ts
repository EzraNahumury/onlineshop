import { NextRequest, NextResponse } from "next/server";
import { getCurrentAdmin } from "@/lib/admin-auth";
import { writeAuditLog } from "@/lib/audit";
import { deleteProductImage, setPrimaryImage } from "@/lib/queries/admin/products";

export async function DELETE(
  req: NextRequest,
  ctx: { params: Promise<{ id: string; imageId: string }> }
) {
  const admin = await getCurrentAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id, imageId } = await ctx.params;
  const productId = Number(id);
  const imgId = Number(imageId);
  if (!Number.isInteger(productId) || !Number.isInteger(imgId)) {
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  }

  await deleteProductImage(productId, imgId);

  await writeAuditLog({
    adminId: admin.id,
    action: "delete_product_image",
    entityType: "product",
    entityId: productId,
    oldValues: { image_id: imgId },
    ipAddress: req.headers.get("x-forwarded-for"),
  });

  return NextResponse.json({ ok: true });
}

export async function PUT(
  req: NextRequest,
  ctx: { params: Promise<{ id: string; imageId: string }> }
) {
  const admin = await getCurrentAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id, imageId } = await ctx.params;
  const productId = Number(id);
  const imgId = Number(imageId);
  if (!Number.isInteger(productId) || !Number.isInteger(imgId)) {
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  }

  await setPrimaryImage(productId, imgId);

  await writeAuditLog({
    adminId: admin.id,
    action: "set_primary_image",
    entityType: "product",
    entityId: productId,
    newValues: { primary_image_id: imgId },
    ipAddress: req.headers.get("x-forwarded-for"),
  });

  return NextResponse.json({ ok: true });
}
