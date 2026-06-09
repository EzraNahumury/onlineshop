"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import type { ProductDetail, ShippingProfileRow } from "@/lib/queries/admin/products";

export function TabShipping({
  product,
  shipping,
}: {
  product: ProductDetail;
  shipping: ShippingProfileRow | null;
}) {
  const router = useRouter();
  const [weight, setWeight] = useState<string>(product.weight_grams.toString());
  const [length, setLength] = useState<string>(product.length_cm?.toString() || "");
  const [width, setWidth] = useState<string>(product.width_cm?.toString() || "");
  const [height, setHeight] = useState<string>(product.height_cm?.toString() || "");
  const [minPurchase, setMinPurchase] = useState<string>(product.min_purchase.toString());
  const [maxPurchase, setMaxPurchase] = useState<string>(
    product.max_purchase?.toString() || ""
  );
  const [isFree, setIsFree] = useState<boolean>(shipping?.is_free_shipping === 1);
  const [notes, setNotes] = useState<string>(shipping?.notes || "");
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<{ type: "ok" | "err"; text: string } | null>(null);

  async function handleSave() {
    setSaving(true);
    setMsg(null);
    try {
      const res = await fetch(`/api/admin/products/${product.id}/shipping`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          weight_grams: Number(weight),
          length_cm: length || null,
          width_cm: width || null,
          height_cm: height || null,
          min_purchase: Number(minPurchase) || 1,
          max_purchase: maxPurchase || null,
          is_free_shipping: isFree,
          notes,
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
        <h2 className="text-base font-medium text-black mb-1">Pengiriman</h2>
        <p className="text-xs text-neutral-500">
          Berat dan dimensi paket dipakai untuk menghitung ongkir.
        </p>
      </div>

      <div className="space-y-4">
        <Input
          id="weight"
          label="Berat (gram) *"
          type="number"
          min="1"
          step="1"
          value={weight}
          onChange={(e) => setWeight(e.target.value)}
        />

        <div className="grid grid-cols-3 gap-3">
          <Input
            id="length"
            label="Panjang (cm)"
            type="number"
            min="0"
            step="any"
            value={length}
            onChange={(e) => setLength(e.target.value)}
          />
          <Input
            id="width"
            label="Lebar (cm)"
            type="number"
            min="0"
            step="any"
            value={width}
            onChange={(e) => setWidth(e.target.value)}
          />
          <Input
            id="height"
            label="Tinggi (cm)"
            type="number"
            min="0"
            step="any"
            value={height}
            onChange={(e) => setHeight(e.target.value)}
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Input
            id="min_purchase"
            label="Min. pembelian"
            type="number"
            min="1"
            step="1"
            value={minPurchase}
            onChange={(e) => setMinPurchase(e.target.value)}
          />
          <Input
            id="max_purchase"
            label="Maks. pembelian (opsional)"
            type="number"
            min="1"
            step="1"
            value={maxPurchase}
            onChange={(e) => setMaxPurchase(e.target.value)}
          />
        </div>

        <label className="flex items-start gap-2 text-sm text-neutral-700">
          <input
            type="checkbox"
            checked={isFree}
            onChange={(e) => setIsFree(e.target.checked)}
            className="mt-0.5 rounded border-neutral-300"
          />
          <span>
            <span className="font-medium">Gratis ongkir</span>
            <span className="block text-xs text-neutral-500">
              Customer tidak dikenakan biaya pengiriman untuk produk ini.
            </span>
          </span>
        </label>

        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-neutral-700">Catatan pengiriman</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            placeholder="Misal: dikirim dalam kemasan kayu, dll."
            className="w-full rounded-lg border border-neutral-300 bg-white px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent resize-y"
          />
        </div>
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
        <Button onClick={handleSave} loading={saving}>
          Simpan Perubahan
        </Button>
      </div>
    </div>
  );
}
