"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Plus, Pencil, Trash2, Sparkles, X } from "lucide-react";
import { Modal } from "@/components/admin/modal";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { confirm } from "@/components/ui/confirm";
import { toast } from "@/components/ui/toast";
import { ProductPicker, type PickerProduct } from "@/components/admin/product-picker";
import { formatPrice, formatThousands, parseThousands } from "@/lib/utils";

type DiscountType = "percentage" | "fixed_amount";

interface PromoProduct {
  id: number;
  name: string;
  image: string | null;
  stock: number;
}

export interface DisplayPromoItem {
  id: number;
  title: string;
  subtitle: string | null;
  discount_type: DiscountType;
  discount_value: number;
  stock: number | null;
  start_at: string; // datetime-local "YYYY-MM-DDTHH:MM"
  end_at: string;
  is_active: boolean;
  products: PromoProduct[];
}

function statusOf(p: DisplayPromoItem): { label: string; cls: string } {
  if (!p.is_active) return { label: "Nonaktif", cls: "bg-neutral-100 text-neutral-500" };
  const now = Date.now();
  const start = new Date(p.start_at).getTime();
  const end = new Date(p.end_at).getTime();
  if (now < start) return { label: "Terjadwal", cls: "bg-amber-50 text-amber-700" };
  if (now > end) return { label: "Berakhir", cls: "bg-neutral-100 text-neutral-500" };
  return { label: "Tayang", cls: "bg-emerald-50 text-emerald-700" };
}

function offerText(t: DiscountType, v: number) {
  return t === "percentage" ? `Diskon ${v}%` : `Potongan ${formatPrice(v)}`;
}

