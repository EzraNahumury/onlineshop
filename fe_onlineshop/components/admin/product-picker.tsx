"use client";

import { useEffect, useState, useCallback } from "react";
import Image from "next/image";
import { X, Search, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/utils";

export interface PickerProduct {
  id: number;
  name: string;
  base_price: string;
  stock: number;
  category_name: string | null;
  primary_image: string | null;
}

export function ProductPicker({
  open,
  onClose,
  onConfirm,
  excludeIds = [],
  multi = true,
  title = "Pilih Produk",
}: {
  open: boolean;
  onClose: () => void;
  onConfirm: (products: PickerProduct[]) => void;
  excludeIds?: number[];
  multi?: boolean;
  title?: string;
}) {
  const [search, setSearch] = useState("");
  const [products, setProducts] = useState<PickerProduct[]>([]);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState<Map<number, PickerProduct>>(new Map());

  const fetchProducts = useCallback(
    async (q: string) => {
      setLoading(true);
      try {
        const res = await fetch(
          `/api/admin/products/search?q=${encodeURIComponent(q)}&limit=40`
        );
        const data = await res.json();
        if (res.ok) setProducts(data.products || []);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  useEffect(() => {
    if (!open) return;
    setSelected(new Map());
    fetchProducts("");
  }, [open, fetchProducts]);

  useEffect(() => {
    if (!open) return;
    const t = setTimeout(() => fetchProducts(search), 250);
    return () => clearTimeout(t);
  }, [search, open, fetchProducts]);

  function toggle(p: PickerProduct) {
    const next = new Map(selected);
    if (next.has(p.id)) next.delete(p.id);
    else {
      if (!multi) next.clear();
      next.set(p.id, p);
    }
    setSelected(next);
  }

  function handleConfirm() {
    onConfirm(Array.from(selected.values()));
    onClose();
  }

  if (!open) return null;

  const visible = products.filter((p) => !excludeIds.includes(p.id));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-3xl max-h-[85vh] flex flex-col">
        <div className="px-5 py-4 border-b border-neutral-200 flex items-center justify-between">
          <h3 className="text-base font-medium">{title}</h3>
          <button
            onClick={onClose}
            className="p-1 rounded-md hover:bg-neutral-100 text-neutral-500"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="px-5 py-3 border-b border-neutral-200">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400 pointer-events-none" />
            <input
              type="search"
              autoFocus
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari nama produk atau SKU…"
              className="h-10 w-full pl-9 pr-3 bg-neutral-50 border border-neutral-200 rounded-lg text-sm placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
            />
          </div>
        </div>

        <div className="flex-1 overflow-auto">
          {loading ? (
            <div className="flex items-center justify-center py-12 text-neutral-500">
              <Loader2 className="h-5 w-5 animate-spin" />
            </div>
          ) : visible.length === 0 ? (
            <div className="text-center py-12 text-sm text-neutral-500">
              {excludeIds.length > 0 && products.length > 0
                ? "Semua produk yang cocok sudah terpilih."
                : "Tidak ada produk yang cocok."}
            </div>
          ) : (
            <ul className="divide-y divide-neutral-100">
              {visible.map((p) => {
                const checked = selected.has(p.id);
                return (
                  <li key={p.id}>
                    <label className="flex items-center gap-3 px-5 py-3 cursor-pointer hover:bg-neutral-50">
                      <input
                        type={multi ? "checkbox" : "radio"}
                        checked={checked}
                        onChange={() => toggle(p)}
                        className="rounded border-neutral-300"
                      />
                      <div className="w-10 h-10 rounded-md bg-neutral-100 flex-shrink-0 overflow-hidden relative">
                        {p.primary_image && (
                          <Image
                            src={p.primary_image}
                            alt=""
                            fill
                            sizes="40px"
                            className="object-cover"
                          />
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="text-sm font-medium text-black truncate">
                          {p.name}
                        </div>
                        <div className="text-xs text-neutral-500">
                          {p.category_name || "Tanpa kategori"} · stok {p.stock}
                        </div>
                      </div>
                      <div className="text-sm font-medium tabular-nums">
                        {formatPrice(Number(p.base_price))}
                      </div>
                    </label>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        <div className="px-5 py-3 border-t border-neutral-200 flex items-center justify-between">
          <div className="text-xs text-neutral-500">
            {selected.size} produk dipilih
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={onClose}>
              Batal
            </Button>
            <Button
              size="sm"
              onClick={handleConfirm}
              disabled={selected.size === 0}
            >
              Konfirmasi ({selected.size})
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
