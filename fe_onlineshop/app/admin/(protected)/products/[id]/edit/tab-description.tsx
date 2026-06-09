"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import type { ProductDetail } from "@/lib/queries/admin/products";

const MIN = 20;
const MAX = 5000;

export function TabDescription({ product }: { product: ProductDetail }) {
  const router = useRouter();
  const [description, setDescription] = useState(product.description || "");
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<{ type: "ok" | "err"; text: string } | null>(null);

  const length = description.length;
  const tooShort = length > 0 && length < MIN;
  const tooLong = length > MAX;

  async function handleSave() {
    setSaving(true);
    setMsg(null);
    try {
      const res = await fetch(`/api/admin/products/${product.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ section: "description", description }),
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
    <div className="space-y-4">
      <div>
        <h2 className="text-base font-medium text-black mb-1">Deskripsi Produk</h2>
        <p className="text-xs text-neutral-500">
          Jelaskan produk Anda. Sertakan bahan, ukuran, instruksi penggunaan, dan info penting
          lainnya. Minimal {MIN} karakter, maks {MAX}.
        </p>
      </div>

      <textarea
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        rows={12}
        maxLength={MAX}
        placeholder="Tulis deskripsi produk di sini…"
        className="w-full rounded-lg border border-neutral-300 bg-white px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent resize-y"
      />

      <div className="flex items-center justify-between text-xs">
        <span
          className={
            tooShort
              ? "text-amber-600"
              : tooLong
              ? "text-red-600"
              : "text-neutral-500"
          }
        >
          {tooShort && `Disarankan minimal ${MIN} karakter`}
          {tooLong && `Melebihi batas ${MAX} karakter`}
        </span>
        <span className="text-neutral-500 tabular-nums">
          {length} / {MAX}
        </span>
      </div>

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
        <Button onClick={handleSave} loading={saving} disabled={tooLong}>
          Simpan Perubahan
        </Button>
      </div>
    </div>
  );
}
