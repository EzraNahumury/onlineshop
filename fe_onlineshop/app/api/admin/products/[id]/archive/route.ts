import { NextRequest, NextResponse } from "next/server";
import { getCurrentAdmin } from "@/lib/admin-auth";
import { writeAuditLog } from "@/lib/audit";
import { archiveProduct, findProductForAudit } from "@/lib/queries/admin/products";

export async function POST(
  req: NextRequest,
  ctx: { params: Promise<{ id: string }> }
) {
  const admin = await getCurrentAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await ctx.params;
  const productId = Number(id);
  if (!Number.isInteger(productId) || productId <= 0) {
    return NextResponse.json({ error: "Invalid product id" }, { status: 400 });
  }

  const before = await findProductForAudit(productId);
  if (!before) {
    return NextResponse.json({ error: "Product not found" }, { status: 404 });
  }
  if (before.status === "archived") {
    return NextResponse.json({ error: "Product already archived" }, { status: 409 });
  }

  await archiveProduct(productId);

  await writeAuditLog({
    adminId: admin.id,
    action: "archive_product",
    entityType: "product",
    entityId: productId,
    oldValues: { status: before.status, name: before.name },
    newValues: { status: "archived" },
    ipAddress: req.headers.get("x-forwarded-for") || null,
  });

  return NextResponse.json({ ok: true });
}
