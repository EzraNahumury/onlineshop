"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Plus, Trash2, Pencil, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProductPicker, type PickerProduct } from "@/components/admin/product-picker";
import { ItemActiveToggle } from "./item-toggle";
import { formatPrice } from "@/lib/utils";
import { confirm } from "@/components/ui/confirm";

interface MainRow {
  id: number;
  product_id: number;
  product_name: string;
  primary_image: string | null;
  base_price: string;
  is_active: number;
}

interface AddonRow {
  id: number;
  product_id: number;
  product_name: string;
  primary_image: string | null;
  original_price: string;
  combo_price: string;
  combo_discount_percent: string | null;
  stock: number;
  purchase_limit: number | null;
  is_active: number;
}

export function ComboEditor({
  promoId,
  main,
  addons,
  editable,
}: {
  promoId: number;
  main: MainRow[];
  addons: AddonRow[];
  editable: boolean;
}) {
  const router = useRouter();
  const [mainPickerOpen, setMainPickerOpen] = useState(false);
  const [addonPickerOpen, setAddonPickerOpen] = useState(false);
  const [editingAddonId, setEditingAddonId] = useState<number | null>(null);
  const [busy, setBusy] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function addMain(picked: PickerProduct[]) {
    setError(null);
    const res = await fetch(`/api/admin/promotions/${promoId}/items`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ kind: "combo_main", product_ids: picked.map((p) => p.id) }),
    });
    const data = await res.json();
    if (!res.ok) setError(data.error || "Gagal");
    else router.refresh();
  }

  async function addAddons(picked: PickerProduct[]) {
    setError(null);
    const payload = {
      kind: "combo_addon",
      items: picked.map((p) => ({
        product_id: p.id,
        combo_price: Math.round(Number(p.base_price) * 0.85),
        stock: Math.min(p.stock, 10),
        purchase_limit: null,
        is_active: true,
      })),
    };
    const res = await fetch(`/api/admin/promotions/${promoId}/items`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) setError(data.error || "Gagal");
    else router.refresh();
  }

  async function removeItem(itemId: number, kind: "combo_main" | "combo_addon") {
    const ok = await confirm({
      title: "Hapus item ini?",
      confirmText: "Hapus",
      variant: "danger",
    });
    if (!ok) return;
    setBusy(itemId);
    setError(null);
    try {
      const res = await fetch(
        `/api/admin/promotions/${promoId}/items/${itemId}?kind=${kind}`,
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
            Produk Utama ({main.length})
          </h2>
          {editable && (
            <Button variant="outline" size="sm" onClick={() => setMainPickerOpen(true)}>
              <Plus className="h-4 w-4" />
              Tambah Produk Utama
            </Button>
          )}
        </div>
        {main.length === 0 ? (
          <div className="px-5 py-8 text-center text-sm text-neutral-500">
            Belum ada produk utama.
          </div>
        ) : (
          <ul className="divide-y divide-neutral-100">
            {main.map((m) => (
              <li key={m.id} className="px-5 py-3 flex items-center gap-3">
                <div className="w-9 h-9 rounded-md bg-neutral-100 overflow-hidden relative flex-shrink-0">
                  {m.primary_image && (
                    <Image src={m.primary_image} alt="" fill sizes="36px" className="object-cover" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-black truncate">{m.product_name}</div>
                  <div className="text-xs text-neutral-500">{formatPrice(Number(m.base_price))}</div>
                </div>
                {editable && (
                  <button
                    onClick={() => removeItem(m.id, "combo_main")}
                    disabled={busy === m.id}
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

      <section className="bg-white border border-neutral-200 rounded-xl overflow-hidden">
        <div className="px-5 py-4 border-b border-neutral-200 flex items-center justify-between">
          <h2 className="text-sm font-medium text-neutral-700">
            Produk Tambahan ({addons.length})
          </h2>
          {editable && (
            <Button variant="outline" size="sm" onClick={() => setAddonPickerOpen(true)}>
              <Plus className="h-4 w-4" />
              Tambah Produk Tambahan
            </Button>
          )}
        </div>
        {error && (
          <div className="bg-red-50 text-red-600 text-sm px-5 py-2 border-b border-red-200">
            {error}
          </div>
        )}
        {addons.length === 0 ? (
          <div className="px-5 py-8 text-center text-sm text-neutral-500">
            Belum ada produk tambahan.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-neutral-50 text-xs uppercase tracking-wider text-neutral-500">
                <tr>
                  <th className="text-left px-5 py-2 font-medium">Produk</th>
                  <th className="text-right px-3 py-2 font-medium">Harga Normal</th>
                  <th className="text-right px-3 py-2 font-medium">Harga Kombo</th>
                  <th className="text-right px-3 py-2 font-medium">Diskon</th>
                  <th className="text-right px-3 py-2 font-medium">Stok</th>
                  <th className="text-right px-3 py-2 font-medium">Batas</th>
                  <th className="text-center px-3 py-2 font-medium">Aktif</th>
                  {editable && <th className="px-3 py-2"></th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {addons.map((a) =>
                  editingAddonId === a.id ? (
                    <AddonEditRow
                      key={a.id}
                      addon={a}
                      promoId={promoId}
                      onDone={() => {
                        setEditingAddonId(null);
                        router.refresh();
                      }}
                      onCancel={() => setEditingAddonId(null)}
                    />
                  ) : (
                    <tr key={a.id}>
                      <td className="px-5 py-2">
                        <div className="flex items-center gap-2 min-w-0">
                          <div className="w-9 h-9 rounded-md bg-neutral-100 overflow-hidden relative flex-shrink-0">
                            {a.primary_image && (
                              <Image
                                src={a.primary_image}
                                alt=""
                                fill
                                sizes="36px"
                                className="object-cover"
                              />
                            )}
                          </div>
                          <div className="text-sm text-black truncate">{a.product_name}</div>
                        </div>
                      </td>
                      <td className="px-3 py-2 text-right tabular-nums text-neutral-500 line-through">
                        {formatPrice(Number(a.original_price))}
                      </td>
                      <td className="px-3 py-2 text-right tabular-nums font-medium">
                        {formatPrice(Number(a.combo_price))}
                      </td>
                      <td className="px-3 py-2 text-right text-xs text-emerald-600 font-medium">
                        −{Math.round(Number(a.combo_discount_percent || 0))}%
                      </td>
                      <td className="px-3 py-2 text-right tabular-nums">{a.stock}</td>
                      <td className="px-3 py-2 text-right text-neutral-600">
                        {a.purchase_limit ?? "∞"}
                      </td>
                      <td className="px-3 py-2 text-center">
                        <ItemActiveToggle
                          promotionId={promoId}
                          itemId={a.id}
                          kind="combo_addon"
                          defaultActive={a.is_active === 1}
                        />
                      </td>
                      {editable && (
                        <td className="px-3 py-2 whitespace-nowrap">
                          <button
                            onClick={() => setEditingAddonId(a.id)}
                            className="p-1 text-neutral-400 hover:text-black"
                          >
                            <Pencil className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => removeItem(a.id, "combo_addon")}
                            disabled={busy === a.id}
                            className="p-1 text-neutral-400 hover:text-red-600 disabled:opacity-30"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </td>
                      )}
                    </tr>
                  )
                )}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <ProductPicker
        open={mainPickerOpen}
        onClose={() => setMainPickerOpen(false)}
        onConfirm={addMain}
        excludeIds={main.map((m) => m.product_id)}
        title="Pilih Produk Utama"
      />
      <ProductPicker
        open={addonPickerOpen}
        onClose={() => setAddonPickerOpen(false)}
        onConfirm={addAddons}
        excludeIds={addons.map((a) => a.product_id)}
        title="Pilih Produk Tambahan"
      />
    </>
  );
}

function AddonEditRow({
  addon,
  promoId,
  onDone,
  onCancel,
}: {
  addon: AddonRow;
  promoId: number;
  onDone: () => void;
  onCancel: () => void;
}) {
  const [combo, setCombo] = useState(addon.combo_price);
  const [stock, setStock] = useState(addon.stock.toString());
  const [limit, setLimit] = useState(addon.purchase_limit?.toString() || "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSave() {
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(
        `/api/admin/promotions/${promoId}/items/${addon.id}?kind=combo_addon`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            original_price: Number(addon.original_price),
            combo_price: Number(combo),
            stock: Number(stock),
            purchase_limit: limit ? Number(limit) : null,
          }),
        }
      );
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
    <tr className="bg-blue-50/30">
      <td className="px-5 py-2">
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-9 h-9 rounded-md bg-neutral-100 overflow-hidden relative flex-shrink-0">
            {addon.primary_image && (
              <Image src={addon.primary_image} alt="" fill sizes="36px" className="object-cover" />
            )}
          </div>
          <div className="text-sm text-black truncate">{addon.product_name}</div>
        </div>
        {error && <div className="text-xs text-red-600 mt-1">{error}</div>}
      </td>
      <td className="px-3 py-2 text-right tabular-nums text-neutral-500 line-through">
        {formatPrice(Number(addon.original_price))}
      </td>
      <td className="px-3 py-2">
        <input
          type="number"
          min="0"
          step="any"
          value={combo}
          onChange={(e) => setCombo(e.target.value)}
          className="h-9 w-28 px-2 border border-neutral-300 rounded text-sm text-right focus:outline-none focus:ring-1 focus:ring-black"
        />
      </td>
      <td className="px-3 py-2 text-right text-xs text-neutral-400">—</td>
      <td className="px-3 py-2">
        <input
          type="number"
          min="0"
          step="1"
          value={stock}
          onChange={(e) => setStock(e.target.value)}
          className="h-9 w-20 px-2 border border-neutral-300 rounded text-sm text-right focus:outline-none focus:ring-1 focus:ring-black"
        />
      </td>
      <td className="px-3 py-2">
        <input
          type="number"
          min="1"
          step="1"
          value={limit}
          onChange={(e) => setLimit(e.target.value)}
          placeholder="∞"
          className="h-9 w-16 px-2 border border-neutral-300 rounded text-sm text-right focus:outline-none focus:ring-1 focus:ring-black"
        />
      </td>
      <td className="px-3 py-2 text-center text-neutral-400">—</td>
      <td className="px-3 py-2 whitespace-nowrap">
        <button
          onClick={handleSave}
          disabled={saving}
          className="p-1 text-emerald-600 hover:bg-emerald-50 rounded disabled:opacity-30"
        >
          <Check className="h-4 w-4" />
        </button>
        <button
          onClick={onCancel}
          disabled={saving}
          className="p-1 text-neutral-400 hover:bg-neutral-100 rounded"
        >
          <X className="h-4 w-4" />
        </button>
      </td>
    </tr>
  );
}
