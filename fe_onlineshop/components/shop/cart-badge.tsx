"use client";

import { useEffect, useState } from "react";
import { useCart, selectCartCount } from "@/lib/store/cart";

export function CartBadge() {
  // Use Zustand persist's hydration signal. Sync initial state from
  // `hasHydrated()` so remounts after hydration already completed don't get
  // stuck showing "0".
  const [hydrated, setHydrated] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    return useCart.persist.hasHydrated();
  });
  const count = useCart(selectCartCount);

  useEffect(() => {
    if (useCart.persist.hasHydrated()) {
      setHydrated(true);
      return;
    }
    const unsub = useCart.persist.onFinishHydration(() => setHydrated(true));
    return unsub;
  }, []);

  const display = hydrated ? count : 0;

  return (
    <span className="absolute top-1 right-1 flex h-4 min-w-[16px] px-1 items-center justify-center rounded-full bg-black text-[10px] font-medium text-white">
      {display > 99 ? "99+" : display}
    </span>
  );
}
