"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Minus, Plus, Trash2, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart, selectCartTotal } from "@/lib/store/cart";
import { formatPrice } from "@/lib/utils";
import { useT } from "@/lib/i18n";
import { confirm } from "@/components/ui/confirm";
import { toast } from "@/components/ui/toast";

const PLACEHOLDER = "https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=200&h=200&fit=crop";

export function CartView() {
  const { t } = useT();
  const router = useRouter();
  // Track Zustand-persist hydration. Initialize synchronously from
  // `persist.hasHydrated()` so remounts (e.g. back-navigation) that happen
  // AFTER the store already hydrated don't get stuck on a loading state
  // waiting for a hydration event that already fired.
  const [hydrated, setHydrated] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    return useCart.persist.hasHydrated();
  });
  const [checkingOut, setCheckingOut] = useState(false);
  const items = useCart((s) => s.items);
  const total = useCart(selectCartTotal);
  const updateQuantity = useCart((s) => s.updateQuantity);
  const removeItem = useCart((s) => s.removeItem);
  const clear = useCart((s) => s.clear);

  async function handleCheckout() {
    setCheckingOut(true);
    try {
      const res = await fetch("/api/auth/me", { cache: "no-store" });
      if (res.ok) {
        router.push("/checkout");
      } else {
        toast.info("Silakan login terlebih dahulu untuk melanjutkan checkout.");
        router.push("/login?next=/checkout");
      }
    } catch {
      router.push("/login?next=/checkout");
    } finally {
      setCheckingOut(false);
    }
  }

  useEffect(() => {
    if (useCart.persist.hasHydrated()) {
      setHydrated(true);
      return;
    }
    const unsub = useCart.persist.onFinishHydration(() => setHydrated(true));
    return unsub;
  }, []);

  if (!hydrated) {
    return (
      <div className="text-center py-20 text-neutral-400 text-sm">{t("cart.loading")}</div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="text-center py-20">
        <ShoppingBag className="h-12 w-12 text-neutral-300 mx-auto mb-4" />
        <p className="text-base text-neutral-700 font-medium mb-1">
          {t("cart.empty.title")}
        </p>
        <p className="text-sm text-neutral-500 mb-6">{t("cart.empty.subtitle")}</p>
        <Link href="/">
          <Button>{t("cart.empty.cta")}</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2">
        <ul className="divide-y divide-neutral-100 bg-white rounded-2xl border border-neutral-100">
          {items.map((it) => (
            <li
              key={`${it.productId}-${it.variantId ?? "none"}`}
              className="p-4 sm:p-5 flex gap-4"
            >
              <Link
                href={`/products/${it.productSlug}`}
                className="relative w-20 h-24 sm:w-24 sm:h-28 rounded-lg overflow-hidden bg-neutral-100 flex-shrink-0"
              >
                <Image
                  src={it.imageUrl || PLACEHOLDER}
                  alt={it.productName}
                  fill
                  sizes="96px"
                  className="object-cover"
                />
              </Link>

              <div className="flex-1 flex flex-col justify-between min-w-0">
                <div className="min-w-0">
                  <Link
                    href={`/products/${it.productSlug}`}
                    className="text-sm font-medium text-black hover:underline line-clamp-2"
                  >
                    {it.productName}
                  </Link>
                  {it.variantLabel && (
                    <p className="text-xs text-neutral-500 mt-0.5">{it.variantLabel}</p>
                  )}
                  <p className="text-sm font-medium text-black mt-1.5">
                    {formatPrice(it.unitPrice)}
                  </p>
                </div>

                <div className="flex items-center justify-between gap-3 mt-3">
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() =>
                        updateQuantity(it.productId, it.variantId, it.quantity - 1)
                      }
                      disabled={it.quantity <= 1}
                      className="w-8 h-8 flex items-center justify-center rounded-md border border-neutral-200 text-neutral-600 hover:border-neutral-400 disabled:opacity-30 transition-colors"
                    >
                      <Minus className="h-3.5 w-3.5" />
                    </button>
                    <span className="w-10 text-center text-sm tabular-nums">
                      {it.quantity}
                    </span>
                    <button
                      onClick={() =>
                        updateQuantity(it.productId, it.variantId, it.quantity + 1)
                      }
                      disabled={it.quantity >= it.maxStock}
                      className="w-8 h-8 flex items-center justify-center rounded-md border border-neutral-200 text-neutral-600 hover:border-neutral-400 disabled:opacity-30 transition-colors"
                    >
                      <Plus className="h-3.5 w-3.5" />
                    </button>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-sm font-semibold tabular-nums">
                      {formatPrice(it.unitPrice * it.quantity)}
                    </span>
                    <button
                      onClick={() => removeItem(it.productId, it.variantId)}
                      className="p-1.5 text-neutral-400 hover:text-red-600 transition-colors"
                      title={t("cart.removeTitle")}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>

        <button
          onClick={async () => {
            const ok = await confirm({
              title: t("cart.clearConfirm"),
              confirmText: t("cart.clear"),
              variant: "danger",
            });
            if (ok) clear();
          }}
          className="mt-3 text-xs text-neutral-500 hover:text-red-600 transition-colors"
        >
          {t("cart.clear")}
        </button>
      </div>

      <aside className="lg:sticky lg:top-32 lg:self-start">
        <div className="bg-white rounded-2xl border border-neutral-100 p-6 space-y-4">
          <h2 className="text-base font-medium">{t("cart.summary")}</h2>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-neutral-600">{t("cart.subtotal")}</span>
              <span className="tabular-nums">{formatPrice(total)}</span>
            </div>
            <div className="flex justify-between text-xs text-neutral-500">
              <span>{t("cart.shipping")}</span>
              <span>{t("cart.shippingNote")}</span>
            </div>
          </div>
          <div className="border-t border-neutral-100 pt-3 flex justify-between text-base font-semibold">
            <span>{t("cart.total")}</span>
            <span className="tabular-nums">{formatPrice(total)}</span>
          </div>
          <Button
            size="lg"
            className="w-full"
            onClick={handleCheckout}
            loading={checkingOut}
          >
            {t("cart.checkout")}
          </Button>
          <Link
            href="/"
            className="block text-center text-xs text-neutral-500 hover:text-black"
          >
            {t("cart.continue")}
          </Link>
        </div>
      </aside>
    </div>
  );
}