export function DisplayPromosView({ promos }: { promos: DisplayPromoItem[] }) {
  const router = useRouter();
  const [modalOpen, setModalOpen] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [editing, setEditing] = useState<DisplayPromoItem | null>(null);

  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [discountType, setDiscountType] = useState<DiscountType>("percentage");
  const [discountValue, setDiscountValue] = useState("");
  const [stock, setStock] = useState("");
  const [startAt, setStartAt] = useState("");
  const [endAt, setEndAt] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [selected, setSelected] = useState<PromoProduct[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<number | null>(null);

  // Promo stock cannot exceed the combined stock of the selected products.
  const maxStock = selected.reduce((s, p) => s + (p.stock || 0), 0);
  const stockExceeds = !!stock && selected.length > 0 && Number(stock) > maxStock;

  function openCreate() {
    setEditing(null);
    setTitle("");
    setSubtitle("");
    setDiscountType("percentage");
    setDiscountValue("");
    setStock("");
    setStartAt("");
    setEndAt("");
    setIsActive(true);
    setSelected([]);
    setError(null);
    setModalOpen(true);
  }

  function openEdit(p: DisplayPromoItem) {
    setEditing(p);
    setTitle(p.title);
    setSubtitle(p.subtitle ?? "");
    setDiscountType(p.discount_type);
    setDiscountValue(String(p.discount_value));
    setStock(p.stock != null ? String(p.stock) : "");
    setStartAt(p.start_at);
    setEndAt(p.end_at);
    setIsActive(p.is_active);
    setSelected(p.products);
    setError(null);
    setModalOpen(true);
  }

  function onPickerConfirm(picked: PickerProduct[]) {
    setSelected((prev) => {
      const map = new Map(prev.map((x) => [x.id, x]));
      for (const p of picked) {
        map.set(p.id, {
          id: p.id,
          name: p.name,
          image: p.primary_image,
          stock: p.stock,
        });
      }
      return Array.from(map.values());
    });
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const stockNum = stock ? Number(stock) : null;
    if (stockNum != null && selected.length > 0 && stockNum > maxStock) {
      setError(
        `Stok promo (${stockNum.toLocaleString("id-ID")}) melebihi total stok produk yang dipilih (${maxStock.toLocaleString("id-ID")}).`
      );
      return;
    }

    setSaving(true);
    try {
      const payload = {
        title,
        subtitle: subtitle || null,
        discount_type: discountType,
        discount_value: Number(discountValue),
        stock: stock ? Number(stock) : null,
        start_at: startAt,
        end_at: endAt,
        is_active: isActive,
        product_ids: selected.map((p) => p.id),
      };
      const url = editing
        ? `/api/admin/display-promos/${editing.id}`
        : `/api/admin/display-promos`;
      const res = await fetch(url, {
        method: editing ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Gagal menyimpan");
        return;
      }
      toast.success(editing ? "Display promo diperbarui" : "Display promo dibuat");
      setModalOpen(false);
      router.refresh();
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(p: DisplayPromoItem) {
    const ok = await confirm({
      title: `Hapus "${p.title}"?`,
      description: "Banner promo ini akan dihapus permanen.",
      confirmText: "Hapus",
      variant: "danger",
    });
    if (!ok) return;
    setBusyId(p.id);
    try {
      const res = await fetch(`/api/admin/display-promos/${p.id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Gagal menghapus");
        return;
      }
      toast.success("Display promo dihapus");
      router.refresh();
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden">
      <div className="px-5 py-4 border-b border-neutral-200 flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm text-neutral-500">
          <Sparkles className="h-4 w-4" />
          {promos.length} display promo
        </div>
        <Button size="sm" onClick={openCreate}>
          <Plus className="h-4 w-4" />
          Tambah Display Promo
        </Button>
      </div>

      {promos.length === 0 ? (
        <div className="px-5 py-16 text-center text-sm text-neutral-500">
          Belum ada display promo. Buat satu untuk menampilkan banner + hitung mundur di
          beranda.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-neutral-50 text-xs uppercase tracking-wider text-neutral-500">
              <tr>
                <th className="text-left px-5 py-3 font-medium">Judul</th>
                <th className="text-left px-5 py-3 font-medium">Tawaran</th>
                <th className="text-left px-5 py-3 font-medium">Periode</th>
                <th className="text-left px-5 py-3 font-medium">Produk</th>
                <th className="text-left px-5 py-3 font-medium">Status</th>
                <th className="text-right px-5 py-3 font-medium">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {promos.map((p) => {
                const st = statusOf(p);
                return (
                  <tr key={p.id} className="hover:bg-neutral-50">
                    <td className="px-5 py-3">
                      <div className="font-medium text-black">{p.title}</div>
                      {p.subtitle && (
                        <div className="text-xs text-neutral-500">{p.subtitle}</div>
                      )}
                    </td>
                    <td className="px-5 py-3 text-neutral-700">
                      {offerText(p.discount_type, p.discount_value)}
                      {p.stock != null && (
                        <div className="text-xs text-neutral-400">Stok: {p.stock}</div>
                      )}
                    </td>
                    <td className="px-5 py-3 text-xs text-neutral-500">
                      {new Date(p.start_at).toLocaleString("id-ID")}
                      <br />→ {new Date(p.end_at).toLocaleString("id-ID")}
                    </td>
                    <td className="px-5 py-3 text-neutral-600">{p.products.length} produk</td>
                    <td className="px-5 py-3">
                      <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${st.cls}`}>
                        {st.label}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => openEdit(p)}
                          className="p-2 rounded-md text-neutral-500 hover:bg-neutral-100 hover:text-black"
                          title="Edit"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(p)}
                          disabled={busyId === p.id}
                          className="p-2 rounded-md text-neutral-500 hover:bg-red-50 hover:text-red-600 disabled:opacity-30"
                          title="Hapus"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? "Edit Display Promo" : "Tambah Display Promo"}
        maxWidth="max-w-xl"
      >
        <form onSubmit={handleSave} className="space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-100 text-red-700 text-sm px-3 py-2 rounded-lg">
              {error}
            </div>
          )}

          <Input
            id="dp-title"
            label="Judul Promo"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="mis. Diskon Akhir Pekan"
            required
          />
          <Input
            id="dp-subtitle"
            label="Sub-judul (opsional)"
            value={subtitle}
            onChange={(e) => setSubtitle(e.target.value)}
            placeholder="mis. Penawaran Spesial"
          />

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-neutral-700">Jenis Display</label>
            <div className="grid grid-cols-2 gap-2">
              {(["percentage", "fixed_amount"] as DiscountType[]).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setDiscountType(t)}
                  className={`h-11 rounded-lg border text-sm font-medium transition-colors ${
                    discountType === t
                      ? "border-black bg-black text-white"
                      : "border-neutral-300 text-neutral-700 hover:border-neutral-400"
                  }`}
                >
                  {t === "percentage" ? "Diskon (%)" : "Potongan Harga (Rp)"}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="dp-value" className="text-sm font-medium text-neutral-700">
              Nominal {discountType === "percentage" ? "(%)" : "(Rp)"}
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-neutral-500 pointer-events-none">
                {discountType === "percentage" ? "%" : "Rp"}
              </span>
              <input
                id="dp-value"
                inputMode="numeric"
                value={
                  discountType === "percentage"
                    ? discountValue
                    : formatThousands(discountValue)
                }
                onChange={(e) =>
                  setDiscountValue(
                    discountType === "percentage"
                      ? e.target.value.replace(/\D/g, "")
                      : parseThousands(e.target.value)
                  )
                }
                className="h-11 w-full rounded-lg border border-neutral-300 pl-9 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-black"
                required
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="dp-stock" className="text-sm font-medium text-neutral-700">
              Stok Promo (opsional)
            </label>
            <input
              id="dp-stock"
              inputMode="numeric"
              value={formatThousands(stock)}
              onChange={(e) => setStock(parseThousands(e.target.value))}
              placeholder="Kosongkan jika tidak terbatas"
              className={`h-11 w-full rounded-lg border px-3 text-sm focus:outline-none focus:ring-2 ${
                stockExceeds
                  ? "border-red-400 focus:ring-red-400"
                  : "border-neutral-300 focus:ring-black"
              }`}
            />
            <p className={`text-xs ${stockExceeds ? "text-red-500" : "text-neutral-400"}`}>
              {selected.length > 0
                ? `Maks. ${maxStock.toLocaleString("id-ID")} (mengikuti total stok produk dipilih). `
                : "Pilih produk dulu untuk menentukan batas stok. "}
              Tampil sebagai &quot;Stok terbatas: X&quot; di banner.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="dp-start" className="text-sm font-medium text-neutral-700">
                Mulai
              </label>
              <input
                id="dp-start"
                type="datetime-local"
                value={startAt}
                onChange={(e) => setStartAt(e.target.value)}
                className="h-11 w-full rounded-lg border border-neutral-300 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-black"
                required
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label htmlFor="dp-end" className="text-sm font-medium text-neutral-700">
                Selesai
              </label>
              <input
                id="dp-end"
                type="datetime-local"
                value={endAt}
                onChange={(e) => setEndAt(e.target.value)}
                className="h-11 w-full rounded-lg border border-neutral-300 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-black"
                required
              />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-neutral-700">
                Produk yang ditampilkan
              </label>
              <Button type="button" variant="outline" size="sm" onClick={() => setPickerOpen(true)}>
                <Plus className="h-4 w-4" />
                Pilih Produk
              </Button>
            </div>
            {selected.length === 0 ? (
              <p className="text-xs text-neutral-400">Belum ada produk dipilih.</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {selected.map((p) => (
                  <span
                    key={p.id}
                    className="inline-flex items-center gap-1.5 bg-neutral-100 rounded-full pl-1.5 pr-2 py-1 text-xs"
                  >
                    <span className="relative h-5 w-5 rounded-full overflow-hidden bg-neutral-200 flex-shrink-0">
                      {p.image && (
                        <Image src={p.image} alt="" fill sizes="20px" className="object-cover" />
                      )}
                    </span>
                    <span className="max-w-[140px] truncate">{p.name}</span>
                    <button
                      type="button"
                      onClick={() => setSelected((s) => s.filter((x) => x.id !== p.id))}
                      className="text-neutral-400 hover:text-red-600"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          <label className="flex items-center gap-2 text-sm text-neutral-700">
            <input
              type="checkbox"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
              className="rounded border-neutral-300"
            />
            Aktif (tampil di beranda saat dalam periode)
          </label>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => setModalOpen(false)}>
              Batal
            </Button>
            <Button type="submit" loading={saving}>
              {editing ? "Simpan" : "Buat"}
            </Button>
          </div>
        </form>
      </Modal>

      <ProductPicker
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        onConfirm={onPickerConfirm}
        excludeIds={selected.map((p) => p.id)}
        multi
        title="Pilih Produk untuk Display Promo"
      />
    </div>
  );
}
