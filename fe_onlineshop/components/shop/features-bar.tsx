"use client";

import { useEffect, useRef, useState } from "react";
import { RotateCcw, ShieldCheck, Truck } from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface Feature {
  Icon: LucideIcon;
  title: string;
  desc: string;
  num: string;
  iconKey: "truck" | "rotate" | "shield";
}

const FEATURES: Feature[] = [
  {
    Icon: Truck,
    title: "Free Shipping",
    desc: "On orders over Rp 500.000",
    num: "01",
    iconKey: "truck",
  },
  {
    Icon: RotateCcw,
    title: "Easy Returns",
    desc: "30-day return policy",
    num: "02",
    iconKey: "rotate",
  },
  {
    Icon: ShieldCheck,
    title: "Secure Payment",
    desc: "100% secure checkout",
    num: "03",
    iconKey: "shield",
  },
];

export function FeaturesBar() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;

    // Graceful fallback: reveal immediately if IO is unavailable.
    if (typeof IntersectionObserver === "undefined") {
      setInView(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setInView(true);
          observer.disconnect();
        }
      },
      // rootMargin keeps the choreography from firing half-off-screen at the
      // viewport edge — it plays once the strip is genuinely witnessed.
      { threshold: 0.18, rootMargin: "0px 0px -8% 0px" }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <section
      ref={sectionRef}
      aria-label="Store guarantees"
      className={`fb-section relative overflow-hidden border-t border-neutral-200 bg-gradient-to-b from-neutral-50 to-white${
        inView ? " fb-inview" : ""
      }`}
    >
      {/* Quiet paper texture — same family as the rest of the page */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(0,0,0,0.04),transparent_50%),radial-gradient(circle_at_80%_80%,rgba(0,0,0,0.03),transparent_50%)]" />

      <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
        <ul className="grid grid-cols-1 gap-5 sm:grid-cols-3">
          {FEATURES.map(({ Icon, title, desc, num, iconKey }) => (
            <li key={title} className="fb-reveal">
              <article className="fb-card group relative h-full rounded-2xl border border-neutral-200/70 bg-white/80 p-5 backdrop-blur-sm sm:p-6">
                {/* Gold hairline — draws itself across the top on reveal */}
                <span
                  aria-hidden="true"
                  className="fb-goldline absolute left-5 right-5 top-0"
                />

                {/* Serif index numeral — editorial folio mark */}
                <span
                  aria-hidden="true"
                  className="fb-num font-display absolute right-5 top-4 select-none italic"
                >
                  {num}
                </span>

                <div className="flex items-center gap-4">
                  {/* Icon frame — fills to black on hover with a gold ring ping */}
                  <div className="fb-frame relative h-12 w-12 shrink-0 rounded-xl">
                    <div className="fb-frame-clip absolute inset-0 flex items-center justify-center overflow-hidden rounded-[inherit]">
                      <span className={`fb-iconwrap fb-ic-${iconKey} inline-flex`}>
                        <Icon className="fb-icon h-5 w-5" strokeWidth={1.5} />
                      </span>
                    </div>
                  </div>

                  <div className="min-w-0 pr-7">
                    <p className="font-display text-[15px] font-semibold tracking-tight text-black">
                      {title}
                    </p>
                    <p className="mt-0.5 truncate text-xs text-neutral-500 transition-colors duration-300 group-hover:text-neutral-600">
                      {desc}
                    </p>
                  </div>
                </div>
              </article>
            </li>
          ))}
        </ul>
      </div>

      {/* Ambient sheen — one slow gold sweep across the strip every ~8s */}
      <div
        aria-hidden="true"
        className="fb-sweep pointer-events-none absolute inset-y-0 left-0 z-10"
      />
    </section>
  );
}
