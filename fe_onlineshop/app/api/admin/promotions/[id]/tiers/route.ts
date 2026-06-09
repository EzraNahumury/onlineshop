import { NextRequest, NextResponse } from "next/server";
import { getCurrentAdmin } from "@/lib/admin-auth";
import { writeAuditLog } from "@/lib/audit";
import {
  replacePackageTiers,
  getPromotionDetail,
  type PackageTierInput,
} from "@/lib/queries/admin/promotions";

export async function PUT(
  req: NextRequest,
  ctx: { params: Promise<{ id: string }> }
) {
  const admin = await getCurrentAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await ctx.params;
  const promoId = Number(id);
  if (!Number.isInteger(promoId) || promoId <= 0) {
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  }

  const promo = await getPromotionDetail(promoId);
  if (!promo) return NextResponse.json({ error: "Promo not found" }, { status: 404 });
  if (promo.type !== "package_discount") {
    return NextResponse.json({ error: "Tiers hanya untuk paket diskon" }, { status: 400 });
  }
  if (promo.status === "ended" || promo.status === "cancelled") {
    return NextResponse.json(
      { error: "Promo yang sudah berakhir/dibatalkan tidak bisa diedit" },
      { status: 409 }
    );
  }

  const body = await req.json().catch(() => ({}));
  const tiersRaw = Array.isArray(body.tiers) ? body.tiers : [];
  if (tiersRaw.length === 0) {
    return NextResponse.json({ error: "Minimal 1 tingkatan" }, { status: 400 });
  }

  const tiers: PackageTierInput[] = [];
  const seen = new Set<number>();
  for (let i = 0; i < tiersRaw.length; i++) {
    const t = tiersRaw[i];
    const minQty = Number(t.min_quantity);
    const dType = String(t.discount_type) as PackageTierInput["discount_type"];
    const dValue = Number(t.discount_value);
    if (!Number.isInteger(minQty) || minQty < 1) {
      return NextResponse.json({ error: `Tingkatan #${i + 1}: min jumlah harus ≥ 1` }, { status: 400 });
    }
    if (seen.has(minQty)) {
      return NextResponse.json({ error: `Min jumlah ${minQty} duplikat` }, { status: 400 });
    }
    seen.add(minQty);
    if (!["percentage", "fixed_amount", "fixed_price"].includes(dType)) {
      return NextResponse.json({ error: `Tingkatan #${i + 1}: jenis tidak valid` }, { status: 400 });
    }
    if (!Number.isFinite(dValue) || dValue <= 0) {
      return NextResponse.json({ error: `Tingkatan #${i + 1}: nilai > 0` }, { status: 400 });
    }
    if (dType === "percentage" && dValue > 100) {
      return NextResponse.json({ error: `Tingkatan #${i + 1}: % maks 100` }, { status: 400 });
    }
    tiers.push({
      min_quantity: minQty,
      discount_type: dType,
      discount_value: dValue,
      sort_order: i,
    });
  }

  await replacePackageTiers(promoId, tiers);

  await writeAuditLog({
    adminId: admin.id,
    action: "replace_promotion_tiers",
    entityType: "promotion",
    entityId: promoId,
    newValues: { count: tiers.length },
    ipAddress: req.headers.get("x-forwarded-for"),
  });

  return NextResponse.json({ ok: true, count: tiers.length });
}
