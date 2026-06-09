"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { Plus, Trash2, ImagePlus, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/toast";
import { formatThousands, parseThousands } from "@/lib/utils";

export interface VariantValue {
  key: string;
  id?: number | null;
  option_name_1: string | null;
  option_value_1: string | null;
  option_name_2: string | null;
  option_value_2: string | null;
  price: number | "";
  stock: number | "";
  sku: string;
  image_url?: string | null;
}

export interface VariantBuilderState {
  enabled: boolean;
  name1: string;
  options1: string[];
  name2: string;
  options2: string[];
  rows: VariantValue[];
}

function makeKey(v1: string, v2: string) {
  return `${v1}__${v2}`;
}

export function VariantBuilder({
  initial,
  productId,
  onChange,
  onImageUpdate,
}: {
  initial: VariantBuilderState;
  productId?: number;
  onChange: (s: VariantBuilderState) => void;
  onImageUpdate?: () => void;
}) {
  const [state, setState] = useState<VariantBuilderState>(initial);

  function update(next: VariantBuilderState) {
    setState(next);
    onChange(next);
  }

  const combinations = useMemo(() => {
    if (!state.enabled) return [];
    const opts1 = state.options1.map((s) => s.trim()).filter(Boolean);
    const opts2 = state.options2.map((s) => s.trim()).filter(Boolean);
    if (opts1.length === 0) return [];
    if (state.name2 && opts2.length > 0) {
      const out: { v1: string; v2: string }[] = [];
      for (const a of opts1) for (const b of opts2) out.push({ v1: a, v2: b });
      return out;
    }
    return opts1.map((a) => ({ v1: a, v2: "" }));
  }, [state.enabled, state.name2, state.options1, state.options2]);

  useEffect(() => {
    if (!state.enabled) return;
    const existing = new Map(state.rows.map((r) => [r.key, r]));
    const newRows: VariantValue[] = combinations.map((c) => {
      const k = makeKey(c.v1, c.v2);
      const prev = existing.get(k);
      return prev
        ? { ...prev, option_name_1: state.name1, option_name_2: state.name2 || null, option_value_1: c.v1, option_value_2: c.v2 || null }
        : {
            key: k,
            option_name_1: state.name1,
            option_value_1: c.v1,
            option_name_2: state.name2 || null,
            option_value_2: c.v2 || null,
            price: "",
            stock: "",
            sku: "",
          };
    });
    if (
      newRows.length !== state.rows.length ||
      newRows.some((r, i) => r.key !== state.rows[i]?.key)
    ) {
      update({ ...state, rows: newRows });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [combinations, state.name1, state.name2, state.enabled]);

  function setRow(i: number, patch: Partial<VariantValue>) {
    const rows = state.rows.map((r, idx) => (idx === i ? { ...r, ...patch } : r));
    update({ ...state, rows });
  }

  function addOption(group: 1 | 2) {
    if (group === 1) update({ ...state, options1: [...state.options1, ""] });
    else update({ ...state, options2: [...state.options2, ""] });
  }

  function removeOption(group: 1 | 2, idx: number) {
    if (group === 1) {
      const next = state.options1.filter((_, i) => i !== idx);
      update({ ...state, options1: next.length ? next : [""] });
    } else {
      const next = state.options2.filter((_, i) => i !== idx);
      update({ ...state, options2: next });
    }
  }

  function setOption(group: 1 | 2, idx: number, val: string) {
    if (group === 1) {
      const next = state.options1.map((o, i) => (i === idx ? val : o));
      update({ ...state, options1: next });
    } else {
      const next = state.options2.map((o, i) => (i === idx ? val : o));
      update({ ...state, options2: next });
    }
  }

  function applyToAll(field: "price" | "stock", value: number) {
    const rows = state.rows.map((r) => ({ ...r, [field]: value }));
    update({ ...state, rows });
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between p-4 border border-neutral-200 rounded-lg bg-white">
        <div>
          <div className="text-sm font-medium text-black">Aktifkan variasi</div>
          <div className="text-xs text-neutral-500 mt-0.5">
            Aktifkan jika produk punya pilihan seperti warna atau ukuran.
          </div>
        </div>
        <button
          type="button"
          role="switch"
          aria-checked={state.enabled}
          onClick={() => update({ ...state, enabled: !state.enabled })}
          className={
            state.enabled
              ? "relative h-6 w-11 rounded-full bg-black transition-colors"
              : "relative h-6 w-11 rounded-full bg-neutral-300 transition-colors"
          }
        >
          <span
            className={
              state.enabled
                ? "absolute top-0.5 left-6 h-5 w-5 rounded-full bg-white transition-transform"
                : "absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white transition-transform"
            }
          />
        </button>
      </div>

      {state.enabled && (
        <div className="space-y-6 border border-neutral-200 rounded-lg p-5 bg-white">
          <VariantGroup
            label="Variasi 1"
            namePlaceholder="Misal: Warna"
            name={state.name1}
            options={state.options1}
            onNameChange={(v) => update({ ...state, name1: v })}
            onAddOption={() => addOption(1)}
            onRemoveOption={(i) => removeOption(1, i)}
            onSetOption={(i, v) => setOption(1, i, v)}
          />

          <VariantGroup
            label="Variasi 2 (opsional)"
            namePlaceholder="Misal: Ukuran"
            name={state.name2}
            options={state.options2}
            onNameChange={(v) => {
              if (!v.trim()) update({ ...state, name2: "", options2: [] });
              else update({ ...state, name2: v });
            }}
            onAddOption={() => addOption(2)}
            onRemoveOption={(i) => removeOption(2, i)}
            onSetOption={(i, v) => setOption(2, i, v)}
            allowEmpty
          />

          {state.rows.length > 0 && (
            <>
              <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-neutral-100">
                <span className="text-xs text-neutral-500">Perubahan massal:</span>
                <BulkSet
                  label="Set semua harga"
                  onApply={(n) => applyToAll("price", n)}
                  money
                />
                <BulkSet
                  label="Set semua stok"
                  onApply={(n) => applyToAll("stock", n)}
                  asInt
                />
              </div>

              <div className="overflow-x-auto -mx-5">
                <table className="w-full text-sm">
                  <thead className="bg-neutral-50 text-xs uppercase tracking-wider text-neutral-500">
                    <tr>
                      <th className="text-left px-5 py-2 font-medium">Foto</th>
                      <th className="text-left px-3 py-2 font-medium">Variasi</th>
                      <th className="text-left px-3 py-2 font-medium">SKU</th>
                      <th className="text-right px-3 py-2 font-medium">Harga</th>
                      <th className="text-right px-3 py-2 font-medium">Stok</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-100">
                    {state.rows.map((r, i) => (
                      <tr key={r.key}>
                        <td className="px-5 py-2">
                          <VariantImageCell
                            productId={productId}
                            variantId={r.id ?? null}
                            currentUrl={r.image_url ?? null}
                            onUploaded={(url) => {
                              setRow(i, { image_url: url });
                              onImageUpdate?.();
                            }}
                          />
                        </td>
                        <td className="px-3 py-2">
                          <div className="font-medium text-black">{r.option_value_1}</div>
                          {r.option_value_2 && (
                            <div className="text-xs text-neutral-500">{r.option_value_2}</div>
                          )}
                        </td>
                        <td className="px-3 py-2">
                          <input
                            value={r.sku}
                            onChange={(e) => setRow(i, { sku: e.target.value })}
                            className="h-9 w-32 px-2 border border-neutral-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-black"
                            placeholder="SKU"
                          />
                        </td>
                        <td className="px-3 py-2 text-right">
                          <input
                            type="text"
                            inputMode="numeric"
                            value={r.price === "" ? "" : formatThousands(r.price)}
                            onChange={(e) => {
                              const d = parseThousands(e.target.value);
                              setRow(i, { price: d === "" ? "" : Number(d) });
                            }}
                            className="h-9 w-32 px-2 border border-neutral-300 rounded text-sm text-right focus:outline-none focus:ring-1 focus:ring-black"
                            placeholder="0"
                          />
                        </td>
                        <td className="px-3 py-2 text-right">
                          <input
                            type="number"
                            min="0"
                            step="1"
                            value={r.stock}
                            onChange={(e) =>
                              setRow(i, {
                                stock: e.target.value === "" ? "" : Number(e.target.value),
                              })
                            }
                            className="h-9 w-24 px-2 border border-neutral-300 rounded text-sm text-right focus:outline-none focus:ring-1 focus:ring-black"
                            placeholder="0"
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}

function VariantGroup({
  label,
  name,
  namePlaceholder,
  options,
  allowEmpty,
  onNameChange,
  onAddOption,
  onRemoveOption,
  onSetOption,
}: {
  label: string;
  name: string;
  namePlaceholder: string;
  options: string[];
  allowEmpty?: boolean;
  onNameChange: (v: string) => void;
  onAddOption: () => void;
  onRemoveOption: (i: number) => void;
  onSetOption: (i: number, v: string) => void;
}) {
  return (
    <div className="space-y-2">
      <div className="text-sm font-medium text-neutral-700">{label}</div>
      <Input
        placeholder={namePlaceholder}
        value={name}
        onChange={(e) => onNameChange(e.target.value)}
      />
      {(options.length > 0 || !allowEmpty) && (
        <>
          <div className="text-xs text-neutral-500">Opsi</div>
          <div className="flex flex-wrap gap-2">
            {options.map((o, i) => (
              <div key={i} className="flex items-center gap-1">
                <input
                  value={o}
                  onChange={(e) => onSetOption(i, e.target.value)}
                  className="h-9 w-32 px-2 border border-neutral-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-black"
                  placeholder="Opsi"
                />
                <button
                  type="button"
                  onClick={() => onRemoveOption(i)}
                  className="p-1 text-neutral-400 hover:text-red-600"
                  title="Hapus opsi"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onAddOption}
            >
              <Plus className="h-3.5 w-3.5" />
              Tambah opsi
            </Button>
          </div>
        </>
      )}
    </div>
  );
}

function VariantImageCell({
  productId,
  variantId,
  currentUrl,
  onUploaded,
}: {
  productId: number | undefined;
  variantId: number | null;
  currentUrl: string | null;
  onUploaded: (url: string | null) => void;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const disabled = !productId || !variantId;

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !productId || !variantId) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("image", file);
      const res = await fetch(
        `/api/admin/products/${productId}/variants/${variantId}/image`,
        { method: "POST", body: fd }
      );
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Gagal mengunggah");
        return;
      }
      onUploaded(data.image_url);
      toast.success("Foto variasi tersimpan");
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  async function handleRemove() {
    if (!productId || !variantId) return;
    setUploading(true);
    try {
      const res = await fetch(
        `/api/admin/products/${productId}/variants/${variantId}/image`,
        { method: "DELETE" }
      );
      if (!res.ok) return;
      onUploaded(null);
    } finally {
      setUploading(false);
    }
  }

  if (disabled) {
    return (
      <div
        className="w-16 h-16 rounded-lg border-2 border-dashed border-neutral-200 bg-neutral-50 flex items-center justify-center text-[10px] text-neutral-400 text-center leading-tight px-1"
        title="Simpan variasi dulu untuk bisa unggah foto"
      >
        Simpan dulu
      </div>
    );
  }

  if (currentUrl) {
    return (
      <div className="relative w-16 h-16 rounded-lg overflow-hidden border border-neutral-200 bg-neutral-50 group">
        <Image src={currentUrl} alt="" fill sizes="64px" className="object-cover" />
        <button
          type="button"
          onClick={handleRemove}
          disabled={uploading}
          className="absolute top-0.5 right-0.5 w-5 h-5 rounded-full bg-white shadow border border-neutral-200 text-neutral-500 hover:text-red-600 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
          aria-label="Hapus foto"
        >
          <X className="h-3 w-3" />
        </button>
      </div>
    );
  }

  return (
    <label className="w-16 h-16 rounded-lg border-2 border-dashed border-neutral-300 bg-white flex flex-col items-center justify-center gap-0.5 cursor-pointer hover:border-black hover:bg-neutral-50 transition-colors">
      <input
        ref={fileRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={handleFile}
        disabled={uploading}
      />
      <ImagePlus className="h-4 w-4 text-neutral-400" />
      <span className="text-[10px] text-neutral-400">
        {uploading ? "..." : "Foto"}
      </span>
    </label>
  );
}

function BulkSet({
  label,
  onApply,
  asInt,
  money,
}: {
  label: string;
  onApply: (n: number) => void;
  asInt?: boolean;
  money?: boolean;
}) {
  const [value, setValue] = useState("");
  return (
    <div className="flex items-center gap-1">
      <input
        type={money ? "text" : "number"}
        inputMode="numeric"
        value={money ? formatThousands(value) : value}
        onChange={(e) =>
          setValue(money ? parseThousands(e.target.value) : e.target.value)
        }
        placeholder={label}
        className="h-8 w-32 px-2 border border-neutral-300 rounded text-xs focus:outline-none focus:ring-1 focus:ring-black"
      />
      <button
        type="button"
        onClick={() => {
          const n = Number(value);
          if (!Number.isFinite(n)) return;
          onApply(asInt ? Math.round(n) : n);
        }}
        className="h-8 px-3 text-xs font-medium border border-neutral-300 rounded hover:bg-neutral-100"
      >
        Terapkan
      </button>
    </div>
  );
}
