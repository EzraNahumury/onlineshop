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

interface StoreItemRow {
  id: number;
  product_id: number;
  product_name: string;
  primary_image: string | null;
  original_price: string;
  discount_price: string;
  discount_percent: string | null;
  promo_stock: number;
  promo_sold: number;
  purchase_limit: number | null;
  is_active: number;
}

export function StoreItemsEditor({
  promoId,
  items,
  editable,
}: {
  promoId: number;
  items: StoreItemRow[];
  editable: boolean;
}) {
  const router = useRouter();
  const [pickerOpen, setPickerOpen] = useState(false);
  const [busy, setBusy] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);

  async function handleAdd(picked: PickerProduct[]) {
    setError(null);
    const payload = {
      kind: "store",
      items: picked.map((p) => ({
        product_id: p.id,
        discount_price: Math.round(Number(p.base_price) * 0.9),
        promo_stock: Math.min(p.stock, 10),
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
    if (!res.ok) setError(data.error || "Gagal menambah");
    else router.refresh();
  }

  async function handleRemove(itemId: number) {
    const ok = await confirm({
      title: "Hapus produk dari promo?",
      confirmText: "Hapus",
      variant: "danger",
    });
    if (!ok) return;
    setBusy(itemId);
    setError(null);
    try {
      const res = await fetch(
        `/api/admin/promotions/${promoId}/items/${itemId}?kind=store`,
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
    <section className="bg-white border border-neutral-200 rounded-xl overflow-hidden">
      <div className="px-5 py-4 border-b border-neutral-200 flex items-center justify-between">
        <h2 className="text-sm font-medium text-neutral-700">
          Produk Promo ({items.length})
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
          Belum ada produk dalam promo.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-neutral-50 text-xs uppercase tracking-wider text-neutral-500">
              <tr>
                <th className="text-left px-5 py-2 font-medium">Produk</th>
                <th className="text-right px-3 py-2 font-medium">Harga Awal</th>
                <th className="text-right px-3 py-2 font-medium">Harga Diskon</th>
                <th className="text-right px-3 py-2 font-medium">Diskon</th>
                <th className="text-right px-3 py-2 font-medium">Stok</th>
                <th className="text-right px-3 py-2 font-medium">Terjual</th>
                <th className="text-right px-3 py-2 font-medium">Batas</th>
                <th className="text-center px-3 py-2 font-medium">Aktif</th>
                {editable && <th className="px-3 py-2"></th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {items.map((it) =>
                editingId === it.id ? (
                  <StoreItemEditRow
                    key={it.id}
                    item={it}
                    promoId={promoId}
                    onDone={() => {
                      setEditingId(null);
                      router.refresh();
                    }}
                    onCancel={() => setEditingId(null)}
                  />
                ) : (
                  <tr key={it.id}>
                    <td className="px-5 py-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <div className="w-9 h-9 rounded-md bg-neutral-100 overflow-hidden relative flex-shrink-0">
                          {it.primary_image && (
                            <Image
                              src={it.primary_image}
                              alt=""
                              fill
                              sizes="36px"
                              className="object-cover"
                            />
                          )}
                        </div>
                        <div className="text-sm text-black truncate">{it.product_name}</div>
                      </div>
                    </td>
                    <td className="px-3 py-2 text-right tabular-nums text-neutral-500 line-through">
                      {formatPrice(Number(it.original_price))}
                    </td>
                    <td className="px-3 py-2 text-right tabular-nums font-medium">
                      {formatPrice(Number(it.discount_price))}
                    </td>
                    <td className="px-3 py-2 text-right text-xs text-emerald-600 font-medium">
                      −{Math.round(Number(it.discount_percent || 0))}%
                    </td>
                    <td className="px-3 py-2 text-right tabular-nums">{it.promo_stock}</td>
                    <td className="px-3 py-2 text-right tabular-nums text-neutral-600">
                      {it.promo_sold}
                    </td>
                    <td className="px-3 py-2 text-right text-neutral-600">
                      {it.purchase_limit ?? "∞"}
                    </td>
                    <td className="px-3 py-2 text-center">
                      <ItemActiveToggle
                        promotionId={promoId}
                        itemId={it.id}
                        kind="store"
                        defaultActive={it.is_active === 1}
                      />
                    </td>
                    {editable && (
                      <td className="px-3 py-2 whitespace-nowrap">
                        <button
                          onClick={() => setEditingId(it.id)}
                          className="p-1 text-neutral-400 hover:text-black"
                          title="Edit"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleRemove(it.id)}
                          disabled={busy === it.id}
                          className="p-1 text-neutral-400 hover:text-red-600 disabled:opacity-30"
                          title="Hapus"
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

      <ProductPicker
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        onConfirm={handleAdd}
        excludeIds={items.map((i) => i.product_id)}
        title="Tambah Produk ke Promo"
      />
    </section>
  );
}

function StoreItemEditRow({
  item,
  promoId,
  onDone,
  onCancel,
}: {
  item: StoreItemRow;
  promoId: number;
  onDone: () => void;
  onCancel: () => void;
}) {
  const [discount, setDiscount] = useState(item.discount_price);
  const [stock, setStock] = useState(item.promo_stock.toString());
  const [limit, setLimit] = useState(item.purchase_limit?.toString() || "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSave() {
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(
        `/api/admin/promotions/${promoId}/items/${item.id}?kind=store`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            original_price: Number(item.original_price),
            discount_price: Number(discount),
            promo_stock: Number(stock),
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
            {item.primary_image && (
              <Image src={item.primary_image} alt="" fill sizes="36px" className="object-cover" />
            )}
          </div>
          <div className="text-sm text-black truncate">{item.product_name}</div>
        </div>
        {error && <div className="text-xs text-red-600 mt-1">{error}</div>}
      </td>
      <td className="px-3 py-2 text-right tabular-nums text-neutral-500 line-through">
        {formatPrice(Number(item.original_price))}
      </td>
      <td className="px-3 py-2">
        <input
          type="number"
          min="0"
          step="any"
          value={discount}
          onChange={(e) => setDiscount(e.target.value)}
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
      <td className="px-3 py-2 text-right tabular-nums text-neutral-600">{item.promo_sold}</td>
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
          title="Simpan"
        >
          <Check className="h-4 w-4" />
        </button>
        <button
          onClick={onCancel}
          disabled={saving}
          className="p-1 text-neutral-400 hover:bg-neutral-100 rounded"
          title="Batal"
        >
          <X className="h-4 w-4" />
        </button>
      </td>
    </tr>
  );
}
