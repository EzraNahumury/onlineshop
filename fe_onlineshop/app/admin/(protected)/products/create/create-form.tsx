"use client";

import { useRef, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { ImagePlus, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import type { CategoryRow } from "@/lib/queries/admin/categories";

export function CreateProductForm({
  categories,
}: {
  categories: CategoryRow[];
}) {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [name, setName] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [sku, setSku] = useState("");
  const [gtin, setGtin] = useState("");
  const [noGtin, setNoGtin] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const categoryGroups = useMemo(() => {
    const parents = categories.filter((c) => c.parent_id === null);
    return parents.map((parent) => ({
      parent,
      children: categories.filter((c) => c.parent_id === parent.id),
    }));
  }, [categories]);

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const fl = e.target.files;
    if (!fl) return;
    const arr = Array.from(fl);
    setFiles((prev) => [...prev, ...arr]);
    setPreviews((prev) => [...prev, ...arr.map((f) => URL.createObjectURL(f))]);
    if (fileRef.current) fileRef.current.value = "";
  }

  function removeFile(i: number) {
    setFiles((prev) => prev.filter((_, idx) => idx !== i));
    setPreviews((prev) => {
      const url = prev[i];
      if (url) URL.revokeObjectURL(url);
      return prev.filter((_, idx) => idx !== i);
    });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError("Nama produk wajib diisi");
      return;
    }
    if (files.length === 0) {
      setError("Wajib upload minimal 1 foto produk");
      return;
    }
    if (!noGtin && !gtin.trim()) {
      // GTIN optional jika ditandai "tanpa GTIN" — di luar itu tetap optional, tidak block
    }

    setLoading(true);
    try {
      const fd = new FormData();
      fd.append("name", name.trim());
      if (categoryId) fd.append("category_id", categoryId);
      if (sku.trim()) fd.append("sku", sku.trim());
      if (gtin.trim() && !noGtin) fd.append("gtin", gtin.trim());
      for (const f of files) fd.append("images", f);

      const res = await fetch("/api/admin/products", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Gagal menyimpan produk");
        return;
      }
      router.push(`/admin/products/${data.id}/edit`);
    } catch {
      setError("Terjadi kesalahan jaringan. Coba lagi.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-lg border border-red-200">
          {error}
        </div>
      )}

      <div>
        <div className="text-sm font-medium text-neutral-700 mb-2">Foto Produk</div>
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
          {previews.map((url, i) => (
            <div
              key={i}
              className="relative aspect-square rounded-lg overflow-hidden border border-neutral-200"
            >
              <Image src={url} alt="" fill sizes="160px" className="object-cover" />
              {i === 0 && (
                <div className="absolute top-1 left-1 bg-black/80 text-white text-[10px] px-1.5 py-0.5 rounded-md">
                  Utama
                </div>
              )}
              <button
                type="button"
                onClick={() => removeFile(i)}
                className="absolute top-1 right-1 bg-white rounded-full p-1 hover:bg-red-50 hover:text-red-600 shadow"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
          <label className="aspect-square rounded-lg border-2 border-dashed border-neutral-300 hover:border-black hover:bg-neutral-50 flex flex-col items-center justify-center gap-1 cursor-pointer transition-colors">
            <input
              ref={fileRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              multiple
              className="hidden"
              onChange={handleFileSelect}
            />
            <ImagePlus className="h-5 w-5 text-neutral-500" />
            <span className="text-xs text-neutral-500">Tambah foto</span>
          </label>
        </div>
        <p className="text-xs text-neutral-500 mt-2">
          JPG, PNG, atau WEBP. Maks 5MB per file. Foto pertama menjadi foto utama.
        </p>
      </div>

      <Input
        id="name"
        label="Nama Produk *"
        placeholder="Misal: Kaos Polos Premium"
        value={name}
        onChange={(e) => setName(e.target.value)}
        required
        maxLength={255}
      />

      <div className="flex flex-col gap-1.5">
        <label htmlFor="category" className="text-sm font-medium text-neutral-700">
          Kategori
        </label>
        <select
          id="category"
          value={categoryId}
          onChange={(e) => setCategoryId(e.target.value)}
          className="h-11 rounded-lg border border-neutral-300 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
        >
          <option value="">— Pilih kategori —</option>
          {categoryGroups.map(({ parent, children }) =>
            children.length === 0 ? (
              <option key={parent.id} value={parent.id}>
                {parent.name}
              </option>
            ) : (
              <optgroup key={parent.id} label={parent.name}>
                <option value={parent.id}>{parent.name} (semua)</option>
                {children.map((c) => (
                  <option key={c.id} value={c.id}>
                    &nbsp;&nbsp;{c.name}
                  </option>
                ))}
              </optgroup>
            )
          )}
        </select>
        <p className="text-xs text-neutral-500">
          Produk akan muncul di menu <strong>{categoryGroups.map((g) => g.parent.name).join(" / ")}</strong> sesuai kategori.
        </p>
      </div>

      <Input
        id="sku"
        label="Kode Produk / SKU"
        placeholder="Opsional"
        value={sku}
        onChange={(e) => setSku(e.target.value)}
      />

      <div className="space-y-2">
        <Input
          id="gtin"
          label="GTIN / Barcode"
          placeholder="Opsional"
          value={gtin}
          onChange={(e) => setGtin(e.target.value)}
          disabled={noGtin}
        />
        <label className="inline-flex items-center gap-2 text-sm text-neutral-600">
          <input
            type="checkbox"
            checked={noGtin}
            onChange={(e) => {
              setNoGtin(e.target.checked);
              if (e.target.checked) setGtin("");
            }}
            className="rounded border-neutral-300"
          />
          Produk tidak punya GTIN
        </label>
      </div>

      <div className="flex justify-end gap-2 pt-4 border-t border-neutral-200">
        <Button type="submit" loading={loading}>
          Selanjutnya
        </Button>
      </div>
    </form>
  );
}
