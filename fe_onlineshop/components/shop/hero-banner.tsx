"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

export interface BannerSlide {
  src: string;
  alt: string;
  href: string;
}

export function HeroBanner({
  slides,
  interval = 5000,
}: {
  slides: BannerSlide[];
  interval?: number;
}) {
  const count = slides.length;
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  const go = useCallback(
    (i: number) => setIndex(((i % count) + count) % count),
    [count]
  );

  // Auto-slide (pauses on hover / touch).
  useEffect(() => {
    if (paused || count <= 1) return;
    const id = setInterval(() => setIndex((p) => (p + 1) % count), interval);
    return () => clearInterval(id);
  }, [paused, count, interval]);

  // Swipe (touch).
  const startX = useRef<number | null>(null);
  function onTouchStart(e: React.TouchEvent) {
    startX.current = e.touches[0].clientX;
    setPaused(true);
  }
  function onTouchEnd(e: React.TouchEvent) {
    if (startX.current !== null) {
      const dx = e.changedTouches[0].clientX - startX.current;
      if (Math.abs(dx) > 40) go(index + (dx < 0 ? 1 : -1));
    }
    startX.current = null;
    setPaused(false);
  }

  return (
    <section className="bg-neutral-900">
      <div
        className="group relative w-full aspect-[1916/821] min-h-[160px] overflow-hidden"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
      >
        {/* Track */}
        <div
          className="flex h-full transition-transform duration-500 ease-out"
          style={{ transform: `translateX(-${index * 100}%)` }}
        >
          {slides.map((s, i) => (
            <Link
              key={i}
              href={s.href}
              aria-label={s.alt}
              className="relative block h-full w-full flex-shrink-0"
            >
              <Image
                src={s.src}
                alt={s.alt}
                fill
                priority={i === 0}
                sizes="100vw"
                className="object-cover object-center"
              />
            </Link>
          ))}
        </div>

        {count > 1 && (
          <>
            <button
              type="button"
              onClick={() => go(index - 1)}
              aria-label="Banner sebelumnya"
              className="absolute left-3 sm:left-5 top-1/2 -translate-y-1/2 z-10 flex h-9 w-9 sm:h-11 sm:w-11 items-center justify-center rounded-full bg-white/80 text-neutral-800 shadow-md backdrop-blur transition-all hover:bg-white opacity-0 group-hover:opacity-100"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              type="button"
              onClick={() => go(index + 1)}
              aria-label="Banner berikutnya"
              className="absolute right-3 sm:right-5 top-1/2 -translate-y-1/2 z-10 flex h-9 w-9 sm:h-11 sm:w-11 items-center justify-center rounded-full bg-white/80 text-neutral-800 shadow-md backdrop-blur transition-all hover:bg-white opacity-0 group-hover:opacity-100"
            >
              <ChevronRight className="h-5 w-5" />
            </button>

            <div className="absolute bottom-3 sm:bottom-5 left-1/2 -translate-x-1/2 z-10 flex items-center gap-2">
              {slides.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => go(i)}
                  aria-label={`Ke banner ${i + 1}`}
                  className={cn(
                    "h-2 rounded-full transition-all",
                    i === index ? "w-6 bg-white" : "w-2 bg-white/50 hover:bg-white/80"
                  )}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </section>
  );
}
