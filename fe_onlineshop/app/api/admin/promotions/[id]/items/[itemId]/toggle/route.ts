import { NextRequest, NextResponse } from "next/server";
import { getCurrentAdmin } from "@/lib/admin-auth";
import { writeAuditLog } from "@/lib/audit";
import {
  setStoreItemActive,
  setComboAddonActive,
  setPackageItemActive,
} from "@/lib/queries/admin/promotions";

export async function POST(
  req: NextRequest,
  ctx: { params: Promise<{ id: string; itemId: string }> }
) {
  const admin = await getCurrentAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id, itemId } = await ctx.params;
  const promoId = Number(id);
  const itmId = Number(itemId);
  if (!Number.isInteger(promoId) || !Number.isInteger(itmId)) {
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  }

  const body = await req.json().catch(() => ({}));
  const kind = String(body.kind || "");
  const active = !!body.is_active;

  if (kind === "store") await setStoreItemActive(itmId, active);
  else if (kind === "combo_addon") await setComboAddonActive(itmId, active);
  else if (kind === "package") await setPackageItemActive(itmId, active);
  else return NextResponse.json({ error: "Unknown item kind" }, { status: 400 });

  await writeAuditLog({
    adminId: admin.id,
    action: "toggle_promotion_item",
    entityType: "promotion",
    entityId: promoId,
    newValues: { item_kind: kind, item_id: itmId, is_active: active },
    ipAddress: req.headers.get("x-forwarded-for"),
  });

  return NextResponse.json({ ok: true });
}
