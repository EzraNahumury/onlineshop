import { NextRequest, NextResponse } from "next/server";
import { getCurrentAdmin } from "@/lib/admin-auth";
import { writeAuditLog } from "@/lib/audit";
import { createDisplayPromo, getTotalProductStock } from "@/lib/queries/admin/display-promos";
import { parseDisplayPromoBody } from "./validate";

export async function POST(req: NextRequest) {
  const admin = await getCurrentAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const parsed = parseDisplayPromoBody(body);
  if ("error" in parsed) {
    return NextResponse.json({ error: parsed.error }, { status: 400 });
  }

  if (parsed.value.stock != null) {
    const total = await getTotalProductStock(parsed.value.productIds);
    if (parsed.value.stock > total) {
      return NextResponse.json(
        { error: `Stok promo (${parsed.value.stock}) melebihi total stok produk yang dipilih (${total}).` },
        { status: 400 }
      );
    }
  }

  const id = await createDisplayPromo(parsed.value, admin.id);

  await writeAuditLog({
    adminId: admin.id,
    action: "create_display_promo",
    entityType: "display_promo",
    entityId: id,
    newValues: { title: parsed.value.title, type: parsed.value.discountType, value: parsed.value.discountValue },
    ipAddress: req.headers.get("x-forwarded-for"),
  });

  return NextResponse.json({ ok: true, id });
}
