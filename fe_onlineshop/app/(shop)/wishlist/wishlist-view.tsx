"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Heart, Trash2, ShoppingBag } from "lucide-react";
import { formatPrice } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { confirm } from "@/components/ui/confirm";
import { toast } from "@/components/ui/toast";

const PLACEHOLDER =
  "https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=600&h=800&fit=crop";

export type WishlistItemUI = {
  id: number;
  product_id: number;
  slug: string;
  name: string;
  base_price: number;
  primary_image: string | null;
  status: string;
};

export function WishlistView({
  initialItems,
}: {
  initialItems: WishlistItemUI[];
}) {
  const router = useRouter();
  const [items, setItems] = useState(initialItems);
  const [busyId, setBusyId] = useState<number | null>(null);
  const [, startTransition] = useTransition();

  async function handleRemove(productId: number, name: string) {
    const ok = await confirm({
      title: `Hapus "${name}" dari wishlist?`,
      confirmText: "Hapus",
      variant: "danger",
    });
    if (!ok) return;

    setBusyId(productId);
    try {
      const res = await fetch("/api/wishlist", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ product_id: productId }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        toast.error(data.error || "Gagal menghapus dari wishlist");
        return;
      }
      setItems((prev) => prev.filter((i) => i.product_id !== productId));
      toast.success("Dihapus dari wishlist");
      startTransition(() => router.refresh());
    } finally {
      setBusyId(null);
    }
  }

  function handleAddToCart(item: WishlistItemUI) {
    // Varian & stok dipilih di halaman produk — redirect ke sana.
    router.push(`/products/${item.slug}`);
  }

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-md text-center py-16">
        <div className="mx-auto w-14 h-14 rounded-full bg-red-50 flex items-center justify-center mb-5">
          <Heart className="w-6 h-6 text-red-500" />
        </div>
        <h2 className="text-base font-medium text-black">
          Wishlist kamu masih kosong
        </h2>
        <p className="text-sm text-neutral-500 mt-1.5">
          Simpan produk yang kamu suka dengan tap icon hati di halaman produk.
        </p>
        <Link
          href="/collections"
          className="inline-flex items-center gap-1.5 mt-7 h-10 px-5 rounded-full bg-black text-white text-sm font-medium hover:bg-neutral-800 transition-colors"
        >
          Jelajahi produk
        </Link>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
      {items.map((item) => {
        const unavailable = item.status !== "live";
        return (
          <div
            key={item.id}
            className="group relative bg-white border border-neutral-100 rounded-2xl overflow-hidden hover:shadow-md transition-shadow"
          >
            <Link href={`/products/${item.slug}`} className="block">
              <div className="relative aspect-[4/5] bg-neutral-100 overflow-hidden">
                <Image
                  src={item.primary_image || PLACEHOLDER}
                  alt={item.name}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
                {unavailable && (
                  <div className="absolute inset-0 bg-white/80 flex items-center justify-center">
                    <span className="text-xs tracking-widest uppercase text-neutral-700 font-medium bg-white px-3 py-1.5 rounded-full border border-neutral-200">
                      Tidak Tersedia
                    </span>
                  </div>
                )}
              </div>
            </Link>

            <button
              type="button"
              onClick={() => handleRemove(item.product_id, item.name)}
              disabled={busyId === item.product_id}
              className="absolute top-3 right-3 w-9 h-9 rounded-full bg-white/95 backdrop-blur shadow-sm border border-neutral-200 flex items-center justify-center text-neutral-500 hover:text-red-600 hover:border-red-200 transition-colors disabled:opacity-50"
              aria-label="Hapus dari wishlist"
            >
              <Trash2 className="h-4 w-4" />
            </button>

            <div className="p-4 space-y-3">
              <Link
                href={`/products/${item.slug}`}
                className="block text-sm font-medium text-neutral-900 hover:text-black line-clamp-2 leading-snug"
              >
                {item.name}
              </Link>
              <div className="text-base font-semibold text-black">
                {formatPrice(item.base_price)}
              </div>
              <Button
                onClick={() => handleAddToCart(item)}
                disabled={unavailable}
                className="w-full"
                size="sm"
              >
                <ShoppingBag className="h-4 w-4" />
                {unavailable ? "Tidak Tersedia" : "Lihat Produk"}
              </Button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
