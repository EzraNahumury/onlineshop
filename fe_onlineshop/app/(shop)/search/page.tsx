import Link from "next/link";
import { ProductCard } from "@/components/shop/product-card";
import { searchProductsByKeywords } from "@/lib/queries/products";
import { getActiveStorePromosByProductIds } from "@/lib/queries/pricing";
import type { Metadata } from "next";

const PLACEHOLDER =
  "https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=600&h=800&fit=crop";

const POPULAR_SEARCHES = [
  "jersey",
  "polo shirt",
  "jacket",
  "shorts",
  "cap",
  "t-shirt",
];

export const dynamic = "force-dynamic";

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}): Promise<Metadata> {
  const { q } = await searchParams;
  return {
    title: q ? `Cari: ${q}` : "Pencarian",
  };
}

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const query = (q || "").trim();
  const keywords = query.split(/\s+/).filter(Boolean);
  const products =
    keywords.length > 0 ? await searchProductsByKeywords(keywords, 60) : [];
  const promoMap = await getActiveStorePromosByProductIds(
    products.map((p) => p.id)
  );

  return (
    <div className="bg-white min-h-screen">
      <div className="border-b border-neutral-100">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
          <p className="text-[11px] tracking-[0.35em] uppercase text-neutral-400 font-medium mb-5">
            Hasil Pencarian
          </p>

          {query ? (
            <div className="flex items-end justify-between gap-6 flex-wrap">
              <h1 className="font-display text-3xl sm:text-4xl md:text-5xl font-semibold text-neutral-950 leading-[0.95] tracking-tight">
                &ldquo;{query}&rdquo;
              </h1>
              <span className="text-[11px] text-neutral-500 tracking-[0.2em] uppercase pb-2 whitespace-nowrap">
                {products.length} Produk
              </span>
            </div>
          ) : (
            <h1 className="font-display text-3xl sm:text-4xl md:text-5xl font-semibold text-neutral-950 leading-[0.95] tracking-tight">
              Pencarian
            </h1>
          )}
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        {!query ? (
          <EmptyState />
        ) : products.length === 0 ? (
          <NoResultsState query={query} />
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-10 sm:gap-x-6">
            {products.map((product) => {
              const promo = promoMap.get(product.id);
              return (
                <ProductCard
                  key={product.slug}
                  slug={product.slug}
                  name={product.name}
                  price={
                    promo ? promo.discount_price : Number(product.base_price)
                  }
                  originalPrice={
                    promo ? Number(product.base_price) : undefined
                  }
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
        )}
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="mx-auto max-w-md text-center py-16">
      <div className="mx-auto w-12 h-12 rounded-xl bg-neutral-50 border border-neutral-200 flex items-center justify-center mb-4">
        <svg
          className="w-5 h-5 text-neutral-400"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="11" cy="11" r="7" />
          <path d="m21 21-4.3-4.3" />
        </svg>
      </div>
      <p className="text-sm text-neutral-500">
        Gunakan kolom pencarian di atas untuk mulai mencari.
      </p>

      <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
        <span className="text-xs text-neutral-400 w-full mb-1">Populer:</span>
        {POPULAR_SEARCHES.map((term) => (
          <Link
            key={term}
            href={`/search?q=${encodeURIComponent(term)}`}
            className="text-xs px-3 py-1.5 rounded-full border border-neutral-200 bg-white text-neutral-600 hover:border-black hover:text-black transition-colors"
          >
            {term}
          </Link>
        ))}
      </div>
    </div>
  );
}

function NoResultsState({ query }: { query: string }) {
  return (
    <div className="mx-auto max-w-md text-center py-16">
      <div className="mx-auto w-12 h-12 rounded-full bg-red-50 flex items-center justify-center mb-4">
        <svg
          className="w-5 h-5 text-red-500"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="11" cy="11" r="7" />
          <path d="m21 21-4.3-4.3" />
          <path d="M8 11h6" />
        </svg>
      </div>
      <h2 className="text-base font-medium text-black">
        Tidak ada hasil untuk &ldquo;{query}&rdquo;
      </h2>
      <p className="text-sm text-neutral-500 mt-1.5">
        Coba kata kunci lain atau jelajahi koleksi kami.
      </p>

      <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
        {POPULAR_SEARCHES.slice(0, 4).map((term) => (
          <Link
            key={term}
            href={`/search?q=${encodeURIComponent(term)}`}
            className="text-xs px-3 py-1.5 rounded-full border border-neutral-200 bg-white text-neutral-600 hover:border-black hover:text-black transition-colors"
          >
            {term}
          </Link>
        ))}
      </div>

      <Link
        href="/collections"
        className="inline-flex items-center gap-1.5 mt-7 h-10 px-5 rounded-full bg-black text-white text-sm font-medium hover:bg-neutral-800 transition-colors"
      >
        Jelajahi semua produk
      </Link>
    </div>
  );
}
