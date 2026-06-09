"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { useProductView } from "@/lib/store/product-view";

export interface GalleryImage {
  id: number;
  image_url: string;
  alt_text: string | null;
}

export interface VariantImageMap {
  [color: string]: string;
}

export function ProductGallery({
  images,
  productName,
  fallback,
  variantImages,
  productId,
}: {
  images: GalleryImage[];
  productName: string;
  fallback: string;
  variantImages?: VariantImageMap;
  productId?: number;
}) {
  const [activeIdx, setActiveIdx] = useState(0);

  const baseList: GalleryImage[] =
    images.length > 0
      ? images
      : [{ id: 0, image_url: fallback, alt_text: productName }];

  // Merge variant images (deduped by URL) into the thumbnail list so users
  // can see and click variant shots too.
  const list = (() => {
    const seen = new Set(baseList.map((i) => i.image_url));
    const extra: GalleryImage[] = [];
    if (variantImages) {
      for (const [color, url] of Object.entries(variantImages)) {
        if (url && !seen.has(url)) {
          seen.add(url);
          extra.push({
            id: -(extra.length + 1), // negative ids to avoid collision
            image_url: url,
            alt_text: `${productName} — ${color}`,
          });
        }
      }
    }
    return [...baseList, ...extra];
  })();

  const viewedProductId = useProductView((s) => s.productId);
  const selectedColor = useProductView((s) => s.selectedColor);

  // Resolve variant image override — only when this gallery corresponds to the
  // currently-viewed product AND a color with a photo is selected.
  const variantImage =
    productId && viewedProductId === productId && selectedColor && variantImages
      ? variantImages[selectedColor] ?? null
      : null;

  const displayUrl = variantImage || list[activeIdx]?.image_url || list[0].image_url;
  const active =
    list.find((i) => i.image_url === displayUrl) || list[activeIdx] || list[0];

  // Active thumbnail should reflect what the main image actually shows,
  // not just the last-clicked thumbnail — otherwise variant overrides look
  // disconnected from the thumb row.
  const activeDisplayIdx = list.findIndex((i) => i.image_url === displayUrl);

  return (
    <div className="flex flex-col gap-3 w-full max-w-md mx-auto lg:max-w-lg">
      <div className="relative aspect-square rounded-2xl overflow-hidden bg-neutral-100">
        <Image
          src={displayUrl}
          alt={active.alt_text || productName}
          fill
          priority
          sizes="(max-width: 768px) 100vw, 512px"
          className="object-cover"
        />
      </div>

      {list.length > 1 && (
        <ThumbnailScroller
          list={list}
          activeDisplayIdx={activeDisplayIdx}
          onPick={setActiveIdx}
          productName={productName}
        />
      )}
    </div>
  );
}

function ThumbnailScroller({
  list,
  activeDisplayIdx,
  onPick,
  productName,
}: {
  list: GalleryImage[];
  activeDisplayIdx: number;
  onPick: (i: number) => void;
  productName: string;
}) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canLeft, setCanLeft] = useState(false);
  const [canRight, setCanRight] = useState(false);

  function updateArrows() {
    const el = scrollRef.current;
    if (!el) return;
    setCanLeft(el.scrollLeft > 4);
    setCanRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
  }

  useEffect(() => {
    updateArrows();
    const el = scrollRef.current;
    if (!el) return;
    el.addEventListener("scroll", updateArrows, { passive: true });
    window.addEventListener("resize", updateArrows);
    return () => {
      el.removeEventListener("scroll", updateArrows);
      window.removeEventListener("resize", updateArrows);
    };
  }, [list.length]);

  function scrollBy(dx: number) {
    scrollRef.current?.scrollBy({ left: dx, behavior: "smooth" });
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => scrollBy(-320)}
        aria-label="Sebelumnya"
        className={cn(
          "absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2 z-10 w-9 h-9 rounded-full bg-white shadow-md border border-neutral-200 flex items-center justify-center text-neutral-700 hover:bg-neutral-50 hover:text-black transition-all",
          !canLeft && "opacity-0 pointer-events-none"
        )}
      >
        <ChevronLeft className="h-4 w-4" />
      </button>

      <button
        type="button"
        onClick={() => scrollBy(320)}
        aria-label="Berikutnya"
        className={cn(
          "absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 z-10 w-9 h-9 rounded-full bg-white shadow-md border border-neutral-200 flex items-center justify-center text-neutral-700 hover:bg-neutral-50 hover:text-black transition-all",
          !canRight && "opacity-0 pointer-events-none"
        )}
      >
        <ChevronRight className="h-4 w-4" />
      </button>

      <div
        ref={scrollRef}
        className="flex gap-3 overflow-x-auto no-scrollbar scroll-smooth snap-x snap-mandatory"
      >
        {list.map((img, i) => (
          <button
            key={img.id || i}
            type="button"
            onClick={() => onPick(i)}
            className={cn(
              "shrink-0 w-24 h-24 snap-start relative rounded-xl overflow-hidden bg-neutral-100 ring-2 transition-all cursor-pointer",
              i === activeDisplayIdx
                ? "ring-black"
                : "ring-transparent hover:ring-neutral-300"
            )}
            aria-label={`Lihat foto ${i + 1}`}
          >
            <Image
              src={img.image_url}
              alt={img.alt_text || productName}
              fill
              sizes="96px"
              className="object-cover"
            />
          </button>
        ))}
      </div>
    </div>
  );
}
