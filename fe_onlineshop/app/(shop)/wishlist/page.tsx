import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/user-auth";
import { getUserWishlist } from "@/lib/queries/wishlist";
import { WishlistView } from "./wishlist-view";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Wishlist",
};

export default async function WishlistPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login?next=/wishlist");
  }

  const items = await getUserWishlist(user.id);

  return (
    <div className="bg-white min-h-screen">
      <div className="border-b border-neutral-100">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
          <p className="text-[11px] tracking-[0.35em] uppercase text-neutral-400 font-medium mb-5">
            Wishlist
          </p>
          <div className="flex items-end justify-between gap-6 flex-wrap">
            <h1 className="font-display text-3xl sm:text-4xl md:text-5xl font-semibold text-neutral-950 leading-[0.95] tracking-tight">
              Produk Favoritmu
            </h1>
            <span className="text-[11px] text-neutral-500 tracking-[0.2em] uppercase pb-2 whitespace-nowrap">
              {items.length} Produk
            </span>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <WishlistView
          initialItems={items.map((i) => ({
            id: i.id,
            product_id: i.product_id,
            slug: i.slug,
            name: i.name,
            base_price: Number(i.base_price),
            primary_image: i.primary_image,
            status: i.status,
          }))}
        />
      </div>
    </div>
  );
}
