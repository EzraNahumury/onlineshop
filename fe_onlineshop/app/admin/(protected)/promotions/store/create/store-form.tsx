"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Plus, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ProductPicker, type PickerProduct } from "@/components/admin/product-picker";
import { formatPrice } from "@/lib/utils";

interface ItemRow {
  product: PickerProduct;
  discount_price: string;
  promo_stock: string;
  purchase_limit: string;
  is_active: boolean;
}

export function StorePromoForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [maxPerUser, setMaxPerUser] = useState("");
  const [items, setItems] = useState<ItemRow[]>([]);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function addProducts(picked: PickerProduct[]) {
    const existing = new Set(items.map((i) => i.product.id));
    const next = [
      ...items,
      ...picked
        .filter((p) => !existing.has(p.id))
        .map((p) => ({
          product: p,
          discount_price: "",
          promo_stock: "",
          purchase_limit: "",
          is_active: true,
        })),
    ];
    setItems(next);
  }

  function setItem(idx: number, patch: Partial<ItemRow>) {
    setItems((prev) => prev.map((it, i) => (i === idx ? { ...it, ...patch } : it)));
  }

  function removeItem(idx: number) {
    setItems((prev) => prev.filter((_, i) => i !== idx));
  }

  function bulkSetDiscountPercent(percent: number) {
    if (!Number.isFinite(percent) || percent <= 0 || percent >= 100) return;
    setItems((prev) =>
      prev.map((it) => {
        const orig = Number(it.product.base_price);
        const disc = Math.round(orig * (1 - percent / 100));
        return { ...it, discount_price: String(disc) };
      })
    );
  }

  async function handleSubmit() {
    setError(null);
    if (!name.trim()) return setError("Nama promo wajib diisi");
    if (!start || !end) return setError("Periode promo wajib diisi");
    if (items.length === 0) return setError("Tambahkan minimal 1 produk");

    const payload = {
      name: name.trim(),
      start_at: new Date(start).toISOString(),
      end_at: new Date(end).toISOString(),
      max_purchase_per_user: maxPerUser ? Number(maxPerUser) : null,
      items: items.map((it) => ({
        product_id: it.product.id,
        discount_price: Number(it.discount_price),
        promo_stock: Number(it.promo_stock),
        purchase_limit: it.purchase_limit ? Number(it.purchase_limit) : null,
        is_active: it.is_active,
      })),
    };

    setSaving(true);
    try {
      const res = await fetch("/api/admin/promotions/store", {
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
        <div>
          <h2 className="text-base font-medium text-black">1. Informasi Dasar</h2>
          <p className="text-xs text-neutral-500 mt-1">
            Nama promo hanya untuk admin internal. Periode maksimal 180 hari.
          </p>
        </div>
        <Input
          id="name"
          label="Nama Promo *"
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
            <h2 className="text-base font-medium text-black">2. Produk Promo</h2>
            <p className="text-xs text-neutral-500 mt-1">
              Pilih produk yang akan didiskon dan tentukan harga promo per produk.
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={() => setPickerOpen(true)}>
            <Plus className="h-4 w-4" />
            Tambah Produk
          </Button>
        </div>

        {items.length > 0 && (
          <div className="flex items-center gap-2 pt-2 border-t border-neutral-100">
            <span className="text-xs text-neutral-500">Perubahan massal:</span>
            <BulkPercentSetter onApply={bulkSetDiscountPercent} />
          </div>
        )}

        {items.length === 0 ? (
          <div className="text-sm text-neutral-500 py-8 text-center border-2 border-dashed border-neutral-200 rounded-lg">
            Belum ada produk. Klik &quot;Tambah Produk&quot; untuk memilih.
          </div>
        ) : (
          <div className="overflow-x-auto -mx-6">
            <table className="w-full text-sm">
              <thead className="bg-neutral-50 text-xs uppercase tracking-wider text-neutral-500">
                <tr>
                  <th className="text-left px-6 py-2 font-medium">Produk</th>
                  <th className="text-right px-3 py-2 font-medium">Harga Awal</th>
                  <th className="text-right px-3 py-2 font-medium">Harga Diskon *</th>
                  <th className="text-right px-3 py-2 font-medium">Diskon</th>
                  <th className="text-right px-3 py-2 font-medium">Stok Promo *</th>
                  <th className="text-right px-3 py-2 font-medium">Batas/User</th>
                  <th className="text-center px-3 py-2 font-medium">Aktif</th>
                  <th className="px-3 py-2"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {items.map((it, i) => {
                  const orig = Number(it.product.base_price);
                  const disc = Number(it.discount_price);
                  const percent =
                    Number.isFinite(disc) && disc > 0 && disc < orig
                      ? Math.round(((orig - disc) / orig) * 100)
                      : null;
                  return (
                    <tr key={it.product.id}>
                      <td className="px-6 py-2">
                        <div className="flex items-center gap-2 min-w-0">
                          <div className="w-9 h-9 rounded-md bg-neutral-100 overflow-hidden relative flex-shrink-0">
                            {it.product.primary_image && (
                              <Image
                                src={it.product.primary_image}
                                alt=""
                                fill
                                sizes="36px"
                                className="object-cover"
                              />
                            )}
                          </div>
                          <div className="min-w-0">
                            <div className="text-sm text-black truncate">
                              {it.product.name}
                            </div>
                            <div className="text-xs text-neutral-500">
                              stok: {it.product.stock}
                            </div>
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
                          value={it.discount_price}
                          onChange={(e) =>
                            setItem(i, { discount_price: e.target.value })
                          }
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
                          value={it.promo_stock}
                          onChange={(e) =>
                            setItem(i, { promo_stock: e.target.value })
                          }
                          className="h-9 w-24 px-2 border border-neutral-300 rounded text-sm text-right focus:outline-none focus:ring-1 focus:ring-black"
                          placeholder="0"
                        />
                      </td>
                      <td className="px-3 py-2">
                        <input
                          type="number"
                          min="1"
                          step="1"
                          value={it.purchase_limit}
                          onChange={(e) =>
                            setItem(i, { purchase_limit: e.target.value })
                          }
                          className="h-9 w-20 px-2 border border-neutral-300 rounded text-sm text-right focus:outline-none focus:ring-1 focus:ring-black"
                          placeholder="∞"
                        />
                      </td>
                      <td className="px-3 py-2 text-center">
                        <input
                          type="checkbox"
                          checked={it.is_active}
                          onChange={(e) =>
                            setItem(i, { is_active: e.target.checked })
                          }
                          className="rounded border-neutral-300"
                        />
                      </td>
                      <td className="px-3 py-2">
                        <button
                          onClick={() => removeItem(i)}
                          className="p-1 text-neutral-400 hover:text-red-600"
                          title="Hapus"
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
          Simpan Promo
        </Button>
      </div>

      <ProductPicker
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        onConfirm={addProducts}
        excludeIds={items.map((i) => i.product.id)}
        title="Pilih Produk untuk Promo Toko"
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

function BulkPercentSetter({ onApply }: { onApply: (p: number) => void }) {
  const [val, setVal] = useState("");
  return (
    <div className="flex items-center gap-1">
      <input
        type="number"
        min="1"
        max="99"
        value={val}
        onChange={(e) => setVal(e.target.value)}
        placeholder="Diskon %"
        className="h-8 w-28 px-2 border border-neutral-300 rounded text-xs focus:outline-none focus:ring-1 focus:ring-black"
      />
      <button
        type="button"
        onClick={() => {
          const n = Number(val);
          if (Number.isFinite(n)) onApply(n);
        }}
        className="h-8 px-3 text-xs font-medium border border-neutral-300 rounded hover:bg-neutral-100"
      >
        Terapkan ke semua
      </button>
    </div>
  );
}
