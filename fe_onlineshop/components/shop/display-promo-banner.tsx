"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { cn, formatPrice } from "@/lib/utils";
import type { ActiveDisplayPromo, DisplayPromoProduct } from "@/lib/queries/display-promo";

export function DisplayPromoBanner({ promo }: { promo: ActiveDisplayPromo }) {
  const [remaining, setRemaining] = useState(promo.seconds_remaining);

  useEffect(() => {
    if (remaining <= 0) return;
    const id = setInterval(() => setRemaining((r) => Math.max(0, r - 1)), 1000);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (remaining <= 0) return null;

  const days = Math.floor(remaining / 86400);
  const hours = Math.floor((remaining % 86400) / 3600);
  const minutes = Math.floor((remaining % 3600) / 60);
  const seconds = remaining % 60;

  const offer =
    promo.discount_type === "percentage"
      ? `Diskon ${promo.discount_value}%`
      : `Potongan ${formatPrice(promo.discount_value)}`;

  const products = promo.products;
  const shopHref =
    products.length === 1 ? `/products/${products[0].slug}` : "/collections";

  return (
    <section className="py-12 sm:py-16 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-neutral-900 via-neutral-900 to-red-950 px-6 sm:px-10 py-10 sm:py-14">
          <div className="pointer-events-none absolute -top-20 -right-16 h-64 w-64 rounded-full bg-red-600/20 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-24 -left-10 h-64 w-64 rounded-full bg-red-500/10 blur-3xl" />

          <div className="relative grid items-center gap-8 lg:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)]">
            {products[0] && (
              <ProductFrame product={products[0]} className="hidden lg:block justify-self-start" />
            )}

            <div className="mx-auto max-w-md text-center text-white">
              <p className="mb-3 text-xs font-semibold uppercase tracking-[0.3em] text-red-400">
                {promo.subtitle || "Penawaran Spesial"}
              </p>
              <h2 className="font-display text-3xl font-semibold leading-tight sm:text-4xl">
                {promo.title}
              </h2>
              <p className="mt-3 text-sm text-neutral-300 sm:text-base">
                {offer} <span className="font-medium text-red-400">— Waktu Terbatas!</span>
              </p>
              {promo.stock != null && (
                <div className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-red-500/15 px-3 py-1 text-xs font-semibold text-red-300 ring-1 ring-red-500/30">
                  {promo.stock > 0 ? `Stok terbatas: ${promo.stock}` : "Stok promo habis"}
                </div>
              )}

              <div className="mt-6 flex items-center justify-center gap-2 sm:gap-3">
                <TimeBox value={days} label="Hari" />
                <Sep />
                <TimeBox value={hours} label="Jam" />
                <Sep />
                <TimeBox value={minutes} label="Menit" />
                <Sep />
                <TimeBox value={seconds} label="Detik" />
              </div>

              <Link
                href={shopHref}
                className="mt-7 inline-flex h-11 items-center gap-2 rounded-full bg-white px-7 text-sm font-semibold text-black transition-colors hover:bg-neutral-100"
              >
                Belanja Sekarang
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            {(products[1] || products[0]) && (
              <ProductFrame
                product={products[1] || products[0]}
                className="hidden lg:block justify-self-end"
              />
            )}
          </div>

          {/* product thumbnails (mobile) */}
          <div className="relative mt-8 flex justify-center gap-3 lg:hidden">
            {products.slice(0, 3).map((p) => (
              <Link
                key={p.id}
                href={`/products/${p.slug}`}
                className="relative h-16 w-16 overflow-hidden rounded-xl bg-white/10 ring-1 ring-white/10"
              >
                {p.image && (
                  <Image src={p.image} alt={p.name} fill sizes="64px" className="object-cover" />
                )}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function TimeBox({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex flex-col items-center">
      <div className="min-w-[3.25rem] rounded-xl bg-white/10 px-2 py-2.5 ring-1 ring-white/10 backdrop-blur sm:min-w-[3.75rem] sm:py-3">
        <span className="block text-2xl font-bold tabular-nums text-white sm:text-3xl">
          {String(value).padStart(2, "0")}
        </span>
      </div>
      <span className="mt-1.5 text-[10px] uppercase tracking-wider text-neutral-400">{label}</span>
    </div>
  );
}

function Sep() {
  return <span className="-mt-4 text-2xl font-bold text-white/30 sm:text-3xl">:</span>;
}

function ProductFrame({
  product,
  className,
}: {
  product: DisplayPromoProduct;
  className?: string;
}) {
  return (
    <Link
      href={`/products/${product.slug}`}
      className={cn(
        "group relative aspect-[3/4] w-44 overflow-hidden rounded-2xl bg-white/5 ring-1 ring-white/10 xl:w-52",
        className
      )}
    >
      {product.image ? (
        <Image
          src={product.image}
          alt={product.name}
          fill
          sizes="208px"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
      ) : (
        <div className="flex h-full items-center justify-center text-xs text-white/40">
          {product.name}
        </div>
      )}
    </Link>
  );
}
