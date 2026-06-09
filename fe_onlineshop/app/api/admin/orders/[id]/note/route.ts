import { NextRequest, NextResponse } from "next/server";
import { getCurrentAdmin } from "@/lib/admin-auth";
import { writeAuditLog } from "@/lib/audit";
import { updateOrderAdminNote } from "@/lib/queries/admin/order-detail";

export async function POST(
  req: NextRequest,
  ctx: { params: Promise<{ id: string }> }
) {
  const admin = await getCurrentAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await ctx.params;
  const orderId = Number(id);
  if (!Number.isInteger(orderId) || orderId <= 0) {
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  }

  const body = await req.json().catch(() => ({}));
  const note = typeof body.note === "string" && body.note.trim() ? body.note.trim() : null;

  await updateOrderAdminNote(orderId, note);

  await writeAuditLog({
    adminId: admin.id,
    action: "update_order_admin_note",
    entityType: "order",
    entityId: orderId,
    newValues: { admin_note: note },
    ipAddress: req.headers.get("x-forwarded-for"),
  });

  return NextResponse.json({ ok: true });
}
