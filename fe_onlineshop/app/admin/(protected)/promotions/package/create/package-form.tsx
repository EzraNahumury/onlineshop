"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Plus, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ProductPicker, type PickerProduct } from "@/components/admin/product-picker";
import { formatPrice } from "@/lib/utils";

type DiscountType = "percentage" | "fixed_amount" | "fixed_price";

interface TierRow {
  min_quantity: string;
  discount_type: DiscountType;
  discount_value: string;
}

export function PackagePromoForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [maxPerUser, setMaxPerUser] = useState("");
  const [tiers, setTiers] = useState<TierRow[]>([
    { min_quantity: "2", discount_type: "percentage", discount_value: "" },
  ]);
  const [products, setProducts] = useState<PickerProduct[]>([]);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function setTier(idx: number, patch: Partial<TierRow>) {
    setTiers((prev) => prev.map((t, i) => (i === idx ? { ...t, ...patch } : t)));
  }

  function addTier() {
    const lastQty = Number(tiers[tiers.length - 1]?.min_quantity || 1);
    setTiers([
      ...tiers,
      { min_quantity: String(lastQty + 1), discount_type: "percentage", discount_value: "" },
    ]);
  }

  function removeTier(idx: number) {
    setTiers((prev) => prev.filter((_, i) => i !== idx));
  }

  function addProducts(picked: PickerProduct[]) {
    const existing = new Set(products.map((p) => p.id));
    setProducts([...products, ...picked.filter((p) => !existing.has(p.id))]);
  }

  function removeProduct(id: number) {
    setProducts((prev) => prev.filter((p) => p.id !== id));
  }

  async function handleSubmit() {
    setError(null);
    if (!name.trim()) return setError("Nama paket wajib diisi");
    if (!start || !end) return setError("Periode wajib diisi");
    if (tiers.length === 0) return setError("Tambahkan minimal 1 tingkatan diskon");
    if (products.length === 0) return setError("Pilih minimal 1 produk");

    const payload = {
      name: name.trim(),
      start_at: new Date(start).toISOString(),
      end_at: new Date(end).toISOString(),
      max_purchase_per_user: maxPerUser ? Number(maxPerUser) : null,
      tiers: tiers.map((t) => ({
        min_quantity: Number(t.min_quantity),
        discount_type: t.discount_type,
        discount_value: Number(t.discount_value),
      })),
      product_ids: products.map((p) => p.id),
    };

    setSaving(true);
    try {
      const res = await fetch("/api/admin/promotions/package", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Gagal menyimpan");
        return;
      }
      router.push(`/admin/promotions/${data.id}`);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      {error && (
        <div className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-lg border border-red-200">
          {error}
        </div>
      )}

      <section className="bg-white border border-neutral-200 rounded-xl p-6 space-y-4">
        <h2 className="text-base font-medium text-black">1. Informasi Dasar</h2>
        <Input
          id="name"
          label="Nama Paket Diskon *"
          value={name}
          onChange={(e) => setName(e.target.value)}
          maxLength={255}
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <DateTimeField label="Mulai *" value={start} onChange={setStart} />
          <DateTimeField label="Selesai *" value={end} onChange={setEnd} />
        </div>
        <Input
          id="max"
          label="Batas pembelian per user (opsional)"
          type="number"
          min="1"
          value={maxPerUser}
          onChange={(e) => setMaxPerUser(e.target.value)}
        />
      </section>

      <section className="bg-white border border-neutral-200 rounded-xl p-6 space-y-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-base font-medium text-black">2. Tingkatan Diskon</h2>
            <p className="text-xs text-neutral-500 mt-1">
              Atur diskon berdasarkan minimum jumlah pembelian. Bisa beberapa tingkatan.
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={addTier}>
            <Plus className="h-4 w-4" />
            Tambah Tingkatan
          </Button>
        </div>
        <div className="space-y-3">
          {tiers.map((t, i) => (
            <div
              key={i}
              className="grid grid-cols-12 gap-3 items-end p-3 border border-neutral-200 rounded-lg"
            >
              <div className="col-span-3">
                <label className="text-xs text-neutral-500 mb-1 block">Min jumlah</label>
                <input
                  type="number"
                  min="1"
                  value={t.min_quantity}
                  onChange={(e) => setTier(i, { min_quantity: e.target.value })}
                  className="h-10 w-full px-3 border border-neutral-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-black"
                />
              </div>
              <div className="col-span-4">
                <label className="text-xs text-neutral-500 mb-1 block">Jenis diskon</label>
                <select
                  value={t.discount_type}
                  onChange={(e) =>
                    setTier(i, { discount_type: e.target.value as DiscountType })
                  }
                  className="h-10 w-full px-3 border border-neutral-300 rounded text-sm bg-white focus:outline-none focus:ring-1 focus:ring-black"
                >
                  <option value="percentage">Persentase (%)</option>
                  <option value="fixed_amount">Potongan Rupiah</option>
                  <option value="fixed_price">Harga Paket (Rp)</option>
                </select>
              </div>
              <div className="col-span-4">
                <label className="text-xs text-neutral-500 mb-1 block">
                  {t.discount_type === "percentage"
                    ? "Persen"
                    : t.discount_type === "fixed_amount"
                    ? "Potongan (Rp)"
                    : "Harga (Rp)"}
                </label>
                <input
                  type="number"
                  min="0"
                  step="any"
                  value={t.discount_value}
                  onChange={(e) => setTier(i, { discount_value: e.target.value })}
                  className="h-10 w-full px-3 border border-neutral-300 rounded text-sm text-right focus:outline-none focus:ring-1 focus:ring-black"
                />
              </div>
              <div className="col-span-1">
                <button
                  type="button"
                  onClick={() => removeTier(i)}
                  disabled={tiers.length === 1}
                  className="h-10 w-full flex items-center justify-center text-neutral-400 hover:text-red-600 disabled:opacity-30"
                  title="Hapus tingkatan"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-white border border-neutral-200 rounded-xl p-6 space-y-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-base font-medium text-black">3. Produk Paket</h2>
            <p className="text-xs text-neutral-500 mt-1">
              Pilih produk yang ikut paket diskon ini.
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={() => setPickerOpen(true)}>
            <Plus className="h-4 w-4" />
            Tambah Produk
          </Button>
        </div>

        {products.length === 0 ? (
          <div className="text-sm text-neutral-500 py-8 text-center border-2 border-dashed border-neutral-200 rounded-lg">
            Belum ada produk dipilih.
          </div>
        ) : (
          <ul className="divide-y divide-neutral-100 border border-neutral-200 rounded-lg">
            {products.map((p) => (
              <li key={p.id} className="flex items-center gap-3 px-4 py-3">
                <div className="w-9 h-9 rounded-md bg-neutral-100 overflow-hidden relative flex-shrink-0">
                  {p.primary_image && (
                    <Image src={p.primary_image} alt="" fill sizes="36px" className="object-cover" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-black truncate">{p.name}</div>
                  <div className="text-xs text-neutral-500">
                    {formatPrice(Number(p.base_price))} · stok {p.stock}
                  </div>
                </div>
                <button
                  onClick={() => removeProduct(p.id)}
                  className="p-1 text-neutral-400 hover:text-red-600"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

      <div className="flex items-center justify-end gap-3 sticky bottom-0 bg-white border-t border-neutral-200 -mx-8 px-8 py-4">
        <Button variant="outline" onClick={() => router.push("/admin/promotions")}>
          Batal
        </Button>
        <Button onClick={handleSubmit} loading={saving}>
          Simpan Paket Diskon
        </Button>
      </div>

      <ProductPicker
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        onConfirm={addProducts}
        excludeIds={products.map((p) => p.id)}
        title="Pilih Produk untuk Paket Diskon"
      />
    </div>
  );
}

function DateTimeField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-medium text-neutral-700">{label}</label>
      <input
        type="datetime-local"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-11 w-full rounded-lg border border-neutral-300 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
      />
    </div>
  );
}
