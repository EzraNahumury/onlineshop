"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Star, Check, ShoppingBag } from "lucide-react";
import { formatPrice } from "@/lib/utils";
import { useCart } from "@/lib/store/cart";
import { toast } from "@/components/ui/toast";

interface ProductCardProps {
  slug: string;
  name: string;
  price: number;
  originalPrice?: number;
  imageUrl: string;
  badge?: string;
  productId?: number;
  category?: string | null;
  rating?: number;
  ratingCount?: number;
  stock?: number;
  hasVariant?: boolean;
}

export function ProductCard({
  slug,
  name,
  price,
  originalPrice,
  imageUrl,
  badge,
  productId,
  category,
  rating = 0,
  ratingCount = 0,
  stock = 0,
  hasVariant = false,
}: ProductCardProps) {
  const router = useRouter();
  const addItem = useCart((s) => s.addItem);
  const [added, setAdded] = useState(false);

  const hasDiscount = !!originalPrice && originalPrice > price;
  const discountPercent = hasDiscount
    ? Math.round(((originalPrice! - price) / originalPrice!) * 100)
    : 0;
  const soldOut = !hasVariant && stock <= 0;
  const needsOptions = hasVariant;

  function quickAdd() {
    if (productId == null) return;
    addItem({
      productId,
      variantId: null,
      productSlug: slug,
      productName: name,
      variantLabel: null,
      imageUrl,
      unitPrice: price,
      quantity: 1,
      maxStock: stock,
    });
  }

  function handleAddToCart(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (needsOptions || productId == null) {
      router.push(`/products/${slug}`);
      return;
    }
    if (soldOut) return;
    quickAdd();
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
    toast.success("Ditambahkan ke keranjang");
  }

  function handleBuyNow(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (needsOptions || productId == null) {
      router.push(`/products/${slug}`);
      return;
    }
    if (soldOut) return;
    quickAdd();
    router.push("/cart");
  }

  return (
    <div className="group flex h-full flex-col overflow-hidden rounded-2xl border border-neutral-200/80 bg-white transition-all duration-300 hover:-translate-y-1 hover:border-neutral-300 hover:shadow-[0_18px_45px_-15px_rgba(0,0,0,0.18)]">
      {/* Image */}
      <Link
        href={`/products/${slug}`}
        className="relative aspect-square overflow-hidden bg-gradient-to-br from-neutral-50 to-neutral-100 block"
      >
        <Image
          src={imageUrl}
          alt={name}
          fill
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          className="object-cover transition-transform duration-500 ease-out group-hover:scale-105"
        />
        {/* subtle top gradient for badge legibility */}
        <div className="pointer-events-none absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-black/5 to-transparent" />

        {(hasDiscount || badge) && (
          <span
            className={`absolute top-3 left-3 text-[10px] font-bold px-2.5 py-1 rounded-full shadow-sm ${
              hasDiscount
                ? "bg-red-600 text-white"
                : "bg-neutral-900 text-white tracking-widest uppercase"
            }`}
          >
            {hasDiscount ? `-${discountPercent}%` : badge}
          </span>
        )}
        {category && (
          <span className="absolute top-3 right-3 bg-white/95 backdrop-blur text-neutral-700 text-[10px] font-semibold px-2.5 py-1 rounded-full shadow-sm ring-1 ring-black/5">
            {category}
          </span>
        )}
        {soldOut && (
          <span className="absolute inset-0 bg-white/65 backdrop-blur-[1px] flex items-center justify-center text-xs font-semibold text-neutral-800">
            Stok Habis
          </span>
        )}
      </Link>

      {/* Info */}
      <div className="flex flex-1 flex-col p-4">
        <Link href={`/products/${slug}`}>
          <h3 className="font-semibold text-[15px] leading-snug text-neutral-900 group-hover:text-black transition-colors line-clamp-1">
            {name}
          </h3>
        </Link>

        <div className="mt-1.5 flex items-end justify-between gap-2">
          <div className="flex items-center gap-1 text-xs text-neutral-500 min-w-0">
            <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400 flex-shrink-0" />
            {ratingCount > 0 ? (
              <span className="truncate">
                <span className="font-medium text-neutral-700">{rating.toFixed(1)}</span>{" "}
                <span className="text-neutral-400">({ratingCount})</span>
              </span>
            ) : (
              <span className="text-neutral-400">Baru</span>
            )}
          </div>
          <div className="text-right flex-shrink-0">
            <div
              className={`font-bold text-base tabular-nums ${
                hasDiscount ? "text-red-600" : "text-neutral-900"
              }`}
            >
              {formatPrice(price)}
            </div>
            {hasDiscount && (
              <div className="text-[11px] text-neutral-400 line-through tabular-nums -mt-0.5">
                {formatPrice(originalPrice!)}
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="mt-4 grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={handleAddToCart}
            disabled={soldOut}
            className="h-10 rounded-full border border-neutral-300 text-xs font-semibold text-neutral-800 transition-all hover:border-neutral-900 hover:bg-neutral-900 hover:text-white active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:text-neutral-800 inline-flex items-center justify-center gap-1.5 whitespace-nowrap"
          >
            {added ? (
              <>
                <Check className="h-4 w-4 text-emerald-500" />
                Ditambah
              </>
            ) : needsOptions ? (
              "Pilih Opsi"
            ) : (
              <>
                <ShoppingBag className="h-3.5 w-3.5" />
                Keranjang
              </>
            )}
          </button>
          <button
            type="button"
            onClick={handleBuyNow}
            disabled={soldOut}
            className="h-10 rounded-full bg-neutral-900 text-white text-xs font-semibold shadow-sm transition-all hover:bg-black hover:shadow-md active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed whitespace-nowrap"
          >
            Beli
          </button>
        </div>
      </div>
    </div>
  );
}
