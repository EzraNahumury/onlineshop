"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ImagePlus, Star, Trash2, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { confirm } from "@/components/ui/confirm";

export interface UploaderImage {
  id: number;
  image_url: string;
  is_primary: number;
}

export function ImageUploader({
  productId,
  images,
}: {
  productId: number;
  images: UploaderImage[];
}) {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [busyId, setBusyId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleFiles(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setError(null);
    setUploading(true);
    try {
      const fd = new FormData();
      for (let i = 0; i < files.length; i++) {
        fd.append("images", files[i]);
      }
      const res = await fetch(`/api/admin/products/${productId}/images`, {
        method: "POST",
        body: fd,
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Gagal mengunggah");
        return;
      }
      router.refresh();
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  async function handleDelete(imageId: number) {
    const ok = await confirm({
      title: "Hapus foto ini?",
      description: "Foto akan dihapus permanen dari produk.",
      confirmText: "Hapus",
      variant: "danger",
    });
    if (!ok) return;
    setBusyId(imageId);
    try {
      const res = await fetch(`/api/admin/products/${productId}/images/${imageId}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error || "Gagal menghapus");
        return;
      }
      router.refresh();
    } finally {
      setBusyId(null);
    }
  }

  async function handlePrimary(imageId: number) {
    setBusyId(imageId);
    try {
      const res = await fetch(`/api/admin/products/${productId}/images/${imageId}`, {
        method: "PUT",
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error || "Gagal mengubah foto utama");
        return;
      }
      router.refresh();
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="space-y-3">
      {error && (
        <div className="bg-red-50 text-red-600 text-sm px-3 py-2 rounded-lg border border-red-200">
          {error}
        </div>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
        {images.map((img) => (
          <div
            key={img.id}
            className="relative aspect-square rounded-lg overflow-hidden border border-neutral-200 bg-neutral-50 group"
          >
            <Image
              src={img.image_url}
              alt=""
              fill
              sizes="160px"
              className="object-cover"
            />
            {img.is_primary === 1 && (
              <div className="absolute top-1 left-1 inline-flex items-center gap-1 bg-black/80 text-white text-[10px] px-1.5 py-0.5 rounded-md">
                <Star className="h-3 w-3 fill-white" />
                Utama
              </div>
            )}
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
              {img.is_primary !== 1 && (
                <button
                  type="button"
                  onClick={() => handlePrimary(img.id)}
                  disabled={busyId === img.id}
                  className="p-2 bg-white rounded-full hover:bg-neutral-100 disabled:opacity-50"
                  title="Jadikan foto utama"
                >
                  <Star className="h-4 w-4" />
                </button>
              )}
              <button
                type="button"
                onClick={() => handleDelete(img.id)}
                disabled={busyId === img.id}
                className="p-2 bg-white rounded-full hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
                title="Hapus"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}

        <label
          className={cn(
            "aspect-square rounded-lg border-2 border-dashed flex flex-col items-center justify-center gap-1 cursor-pointer transition-colors",
            uploading
              ? "border-neutral-200 bg-neutral-50 cursor-wait"
              : "border-neutral-300 hover:border-black hover:bg-neutral-50"
          )}
        >
          <input
            ref={fileRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            multiple
            className="hidden"
            onChange={handleFiles}
            disabled={uploading}
          />
          {uploading ? (
            <Loader2 className="h-5 w-5 text-neutral-500 animate-spin" />
          ) : (
            <ImagePlus className="h-5 w-5 text-neutral-500" />
          )}
          <span className="text-xs text-neutral-500 text-center px-2">
            {uploading ? "Mengunggah…" : "Tambah foto"}
          </span>
        </label>
      </div>

      <p className="text-xs text-neutral-500">
        JPG, PNG, atau WEBP. Maks 5MB per file. Foto pertama otomatis jadi foto utama.
      </p>
    </div>
  );
}
