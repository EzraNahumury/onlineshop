import Link from "next/link";
import { ProductCard } from "@/components/shop/product-card";
import {
  getProductsByCategory,
  getCategories,
  getLiveProducts,
  getBestSellers,
  searchProductsByKeywords,
} from "@/lib/queries/products";
import { getActiveStorePromosByProductIds } from "@/lib/queries/pricing";
import {
  getDisplayPromoMapForProducts,
  effectivePromoPrice,
} from "@/lib/queries/display-promo";
import { db } from "@/lib/db";
import { RowDataPacket } from "mysql2";
import type { Metadata } from "next";

const PLACEHOLDER = "https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=600&h=800&fit=crop";

const SPECIAL_SLUGS: Record<string, { name: string; description: string }> = {
  "new-arrivals": {
    name: "New Arrivals",
    description: "Produk terbaru yang baru saja masuk ke toko.",
  },
  "best-sellers": {
    name: "Best Sellers",
    description: "Produk paling populer dipesan customer.",
  },
  sale: {
    name: "Sale",
    description: "Produk dengan diskon spesial.",
  },
};

function slugToTitle(slug: string): string {
  return slug
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  if (SPECIAL_SLUGS[slug]) return { title: SPECIAL_SLUGS[slug].name };
  const [rows] = await db.query<RowDataPacket[]>(
    "SELECT name FROM product_categories WHERE slug = ? LIMIT 1",
    [slug]
  );
  const name = rows[0]?.name || slugToTitle(slug);
  return {
    title: name,
    description: `Browse ${name} collection at AYRES`,
  };
}

export default async function CategoryPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ sort?: string }>;
}) {
  const { slug } = await params;
  const { sort } = await searchParams;
  const currentSort = sort || "newest";

  let category: { name: string; description: string | null; slug: string };
  let products: Awaited<ReturnType<typeof getProductsByCategory>>;
  let isFuzzy = false;

  if (SPECIAL_SLUGS[slug]) {
    category = {
      name: SPECIAL_SLUGS[slug].name,
      description: SPECIAL_SLUGS[slug].description,
      slug,
    };
    products =
      slug === "best-sellers"
        ? await getBestSellers(40)
        : await getLiveProducts(40);
  } else {
    const [catRows] = await db.query<RowDataPacket[]>(
      "SELECT * FROM product_categories WHERE slug = ? AND is_active = 1 LIMIT 1",
      [slug]
    );
    if (catRows.length > 0) {
      const cat = catRows[0];
      category = { name: cat.name, description: cat.description, slug: cat.slug };
      products = await getProductsByCategory(slug, currentSort);
    } else {
      const keywords = slug.split("-").filter(Boolean);
      const fallbackName = slugToTitle(slug);
      category = {
        name: fallbackName,
        description: `Hasil pencarian untuk "${fallbackName}".`,
        slug,
      };
      products = await searchProductsByKeywords(keywords, 40);
      isFuzzy = true;
    }
  }

  const [categories, promoMap, displayMap] = await Promise.all([
    getCategories(),
    getActiveStorePromosByProductIds(products.map((p) => p.id)),
    getDisplayPromoMapForProducts(products.map((p) => p.id)),
  ]);

  // Context-aware chip bar:
  // - On a parent category page (e.g. /collections/apparel) → show its children
  // - On a child page (e.g. /collections/jersey) → show siblings (same parent)
  // - Fallback (special/fuzzy) → show top-level parents
  const currentCat = categories.find((c: any) => c.slug === slug) as
    | { id: number; parent_id: number | null; slug: string }
    | undefined;

  let chipCategories: any[];
  if (currentCat && currentCat.parent_id === null) {
    chipCategories = (categories as any[]).filter(
      (c) => c.parent_id === currentCat.id
    );
  } else if (currentCat && currentCat.parent_id !== null) {
    chipCategories = (categories as any[]).filter(
      (c) => c.parent_id === currentCat.parent_id
    );
  } else {
    chipCategories = (categories as any[]).filter((c) => c.parent_id === null);
  }

  const sortOptions = [
    { value: "newest", label: "Newest" },
    { value: "popular", label: "Most Popular" },
    { value: "price_asc", label: "Price: Low to High" },
    { value: "price_desc", label: "Price: High to Low" },
  ];

  return (
    <div>
      {/* Page header */}
      <div className="bg-white border-b border-neutral-100">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex items-center gap-2 text-sm text-neutral-400 mb-3">
            <Link href="/collections" className="hover:text-black transition-colors">
              Collections
            </Link>
            <span>/</span>
            <span className="text-neutral-700">{category.name}</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-light">{category.name}</h1>
          {category.description && (
            <p className="text-neutral-500 mt-2 max-w-xl">{category.description}</p>
          )}
        </div>
      </div>

      {/* Category chips */}
      <div className="bg-white border-b border-neutral-100 sticky top-[105px] z-30">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex gap-2 overflow-x-auto no-scrollbar">
            <Link
              href="/collections"
              className="shrink-0 px-5 py-2 rounded-full text-sm font-medium border border-neutral-200 text-neutral-600 hover:border-black hover:text-black transition-colors"
            >
              All
            </Link>
            {chipCategories.map((cat: any) => {
              const c = cat as { slug: string; name: string };
              return (
                <Link
                  key={c.slug}
                  href={`/collections/${c.slug}`}
                  className={`shrink-0 px-5 py-2 rounded-full text-sm font-medium transition-colors ${
                    c.slug === slug
                      ? "bg-black text-white"
                      : "border border-neutral-200 text-neutral-600 hover:border-black hover:text-black"
                  }`}
                >
                  {c.name}
                </Link>
              );
            })}
          </div>
        </div>
      </div>

      {/* Sort + Grid */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex items-center justify-between mb-8">
          <p className="text-sm text-neutral-400">
            {products.length} product{products.length !== 1 ? "s" : ""}
          </p>

          {!isFuzzy && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-neutral-500 hidden sm:inline">Sort by:</span>
              <div className="flex gap-1">
                {sortOptions.map((opt) => (
                  <Link
                    key={opt.value}
                    href={`/collections/${slug}?sort=${opt.value}`}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                      currentSort === opt.value
                        ? "bg-black text-white"
                        : "text-neutral-500 hover:bg-neutral-100"
                    }`}
                  >
                    {opt.label}
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-8 sm:gap-x-6">
          {products.map((product) => {
            const promo = promoMap.get(product.id);
            const { price, original } = effectivePromoPrice(
              Number(product.base_price),
              promo ? promo.discount_price : null,
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
            <p className="text-neutral-400 text-lg">
              {isFuzzy
                ? `Belum ada produk untuk "${category.name}"`
                : "No products in this category yet"}
            </p>
            <Link
              href="/collections"
              className="inline-block mt-4 text-sm font-medium text-black underline"
            >
              Browse all products
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
