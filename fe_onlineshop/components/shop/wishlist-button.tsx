"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Heart } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "@/components/ui/toast";

export function WishlistButton({
  productId,
  initialInWishlist = false,
  loggedIn = false,
  nextPath,
  className,
  size = "md",
}: {
  productId: number;
  initialInWishlist?: boolean;
  loggedIn?: boolean;
  nextPath?: string;
  className?: string;
  size?: "sm" | "md";
}) {
  const router = useRouter();
  const [inWishlist, setInWishlist] = useState(initialInWishlist);
  const [busy, setBusy] = useState(false);

  const dim = size === "sm" ? "h-9 w-9" : "h-11 w-11";
  const iconDim = size === "sm" ? "h-4 w-4" : "h-5 w-5";

  async function handleToggle() {
    if (!loggedIn) {
      toast.info("Silakan login dulu untuk menyimpan ke wishlist.");
      const next = nextPath ? `?next=${encodeURIComponent(nextPath)}` : "";
      router.push(`/login${next}`);
      return;
    }

    const nextInWishlist = !inWishlist;
    setBusy(true);
    // Optimistic update
    setInWishlist(nextInWishlist);
    try {
      const method = nextInWishlist ? "POST" : "DELETE";
      const res = await fetch("/api/wishlist", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ product_id: productId }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        toast.error(data.error || "Gagal menyimpan ke wishlist");
        setInWishlist(!nextInWishlist); // Revert
        return;
      }
      toast.success(
        nextInWishlist ? "Ditambahkan ke wishlist" : "Dihapus dari wishlist"
      );
      router.refresh();
    } catch {
      setInWishlist(!nextInWishlist);
      toast.error("Terjadi kesalahan jaringan");
    } finally {
      setBusy(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleToggle}
      disabled={busy}
      className={cn(
        "flex-shrink-0 flex items-center justify-center rounded-full border transition-all",
        dim,
        inWishlist
          ? "bg-red-50 border-red-200 text-red-600 hover:bg-red-100"
          : "bg-white border-neutral-200 text-neutral-600 hover:border-black hover:text-black",
        busy && "opacity-60 cursor-not-allowed",
        className
      )}
      aria-label={inWishlist ? "Hapus dari wishlist" : "Simpan ke wishlist"}
      aria-pressed={inWishlist}
    >
      <Heart
        className={cn(iconDim, "transition-all")}
        fill={inWishlist ? "currentColor" : "none"}
        strokeWidth={1.8}
      />
    </button>
  );
}
