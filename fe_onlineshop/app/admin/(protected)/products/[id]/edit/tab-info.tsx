"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ImageUploader } from "@/components/admin/image-uploader";
import type { ProductDetail, ProductImageRow } from "@/lib/queries/admin/products";
import type { CategoryRow } from "@/lib/queries/admin/categories";
import type { BrandRow } from "@/lib/queries/admin/brands";

export function TabInfo({
  product,
  images,
  categories,
  brands,
}: {
  product: ProductDetail;
  images: ProductImageRow[];
  categories: CategoryRow[];
  brands: BrandRow[];
}) {
  const router = useRouter();
  const [name, setName] = useState(product.name);
  const [categoryId, setCategoryId] = useState<string>(product.category_id?.toString() || "");
  const [brandId, setBrandId] = useState<string>(product.brand_id?.toString() || "");

  const categoryGroups = useMemo(() => {
    const parents = categories.filter((c) => c.parent_id === null);
    return parents.map((parent) => ({
      parent,
      children: categories.filter((c) => c.parent_id === parent.id),
    }));
  }, [categories]);
  const [sku, setSku] = useState(product.sku || "");
  const [gtin, setGtin] = useState(product.gtin || "");
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<{ type: "ok" | "err"; text: string } | null>(null);

  async function handleSave() {
    setSaving(true);
    setMsg(null);
    try {
      const res = await fetch(`/api/admin/products/${product.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          section: "info",
          name,
          category_id: categoryId ? Number(categoryId) : null,
          brand_id: brandId ? Number(brandId) : null,
          sku,
          gtin,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setMsg({ type: "err", text: data.error || "Gagal menyimpan" });
        return;
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
        <h2 className="text-base font-medium text-black mb-1">Foto Produk</h2>
        <p className="text-xs text-neutral-500 mb-3">
          Tampilan visual produk Anda di etalase. Foto utama tampil pertama.
        </p>
        <ImageUploader productId={product.id} images={images} />
      </div>

      <div className="border-t border-neutral-200 pt-6 space-y-4">
        <h2 className="text-base font-medium text-black">Informasi Dasar</h2>

        <Input
          id="name"
          label="Nama Produk *"
          value={name}
          onChange={(e) => setName(e.target.value)}
          maxLength={255}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-neutral-700">Kategori</label>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="h-11 rounded-lg border border-neutral-300 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
            >
              <option value="">— Pilih kategori —</option>
              {categoryGroups.map(({ parent, children }) =>
                children.length === 0 ? (
                  <option key={parent.id} value={parent.id}>
                    {parent.name}
                  </option>
                ) : (
                  <optgroup key={parent.id} label={parent.name}>
                    <option value={parent.id}>{parent.name} (semua)</option>
                    {children.map((c) => (
                      <option key={c.id} value={c.id}>
                        &nbsp;&nbsp;{c.name}
                      </option>
                    ))}
                  </optgroup>
                )
              )}
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-neutral-700">Brand</label>
            <select
              value={brandId}
              onChange={(e) => setBrandId(e.target.value)}
              className="h-11 rounded-lg border border-neutral-300 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
            >
              <option value="">— Tanpa brand —</option>
              {brands.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            id="sku"
            label="SKU"
            value={sku}
            onChange={(e) => setSku(e.target.value)}
          />
          <Input
            id="gtin"
            label="GTIN / Barcode"
            value={gtin}
            onChange={(e) => setGtin(e.target.value)}
          />
        </div>
      </div>

      <SaveRow msg={msg} saving={saving} onSave={handleSave} />
    </div>
  );
}

function SaveRow({
  msg,
  saving,
  onSave,
}: {
  msg: { type: "ok" | "err"; text: string } | null;
  saving: boolean;
  onSave: () => void;
}) {
  return (
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
      <Button onClick={onSave} loading={saving}>
        Simpan Perubahan
      </Button>
    </div>
  );
}
