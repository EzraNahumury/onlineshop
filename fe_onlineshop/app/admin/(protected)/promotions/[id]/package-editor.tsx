"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Plus, Trash2, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProductPicker, type PickerProduct } from "@/components/admin/product-picker";
import { ItemActiveToggle } from "./item-toggle";
import { formatPrice } from "@/lib/utils";
import { confirm } from "@/components/ui/confirm";

type DiscountType = "percentage" | "fixed_amount" | "fixed_price";

interface TierRow {
  id: number;
  min_quantity: number;
  discount_type: DiscountType;
  discount_value: string;
  sort_order: number;
}

interface PackageItemRow {
  id: number;
  product_id: number;
  product_name: string;
  primary_image: string | null;
  base_price: string;
  is_active: number;
}

interface TierForm {
  min_quantity: string;
  discount_type: DiscountType;
  discount_value: string;
}

function fmtTier(t: TierRow) {
  if (t.discount_type === "percentage") return `${Number(t.discount_value)}% off`;
  if (t.discount_type === "fixed_amount") return `Potongan ${formatPrice(Number(t.discount_value))}`;
  return `Harga paket ${formatPrice(Number(t.discount_value))}`;
}

export function PackageEditor({
  promoId,
  tiers,
  items,
  editable,
}: {
  promoId: number;
  tiers: TierRow[];
  items: PackageItemRow[];
  editable: boolean;
}) {
  const router = useRouter();
  const [pickerOpen, setPickerOpen] = useState(false);
  const [tierEdit, setTierEdit] = useState(false);
  const [busy, setBusy] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleAddProducts(picked: PickerProduct[]) {
    setError(null);
    const res = await fetch(`/api/admin/promotions/${promoId}/items`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ kind: "package", product_ids: picked.map((p) => p.id) }),
    });
    const data = await res.json();
    if (!res.ok) setError(data.error || "Gagal");
    else router.refresh();
  }

  async function handleRemoveProduct(itemId: number) {
    const ok = await confirm({
      title: "Hapus produk dari paket?",
      confirmText: "Hapus",
      variant: "danger",
    });
    if (!ok) return;
    setBusy(itemId);
    setError(null);
    try {
      const res = await fetch(
        `/api/admin/promotions/${promoId}/items/${itemId}?kind=package`,
        { method: "DELETE" }
      );
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        setError(d.error || "Gagal");
        return;
      }
      router.refresh();
    } finally {
      setBusy(null);
    }
  }

  return (
    <>
      <section className="bg-white border border-neutral-200 rounded-xl overflow-hidden">
        <div className="px-5 py-4 border-b border-neutral-200 flex items-center justify-between">
          <h2 className="text-sm font-medium text-neutral-700">
            Tingkatan Diskon ({tiers.length})
          </h2>
          {editable && (
            <Button variant="outline" size="sm" onClick={() => setTierEdit(!tierEdit)}>
              <Pencil className="h-3.5 w-3.5" />
              {tierEdit ? "Tutup Editor" : "Edit Tingkatan"}
            </Button>
          )}
        </div>
        {tierEdit ? (
          <TierFormSection
            promoId={promoId}
            initialTiers={tiers}
            onDone={() => {
              setTierEdit(false);
              router.refresh();
            }}
          />
        ) : tiers.length === 0 ? (
          <div className="px-5 py-8 text-center text-sm text-neutral-500">
            Belum ada tingkatan.
          </div>
        ) : (
          <ul className="divide-y divide-neutral-100">
            {tiers.map((t) => (
              <li key={t.id} className="px-5 py-3">
                <span className="font-medium text-black">Beli {t.min_quantity}+</span>
                <span className="text-neutral-500"> · {fmtTier(t)}</span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="bg-white border border-neutral-200 rounded-xl overflow-hidden">
        <div className="px-5 py-4 border-b border-neutral-200 flex items-center justify-between">
          <h2 className="text-sm font-medium text-neutral-700">
            Produk Paket ({items.length})
          </h2>
          {editable && (
            <Button variant="outline" size="sm" onClick={() => setPickerOpen(true)}>
              <Plus className="h-4 w-4" />
              Tambah Produk
            </Button>
          )}
        </div>
        {error && (
          <div className="bg-red-50 text-red-600 text-sm px-5 py-2 border-b border-red-200">
            {error}
          </div>
        )}
        {items.length === 0 ? (
          <div className="px-5 py-8 text-center text-sm text-neutral-500">
            Belum ada produk.
          </div>
        ) : (
          <ul className="divide-y divide-neutral-100">
            {items.map((it) => (
              <li key={it.id} className="px-5 py-3 flex items-center gap-3">
                <div className="w-9 h-9 rounded-md bg-neutral-100 overflow-hidden relative flex-shrink-0">
                  {it.primary_image && (
                    <Image src={it.primary_image} alt="" fill sizes="36px" className="object-cover" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-black truncate">{it.product_name}</div>
                  <div className="text-xs text-neutral-500">{formatPrice(Number(it.base_price))}</div>
                </div>
                <ItemActiveToggle
                  promotionId={promoId}
                  itemId={it.id}
                  kind="package"
                  defaultActive={it.is_active === 1}
                />
                {editable && (
                  <button
                    onClick={() => handleRemoveProduct(it.id)}
                    disabled={busy === it.id}
                    className="p-1 text-neutral-400 hover:text-red-600 disabled:opacity-30"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>

      <ProductPicker
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        onConfirm={handleAddProducts}
        excludeIds={items.map((i) => i.product_id)}
        title="Tambah Produk ke Paket"
      />
    </>
  );
}

function TierFormSection({
  promoId,
  initialTiers,
  onDone,
}: {
  promoId: number;
  initialTiers: TierRow[];
  onDone: () => void;
}) {
  const [tiers, setTiers] = useState<TierForm[]>(
    initialTiers.length > 0
      ? initialTiers.map((t) => ({
          min_quantity: t.min_quantity.toString(),
          discount_type: t.discount_type,
          discount_value: t.discount_value,
        }))
      : [{ min_quantity: "2", discount_type: "percentage", discount_value: "" }]
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function setTier(i: number, patch: Partial<TierForm>) {
    setTiers((prev) => prev.map((t, idx) => (idx === i ? { ...t, ...patch } : t)));
  }
  function addTier() {
    const lastQty = Number(tiers[tiers.length - 1]?.min_quantity || 1);
    setTiers([
      ...tiers,
      { min_quantity: String(lastQty + 1), discount_type: "percentage", discount_value: "" },
    ]);
  }
  function removeTier(i: number) {
    setTiers((prev) => prev.filter((_, idx) => idx !== i));
  }

  async function handleSave() {
    setError(null);
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/promotions/${promoId}/tiers`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tiers: tiers.map((t) => ({
            min_quantity: Number(t.min_quantity),
            discount_type: t.discount_type,
            discount_value: Number(t.discount_value),
          })),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Gagal");
        return;
      }
      onDone();
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="p-5 space-y-3">
      {error && (
        <div className="bg-red-50 text-red-600 text-sm px-3 py-2 rounded-lg border border-red-200">
          {error}
        </div>
      )}
      {tiers.map((t, i) => (
        <div key={i} className="grid grid-cols-12 gap-3 items-end p-3 border border-neutral-200 rounded-lg">
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
              onChange={(e) => setTier(i, { discount_type: e.target.value as DiscountType })}
              className="h-10 w-full px-3 border border-neutral-300 rounded text-sm bg-white focus:outline-none focus:ring-1 focus:ring-black"
            >
              <option value="percentage">Persentase (%)</option>
              <option value="fixed_amount">Potongan (Rp)</option>
              <option value="fixed_price">Harga Paket (Rp)</option>
            </select>
          </div>
          <div className="col-span-4">
            <label className="text-xs text-neutral-500 mb-1 block">Nilai</label>
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
              onClick={() => removeTier(i)}
              disabled={tiers.length === 1}
              className="h-10 w-full flex items-center justify-center text-neutral-400 hover:text-red-600 disabled:opacity-30"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </div>
      ))}
      <div className="flex items-center justify-between pt-2">
        <Button variant="outline" size="sm" onClick={addTier}>
          <Plus className="h-4 w-4" />
          Tambah Tingkatan
        </Button>
        <Button size="sm" onClick={handleSave} loading={saving}>
          Simpan Tingkatan
        </Button>
      </div>
    </div>
  );
}
