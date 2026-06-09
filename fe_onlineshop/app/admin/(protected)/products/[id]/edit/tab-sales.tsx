"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { formatThousands, parseThousands } from "@/lib/utils";
import { VariantBuilder, type VariantBuilderState } from "@/components/admin/variant-builder";
import type { ProductDetail, ProductVariantRow } from "@/lib/queries/admin/products";

function makeKey(v1: string, v2: string) {
  return `${v1}__${v2}`;
}

function variantsToState(
  product: ProductDetail,
  variants: ProductVariantRow[]
): VariantBuilderState {
  if (variants.length === 0) {
    return {
      enabled: false,
      name1: "",
      options1: [""],
      name2: "",
      options2: [],
      rows: [],
    };
  }
  const name1 = variants[0].option_name_1 || "";
  const name2 = variants[0].option_name_2 || "";
  const options1 = Array.from(
    new Set(variants.map((v) => v.option_value_1 || "").filter(Boolean))
  );
  const options2 = Array.from(
    new Set(variants.map((v) => v.option_value_2 || "").filter(Boolean))
  );
  return {
    enabled: true,
    name1,
    options1,
    name2,
    options2,
    rows: variants.map((v) => ({
      key: makeKey(v.option_value_1 || "", v.option_value_2 || ""),
      id: v.id,
      option_name_1: v.option_name_1,
      option_value_1: v.option_value_1,
      option_name_2: v.option_name_2,
      option_value_2: v.option_value_2,
      price: Number(v.price),
      stock: v.stock,
      sku: v.sku || "",
      image_url: v.image_url,
    })),
  };
}

export function TabSales({
  product,
  variants,
}: {
  product: ProductDetail;
  variants: ProductVariantRow[];
}) {
  const router = useRouter();
  const [vb, setVb] = useState<VariantBuilderState>(() => variantsToState(product, variants));
  const [basePrice, setBasePrice] = useState<string>(
    !product.has_variant ? Number(product.base_price).toString() : ""
  );
  const [stock, setStock] = useState<string>(
    !product.has_variant ? product.stock.toString() : ""
  );
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<{ type: "ok" | "err"; text: string } | null>(null);

  async function handleSave() {
    setSaving(true);
    setMsg(null);
    try {
      if (vb.enabled) {
        if (vb.rows.length === 0) {
          setMsg({ type: "err", text: "Tambahkan minimal satu opsi variasi" });
          return;
        }
        const payload = vb.rows.map((r) => ({
          option_name_1: vb.name1 || null,
          option_value_1: r.option_value_1,
          option_name_2: vb.name2 || null,
          option_value_2: r.option_value_2,
          price: Number(r.price),
          stock: Number(r.stock),
          sku: r.sku || null,
          gtin: null,
          weight_grams: null,
        }));
        const res = await fetch(`/api/admin/products/${product.id}/variants`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ variants: payload }),
        });
        const data = await res.json();
        if (!res.ok) {
          setMsg({ type: "err", text: data.error || "Gagal menyimpan variasi" });
          return;
        }
      } else {
        const price = Number(basePrice);
        const stk = Number(stock);
        if (!Number.isFinite(price) || price <= 0) {
          setMsg({ type: "err", text: "Harga harus > 0" });
          return;
        }
        if (!Number.isInteger(stk) || stk < 0) {
          setMsg({ type: "err", text: "Stok harus angka bulat ≥ 0" });
          return;
        }
        const res = await fetch(`/api/admin/products/${product.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            section: "sales_simple",
            base_price: price,
            stock: stk,
          }),
        });
        const data = await res.json();
        if (!res.ok) {
          setMsg({ type: "err", text: data.error || "Gagal menyimpan" });
          return;
        }
      }
      setMsg({ type: "ok", text: "Tersimpan" });
      router.refresh();
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-base font-medium text-black mb-1">Informasi Penjualan</h2>
        <p className="text-xs text-neutral-500">
          Atur harga dan stok produk. Aktifkan variasi jika produk punya pilihan warna,
          ukuran, atau lainnya.
        </p>
      </div>

      <VariantBuilder
        initial={vb}
        productId={product.id}
        onChange={setVb}
        onImageUpdate={() => router.refresh()}
      />

      {!vb.enabled && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-5 border border-neutral-200 rounded-lg bg-white">
          <Input
            id="base_price"
            label="Harga (Rp) *"
            type="text"
            inputMode="numeric"
            value={formatThousands(basePrice)}
            onChange={(e) => setBasePrice(parseThousands(e.target.value))}
          />
          <Input
            id="stock"
            label="Stok *"
            type="number"
            min="0"
            step="1"
            value={stock}
            onChange={(e) => setStock(e.target.value)}
          />
        </div>
      )}

      <div className="flex items-center justify-end gap-3 pt-4 border-t border-neutral-200">
        {msg && (
          <span
            className={
              msg.type === "ok"
                ? "text-sm text-emerald-600"
                : "text-sm text-red-600"
            }
          >
            {msg.text}
          </span>
        )}
        <Button onClick={handleSave} loading={saving}>
          Simpan Perubahan
        </Button>
      </div>
    </div>
  );
}
