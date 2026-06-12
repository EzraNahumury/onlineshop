import Link from "next/link";
import { ProductCard } from "@/components/shop/product-card";
import { getLiveProducts, getCategories } from "@/lib/queries/products";
import {
  getDisplayPromoMapForProducts,
  effectivePromoPrice,
} from "@/lib/queries/display-promo";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Collections",
  description: "Browse all AYRES collections",
};

const PLACEHOLDER = "https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=600&h=800&fit=crop";

export const dynamic = "force-dynamic";

export default async function CollectionsPage() {
  const [products, categories] = await Promise.all([
    getLiveProducts(),
    getCategories(),
  ]);
  const displayMap = await getDisplayPromoMapForProducts(products.map((p) => p.id));

  return (
    <div>
      {/* Page header */}
      <div className="bg-white border-b border-neutral-100">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
          <p className="text-xs tracking-[0.3em] uppercase text-neutral-400 mb-2">
            Browse
          </p>
          <h1 className="text-3xl sm:text-4xl font-light">All Collections</h1>
        </div>
      </div>

      {/* Category chips */}
      <div className="bg-white border-b border-neutral-100 sticky top-[105px] z-30">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex gap-2 overflow-x-auto no-scrollbar">
            <Link
              href="/collections"
              className="shrink-0 px-5 py-2 rounded-full text-sm font-medium bg-black text-white"
            >
              All
            </Link>
            {categories
              .filter((c: any) => c.parent_id === null)
              .map((cat: any) => (
                <Link
                  key={cat.slug}
                  href={`/collections/${cat.slug}`}
                  className="shrink-0 px-5 py-2 rounded-full text-sm font-medium border border-neutral-200 text-neutral-600 hover:border-black hover:text-black transition-colors"
                >
                  {cat.name}
                </Link>
              ))}
          </div>
        </div>
      </div>

      {/* Product grid */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <p className="text-sm text-neutral-400 mb-8">
          {products.length} product{products.length !== 1 ? "s" : ""}
        </p>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-8 sm:gap-x-6">
          {products.map((product) => {
            const { price, original } = effectivePromoPrice(
              Number(product.base_price),
              null,
              displayMap.get(product.id)
            );
            return (
            <ProductCard
              key={product.slug}
              slug={product.slug}
              name={product.name}
              price={price}
              originalPrice={original}
              imageUrl={product.primary_image || PLACEHOLDER}
              productId={product.id}
              category={product.category_name}
              rating={Number(product.rating_avg)}
              ratingCount={product.rating_count}
              stock={product.stock}
              hasVariant={!!product.has_variant}
            />
            );
          })}
        </div>

        {products.length === 0 && (
          <div className="text-center py-20">
            <p className="text-neutral-400 text-lg">No products found</p>
          </div>
        )}
      </div>
    </div>
  );
}
