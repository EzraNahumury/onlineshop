import { NextRequest, NextResponse } from "next/server";
import { getCurrentAdmin } from "@/lib/admin-auth";
import { writeAuditLog } from "@/lib/audit";
import {
  removeStoreItemRow,
  removeComboMainRow,
  removeComboAddonRow,
  removePackageItemRow,
  updateStoreItemRow,
  updateComboAddonRow,
  getPromotionDetail,
} from "@/lib/queries/admin/promotions";

type Kind = "store" | "combo_main" | "combo_addon" | "package";

function getKind(req: NextRequest): Kind | null {
  const k = new URL(req.url).searchParams.get("kind") as Kind;
  return ["store", "combo_main", "combo_addon", "package"].includes(k) ? k : null;
}

export async function DELETE(
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
  const kind = getKind(req);
  if (!kind) return NextResponse.json({ error: "kind query param required" }, { status: 400 });

  const promo = await getPromotionDetail(promoId);
  if (!promo) return NextResponse.json({ error: "Promo not found" }, { status: 404 });

  if (kind === "store") await removeStoreItemRow(itmId, promoId);
  else if (kind === "combo_main") await removeComboMainRow(itmId, promoId);
  else if (kind === "combo_addon") await removeComboAddonRow(itmId, promoId);
  else await removePackageItemRow(itmId, promoId);

  await writeAuditLog({
    adminId: admin.id,
    action: `remove_promotion_${kind}_item`,
    entityType: "promotion",
    entityId: promoId,
    oldValues: { item_id: itmId, kind },
    ipAddress: req.headers.get("x-forwarded-for"),
  });

  return NextResponse.json({ ok: true });
}

export async function PUT(
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
  const kind = getKind(req);
  if (!kind) return NextResponse.json({ error: "kind query param required" }, { status: 400 });

  const promo = await getPromotionDetail(promoId);
  if (!promo) return NextResponse.json({ error: "Promo not found" }, { status: 404 });
  if (promo.status === "ended" || promo.status === "cancelled") {
    return NextResponse.json(
      { error: "Promo yang sudah berakhir/dibatalkan tidak bisa diedit" },
      { status: 409 }
    );
  }

  const body = await req.json().catch(() => ({}));
  const original = Number(body.original_price);
  if (!Number.isFinite(original) || original <= 0) {
    return NextResponse.json({ error: "original_price tidak valid" }, { status: 400 });
  }

  if (kind === "store") {
    const discount = Number(body.discount_price);
    const stock = Number(body.promo_stock);
    const limit = body.purchase_limit != null && body.purchase_limit !== ""
      ? Number(body.purchase_limit)
      : null;
    if (!Number.isFinite(discount) || discount <= 0 || discount >= original) {
      return NextResponse.json({ error: "Harga diskon tidak valid" }, { status: 400 });
    }
    if (!Number.isInteger(stock) || stock <= 0) {
      return NextResponse.json({ error: "Stok promo harus > 0" }, { status: 400 });
    }
    if (limit !== null && (!Number.isInteger(limit) || limit < 1)) {
      return NextResponse.json({ error: "Batas pembelian harus ≥ 1" }, { status: 400 });
    }
    const percent = Math.round(((original - discount) / original) * 10000) / 100;
    await updateStoreItemRow(itmId, promoId, {
      discount_price: discount,
      discount_percent: percent,
      promo_stock: stock,
      purchase_limit: limit,
    });
  } else if (kind === "combo_addon") {
    const combo = Number(body.combo_price);
    const stock = Number(body.stock);
    const limit = body.purchase_limit != null && body.purchase_limit !== ""
      ? Number(body.purchase_limit)
      : null;
    if (!Number.isFinite(combo) || combo <= 0 || combo >= original) {
      return NextResponse.json({ error: "Harga kombo tidak valid" }, { status: 400 });
    }
    if (!Number.isInteger(stock) || stock <= 0) {
      return NextResponse.json({ error: "Stok harus > 0" }, { status: 400 });
    }
    const percent = Math.round(((original - combo) / original) * 10000) / 100;
    await updateComboAddonRow(itmId, promoId, {
      combo_price: combo,
      combo_discount_percent: percent,
      stock,
      purchase_limit: limit,
    });
  } else {
    return NextResponse.json(
      { error: "kind ini tidak mendukung edit per-item" },
      { status: 400 }
    );
  }

  await writeAuditLog({
    adminId: admin.id,
    action: `update_promotion_${kind}_item`,
    entityType: "promotion",
    entityId: promoId,
    newValues: { item_id: itmId, body },
    ipAddress: req.headers.get("x-forwarded-for"),
  });

  return NextResponse.json({ ok: true });
}
