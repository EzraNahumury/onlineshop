"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Plus, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ProductPicker, type PickerProduct } from "@/components/admin/product-picker";
import { formatPrice } from "@/lib/utils";

interface AddonRow {
  product: PickerProduct;
  combo_price: string;
  stock: string;
  purchase_limit: string;
  is_active: boolean;
}

export function ComboPromoForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [addonLimit, setAddonLimit] = useState("");
  const [mainProducts, setMainProducts] = useState<PickerProduct[]>([]);
  const [addons, setAddons] = useState<AddonRow[]>([]);
  const [mainPickerOpen, setMainPickerOpen] = useState(false);
  const [addonPickerOpen, setAddonPickerOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function addMain(picked: PickerProduct[]) {
    const existing = new Set(mainProducts.map((p) => p.id));
    setMainProducts([...mainProducts, ...picked.filter((p) => !existing.has(p.id))]);
  }

  function addAddons(picked: PickerProduct[]) {
    const existing = new Set(addons.map((a) => a.product.id));
    setAddons([
      ...addons,
      ...picked
        .filter((p) => !existing.has(p.id))
        .map((p) => ({
          product: p,
          combo_price: "",
          stock: "",
          purchase_limit: "",
          is_active: true,
        })),
    ]);
  }

  function setAddon(idx: number, patch: Partial<AddonRow>) {
    setAddons((prev) => prev.map((a, i) => (i === idx ? { ...a, ...patch } : a)));
  }

  function removeAddon(idx: number) {
    setAddons((prev) => prev.filter((_, i) => i !== idx));
  }

  function removeMain(id: number) {
    setMainProducts((prev) => prev.filter((p) => p.id !== id));
  }

  async function handleSubmit() {
    setError(null);
    if (!name.trim()) return setError("Nama kombo wajib diisi");
    if (!start || !end) return setError("Periode wajib diisi");
    if (mainProducts.length === 0) return setError("Pilih minimal 1 produk utama");
    if (addons.length === 0) return setError("Tambahkan minimal 1 produk tambahan");

    const payload = {
      name: name.trim(),
      start_at: new Date(start).toISOString(),
      end_at: new Date(end).toISOString(),
      max_purchase_per_user: addonLimit ? Number(addonLimit) : null,
      main_product_ids: mainProducts.map((p) => p.id),
      addons: addons.map((a) => ({
        product_id: a.product.id,
        combo_price: Number(a.combo_price),
        stock: Number(a.stock),
        purchase_limit: a.purchase_limit ? Number(a.purchase_limit) : null,
        is_active: a.is_active,
      })),
    };

    setSaving(true);
    try {
      const res = await fetch("/api/admin/promotions/combo", {
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
          label="Nama Kombo Hemat *"
          value={name}
          onChange={(e) => setName(e.target.value)}
          maxLength={255}
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <DateTimeField label="Mulai *" value={start} onChange={setStart} />
          <DateTimeField label="Selesai *" value={end} onChange={setEnd} />
        </div>
        <Input
          id="addon_limit"
          label="Batas pembelian produk tambahan per user (opsional)"
          type="number"
          min="1"
          value={addonLimit}
          onChange={(e) => setAddonLimit(e.target.value)}
        />
      </section>

      <section className="bg-white border border-neutral-200 rounded-xl p-6 space-y-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-base font-medium text-black">2. Produk Utama</h2>
            <p className="text-xs text-neutral-500 mt-1">
              Customer harus membeli salah satu produk utama untuk dapat menambahkan produk tambahan.
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={() => setMainPickerOpen(true)}>
            <Plus className="h-4 w-4" />
            Tambah Produk Utama
          </Button>
        </div>
        {mainProducts.length === 0 ? (
          <div className="text-sm text-neutral-500 py-8 text-center border-2 border-dashed border-neutral-200 rounded-lg">
            Belum ada produk utama dipilih.
          </div>
        ) : (
          <ul className="divide-y divide-neutral-100 border border-neutral-200 rounded-lg">
            {mainProducts.map((p) => (
              <li key={p.id} className="flex items-center gap-3 px-4 py-3">
                <div className="w-9 h-9 rounded-md bg-neutral-100 overflow-hidden relative flex-shrink-0">
                  {p.primary_image && (
                    <Image src={p.primary_image} alt="" fill sizes="36px" className="object-cover" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-black truncate">{p.name}</div>
                  <div className="text-xs text-neutral-500">
                    {formatPrice(Number(p.base_price))}
                  </div>
                </div>
                <button
                  onClick={() => removeMain(p.id)}
                  className="p-1 text-neutral-400 hover:text-red-600"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="bg-white border border-neutral-200 rounded-xl p-6 space-y-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-base font-medium text-black">3. Produk Tambahan</h2>
            <p className="text-xs text-neutral-500 mt-1">
              Produk yang dapat dibeli dengan harga kombo bila customer membeli produk utama.
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={() => setAddonPickerOpen(true)}>
            <Plus className="h-4 w-4" />
            Tambah Produk Tambahan
          </Button>
        </div>

        {addons.length === 0 ? (
          <div className="text-sm text-neutral-500 py-8 text-center border-2 border-dashed border-neutral-200 rounded-lg">
            Belum ada produk tambahan.
          </div>
        ) : (
          <div className="overflow-x-auto -mx-6">
            <table className="w-full text-sm">
              <thead className="bg-neutral-50 text-xs uppercase tracking-wider text-neutral-500">
                <tr>
                  <th className="text-left px-6 py-2 font-medium">Produk</th>
                  <th className="text-right px-3 py-2 font-medium">Harga Normal</th>
                  <th className="text-right px-3 py-2 font-medium">Harga Kombo *</th>
                  <th className="text-right px-3 py-2 font-medium">Diskon</th>
                  <th className="text-right px-3 py-2 font-medium">Stok *</th>
                  <th className="text-right px-3 py-2 font-medium">Batas/User</th>
                  <th className="text-center px-3 py-2 font-medium">Aktif</th>
                  <th className="px-3 py-2"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {addons.map((a, i) => {
                  const orig = Number(a.product.base_price);
                  const combo = Number(a.combo_price);
                  const percent =
                    Number.isFinite(combo) && combo > 0 && combo < orig
                      ? Math.round(((orig - combo) / orig) * 100)
                      : null;
                  return (
                    <tr key={a.product.id}>
                      <td className="px-6 py-2">
                        <div className="flex items-center gap-2 min-w-0">
                          <div className="w-9 h-9 rounded-md bg-neutral-100 overflow-hidden relative flex-shrink-0">
                            {a.product.primary_image && (
                              <Image
                                src={a.product.primary_image}
                                alt=""
                                fill
                                sizes="36px"
                                className="object-cover"
                              />
                            )}
                          </div>
                          <div className="min-w-0">
                            <div className="text-sm text-black truncate">{a.product.name}</div>
                            <div className="text-xs text-neutral-500">stok: {a.product.stock}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-3 py-2 text-right tabular-nums text-neutral-600">
                        {formatPrice(orig)}
                      </td>
                      <td className="px-3 py-2">
                        <input
                          type="number"
                          min="0"
                          step="any"
                          value={a.combo_price}
                          onChange={(e) => setAddon(i, { combo_price: e.target.value })}
                          className="h-9 w-32 px-2 border border-neutral-300 rounded text-sm text-right focus:outline-none focus:ring-1 focus:ring-black"
                          placeholder="0"
                        />
                      </td>
                      <td className="px-3 py-2 text-right text-xs">
                        {percent !== null ? (
                          <span className="text-emerald-600 font-medium">−{percent}%</span>
                        ) : (
                          <span className="text-neutral-300">—</span>
                        )}
                      </td>
                      <td className="px-3 py-2">
                        <input
                          type="number"
                          min="0"
                          step="1"
                          value={a.stock}
                          onChange={(e) => setAddon(i, { stock: e.target.value })}
                          className="h-9 w-24 px-2 border border-neutral-300 rounded text-sm text-right focus:outline-none focus:ring-1 focus:ring-black"
                          placeholder="0"
                        />
                      </td>
                      <td className="px-3 py-2">
                        <input
                          type="number"
                          min="1"
                          step="1"
                          value={a.purchase_limit}
                          onChange={(e) => setAddon(i, { purchase_limit: e.target.value })}
                          className="h-9 w-20 px-2 border border-neutral-300 rounded text-sm text-right focus:outline-none focus:ring-1 focus:ring-black"
                          placeholder="∞"
                        />
                      </td>
                      <td className="px-3 py-2 text-center">
                        <input
                          type="checkbox"
                          checked={a.is_active}
                          onChange={(e) => setAddon(i, { is_active: e.target.checked })}
                          className="rounded border-neutral-300"
                        />
                      </td>
                      <td className="px-3 py-2">
                        <button
                          onClick={() => removeAddon(i)}
                          className="p-1 text-neutral-400 hover:text-red-600"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <div className="flex items-center justify-end gap-3 sticky bottom-0 bg-white border-t border-neutral-200 -mx-8 px-8 py-4">
        <Button variant="outline" onClick={() => router.push("/admin/promotions")}>
          Batal
        </Button>
        <Button onClick={handleSubmit} loading={saving}>
          Simpan Kombo Hemat
        </Button>
      </div>

      <ProductPicker
        open={mainPickerOpen}
        onClose={() => setMainPickerOpen(false)}
        onConfirm={addMain}
        excludeIds={mainProducts.map((p) => p.id)}
        title="Pilih Produk Utama"
      />
      <ProductPicker
        open={addonPickerOpen}
        onClose={() => setAddonPickerOpen(false)}
        onConfirm={addAddons}
        excludeIds={addons.map((a) => a.product.id)}
        title="Pilih Produk Tambahan"
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
