"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef, useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

export type CarouselCategory = {
  slug: string;
  name: string;
  hero_image: string | null;
};

export function CategoryCarousel({
  categories,
}: {
  categories: CarouselCategory[];
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
  }, []);

  function scrollBy(dx: number) {
    scrollRef.current?.scrollBy({ left: dx, behavior: "smooth" });
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => scrollBy(-480)}
        disabled={!canLeft}
        aria-label="Scroll left"
        className={cn(
          "absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2 z-10 w-10 h-10 rounded-full bg-white shadow-md border border-neutral-200 flex items-center justify-center text-neutral-700 hover:bg-neutral-50 hover:text-black transition-all",
          !canLeft && "opacity-0 pointer-events-none"
        )}
      >
        <ChevronLeft className="h-5 w-5" />
      </button>

      <button
        type="button"
        onClick={() => scrollBy(480)}
        disabled={!canRight}
        aria-label="Scroll right"
        className={cn(
          "absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 z-10 w-10 h-10 rounded-full bg-white shadow-md border border-neutral-200 flex items-center justify-center text-neutral-700 hover:bg-neutral-50 hover:text-black transition-all",
          !canRight && "opacity-0 pointer-events-none"
        )}
      >
        <ChevronRight className="h-5 w-5" />
      </button>

      <div
        ref={scrollRef}
        className="flex gap-3 overflow-x-auto no-scrollbar scroll-smooth snap-x snap-mandatory pb-2"
        style={{ scrollbarWidth: "none" }}
      >
        {categories.map((cat) => (
          <Link
            key={cat.slug}
            href={`/collections/${cat.slug}`}
            className="group shrink-0 w-[120px] snap-start flex flex-col items-center text-center py-3 px-2 rounded-xl hover:bg-neutral-50 transition-colors"
          >
            <div className="relative w-20 h-20 rounded-full overflow-hidden bg-neutral-50 border border-neutral-100 group-hover:border-neutral-300 transition-colors">
              {cat.hero_image ? (
                <Image
                  src={cat.hero_image}
                  alt={cat.name}
                  fill
                  sizes="80px"
                  className={
                    cat.hero_image.startsWith("/kategori/") ||
                    cat.hero_image.startsWith("/uploads/categories/")
                      ? "object-contain p-2"
                      : "object-cover"
                  }
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-neutral-800 via-neutral-900 to-black flex items-center justify-center">
                  <span className="text-white text-sm font-semibold">
                    {cat.name.charAt(0)}
                  </span>
                </div>
              )}
            </div>
            <span className="mt-3 text-xs font-medium text-neutral-700 group-hover:text-black leading-tight line-clamp-2">
              {cat.name}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
