import { NextRequest, NextResponse } from "next/server";
import { getCurrentAdmin } from "@/lib/admin-auth";
import { writeAuditLog } from "@/lib/audit";
import {
  insertStoreItems,
  insertComboMain,
  insertComboAddons,
  insertPackageItems,
  getPromotionDetail,
  type StoreItemInput,
  type ComboAddonInput,
} from "@/lib/queries/admin/promotions";
import { getProductsByIds } from "@/lib/queries/admin/products";

type Kind = "store" | "combo_main" | "combo_addon" | "package";

export async function POST(
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
  if (promo.status === "ended" || promo.status === "cancelled") {
    return NextResponse.json(
      { error: "Promo yang sudah berakhir/dibatalkan tidak bisa diedit" },
      { status: 409 }
    );
  }

  const body = await req.json().catch(() => ({}));
  const kind = body.kind as Kind;
  if (!["store", "combo_main", "combo_addon", "package"].includes(kind)) {
    return NextResponse.json({ error: "Kind tidak valid" }, { status: 400 });
  }

  const expectedType =
    kind === "store" ? "store_promo" : kind === "package" ? "package_discount" : "combo_deal";
  if (promo.type !== expectedType) {
    return NextResponse.json(
      { error: `Item kind "${kind}" tidak sesuai dengan tipe promo` },
      { status: 400 }
    );
  }

  if (kind === "combo_main" || kind === "package") {
    const productIds: number[] = Array.isArray(body.product_ids)
      ? body.product_ids
          .map((x: number) => Number(x))
          .filter((x: number) => Number.isInteger(x) && x > 0)
      : [];
    if (productIds.length === 0) {
      return NextResponse.json({ error: "Tambahkan minimal 1 produk" }, { status: 400 });
    }
    const products = await getProductsByIds(productIds);
    if (products.length !== productIds.length) {
      return NextResponse.json({ error: "Sebagian produk tidak ditemukan" }, { status: 400 });
    }
    if (kind === "combo_main") {
      await insertComboMain(promoId, productIds);
    } else {
      await insertPackageItems(promoId, productIds);
    }
    await writeAuditLog({
      adminId: admin.id,
      action: `add_promotion_${kind}_items`,
      entityType: "promotion",
      entityId: promoId,
      newValues: { product_ids: productIds },
      ipAddress: req.headers.get("x-forwarded-for"),
    });
    return NextResponse.json({ ok: true, added: productIds.length });
  }

  const itemsRaw = Array.isArray(body.items) ? body.items : [];
  if (itemsRaw.length === 0) {
    return NextResponse.json({ error: "Tambahkan minimal 1 item" }, { status: 400 });
  }
  const productIds: number[] = Array.from(
    new Set(itemsRaw.map((i: { product_id: number }) => Number(i.product_id)))
  );
  const products = await getProductsByIds(productIds);
  const productMap = new Map(products.map((p) => [p.id, p]));

  if (kind === "store") {
    const items: StoreItemInput[] = [];
    for (const it of itemsRaw) {
      const productId = Number(it.product_id);
      const product = productMap.get(productId);
      if (!product) {
        return NextResponse.json({ error: `Produk #${productId} tidak ditemukan` }, { status: 400 });
      }
      const original = Number(product.base_price);
      const discount = Number(it.discount_price);
      const stock = Number(it.promo_stock);
      if (!Number.isFinite(discount) || discount <= 0 || discount >= original) {
        return NextResponse.json(
          { error: `Harga diskon ${product.name} tidak valid` },
          { status: 400 }
        );
      }
      if (!Number.isInteger(stock) || stock <= 0 || stock > product.stock) {
        return NextResponse.json(
          { error: `Stok promo ${product.name} tidak valid (max ${product.stock})` },
          { status: 400 }
        );
      }
      items.push({
        product_id: productId,
        variant_id: null,
        original_price: original,
        discount_price: discount,
        discount_percent: Math.round(((original - discount) / original) * 10000) / 100,
        promo_stock: stock,
        purchase_limit: it.purchase_limit ? Number(it.purchase_limit) : null,
        is_active: it.is_active !== false,
      });
    }
    await insertStoreItems(promoId, items);
    await writeAuditLog({
      adminId: admin.id,
      action: "add_promotion_store_items",
      entityType: "promotion",
      entityId: promoId,
      newValues: { added: items.length },
      ipAddress: req.headers.get("x-forwarded-for"),
    });
    return NextResponse.json({ ok: true, added: items.length });
  }

  // combo_addon
  const addons: ComboAddonInput[] = [];
  for (const a of itemsRaw) {
    const productId = Number(a.product_id);
    const product = productMap.get(productId);
    if (!product) {
      return NextResponse.json({ error: `Produk #${productId} tidak ditemukan` }, { status: 400 });
    }
    const original = Number(product.base_price);
    const combo = Number(a.combo_price);
    const stock = Number(a.stock);
    if (!Number.isFinite(combo) || combo <= 0 || combo >= original) {
      return NextResponse.json(
        { error: `Harga kombo ${product.name} tidak valid` },
        { status: 400 }
      );
    }
    if (!Number.isInteger(stock) || stock <= 0) {
      return NextResponse.json({ error: `Stok ${product.name} harus > 0` }, { status: 400 });
    }
    addons.push({
      product_id: productId,
      variant_id: null,
      original_price: original,
      combo_price: combo,
      combo_discount_percent: Math.round(((original - combo) / original) * 10000) / 100,
      stock,
      purchase_limit: a.purchase_limit ? Number(a.purchase_limit) : null,
      is_active: a.is_active !== false,
    });
  }
  await insertComboAddons(promoId, addons);
  await writeAuditLog({
    adminId: admin.id,
    action: "add_promotion_combo_addons",
    entityType: "promotion",
    entityId: promoId,
    newValues: { added: addons.length },
    ipAddress: req.headers.get("x-forwarded-for"),
  });
  return NextResponse.json({ ok: true, added: addons.length });
}
