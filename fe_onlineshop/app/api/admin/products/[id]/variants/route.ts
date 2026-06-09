import { NextRequest, NextResponse } from "next/server";
import { getCurrentAdmin } from "@/lib/admin-auth";
import { writeAuditLog } from "@/lib/audit";
import { replaceVariants, productExists, type VariantInput } from "@/lib/queries/admin/products";

export async function PUT(
  req: NextRequest,
  ctx: { params: Promise<{ id: string }> }
) {
  const admin = await getCurrentAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await ctx.params;
  const productId = Number(id);
  if (!Number.isInteger(productId) || productId <= 0) {
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  }

  const exists = await productExists(productId);
  if (!exists) return NextResponse.json({ error: "Product not found" }, { status: 404 });

  const body = await req.json().catch(() => ({}));
  const variantsInput = Array.isArray(body.variants) ? body.variants : null;
  if (!variantsInput) {
    return NextResponse.json({ error: "variants array required" }, { status: 400 });
  }

  const variants: VariantInput[] = [];
  const seen = new Set<string>();
  for (let i = 0; i < variantsInput.length; i++) {
    const v = variantsInput[i];
    const price = Number(v.price);
    const stock = Number(v.stock);
    if (!Number.isFinite(price) || price <= 0) {
      return NextResponse.json(
        { error: `Harga variasi #${i + 1} harus > 0` },
        { status: 400 }
      );
    }
    if (!Number.isInteger(stock) || stock < 0) {
      return NextResponse.json(
        { error: `Stok variasi #${i + 1} harus angka bulat ≥ 0` },
        { status: 400 }
      );
    }
    const optionName1 = v.option_name_1 ? String(v.option_name_1).trim() : null;
    const optionValue1 = v.option_value_1 ? String(v.option_value_1).trim() : null;
    const optionName2 = v.option_name_2 ? String(v.option_name_2).trim() : null;
    const optionValue2 = v.option_value_2 ? String(v.option_value_2).trim() : null;

    if (!optionValue1) {
      return NextResponse.json(
        { error: `Variasi #${i + 1} harus punya nilai opsi pertama` },
        { status: 400 }
      );
    }

    const key = `${optionValue1}__${optionValue2 || ""}`;
    if (seen.has(key)) {
      return NextResponse.json(
        { error: `Kombinasi variasi duplikat: ${optionValue1}${optionValue2 ? " / " + optionValue2 : ""}` },
        { status: 400 }
      );
    }
    seen.add(key);

    variants.push({
      sku: v.sku ? String(v.sku).trim() : null,
      gtin: v.gtin ? String(v.gtin).trim() : null,
      option_name_1: optionName1,
      option_value_1: optionValue1,
      option_name_2: optionName2,
      option_value_2: optionValue2,
      price,
      stock,
      weight_grams: v.weight_grams != null ? Number(v.weight_grams) : null,
    });
  }

  await replaceVariants(productId, variants);

  await writeAuditLog({
    adminId: admin.id,
    action: "replace_product_variants",
    entityType: "product",
    entityId: productId,
    newValues: { count: variants.length },
    ipAddress: req.headers.get("x-forwarded-for"),
  });

  return NextResponse.json({ ok: true, count: variants.length });
}
