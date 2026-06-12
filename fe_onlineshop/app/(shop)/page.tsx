import Link from "next/link";
import { ArrowRight, Truck, RotateCcw, ShieldCheck } from "lucide-react";
import { ProductCard } from "@/components/shop/product-card";
import { getBestSellers, getNewArrivals, getCategories } from "@/lib/queries/products";
import { getActiveStorePromosByProductIds } from "@/lib/queries/pricing";
import { formatPrice } from "@/lib/utils";
import {
  getActiveDisplayPromo,
  getDisplayPromoMapForProducts,
  effectivePromoPrice,
} from "@/lib/queries/display-promo";
import { CategoryCarousel } from "@/components/shop/category-carousel";
import { HeroBanner } from "@/components/shop/hero-banner";
import { DisplayPromoBanner } from "@/components/shop/display-promo-banner";

const PLACEHOLDER_IMG = "https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=600&h=800&fit=crop";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [bestSellers, newArrivals, categories, displayPromo] = await Promise.all([
    getBestSellers(4),
    getNewArrivals(4),
    getCategories(),
    getActiveDisplayPromo(),
  ]);

  const allIds = Array.from(
    new Set([...bestSellers.map((p) => p.id), ...newArrivals.map((p) => p.id)])
  );
  const [promoMap, displayMap] = await Promise.all([
    getActiveStorePromosByProductIds(allIds),
    getDisplayPromoMapForProducts(allIds),
  ]);

  // Static illustrations for the category carousel — files in public/kategori/.
  const CATEGORY_ICONS: Record<string, string> = {
    "t-shirt": "/kategori/T-Shirt.png",
    "polo-shirt": "/kategori/polo_shirt.png",
    shirt: "/kategori/shirt.png",
    vest: "/kategori/vest.png",
    jersey: "/kategori/jersey.png",
    jacket: "/kategori/jaket.png",
    shorts: "/kategori/shorts.png",
    pants: "/kategori/pants.png",
    shinguard: "/kategori/shinguard.png",
    "elbow-pad": "/kategori/elbow_pad.png",
    "knee-pad": "/kategori/knee_pad.png",
    cap: "/kategori/cap.png",
    socks: "/kategori/socks.png",
    lainnya: "/kategori/lainnya.png",
  };

  // Categories carousel: show leaf categories (no children) + top-level without children.
  // Parents that have children are skipped — their sub-categories show instead, Shopee-style.
  const parentIds = new Set(
    (categories as any[])
      .filter((c) => c.parent_id !== null)
      .map((c) => c.parent_id)
  );
  const carouselCategories = (categories as any[])
    .filter((c) => !parentIds.has(c.id))
    .map((c) => ({
      slug: c.slug,
      name: c.name,
      // Admin-uploaded category image wins; fall back to the built-in icon set,
      // then to a product photo from the category.
      hero_image:
        (c.image_url as string | null) ||
        CATEGORY_ICONS[c.slug] ||
        (c.hero_image as string | null),
    }));

  return (
    <div>
      {/* ==================== HERO SECTION ==================== */}
      <HeroBanner
        slides={[
          { src: "/image2.png", alt: "AYRES — Everyone Can Use", href: "/collections" },
          { src: "/image3.png", alt: "AYRES Collection", href: "/collections" },
          { src: "/image4.png", alt: "AYRES Collection", href: "/collections" },
        ]}
      />

      {/* ==================== CATEGORIES ==================== */}
      <section className="py-14 sm:py-16 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="bg-white rounded-2xl border border-neutral-100 shadow-sm p-6 sm:p-8">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-sm tracking-[0.25em] uppercase text-neutral-500 font-medium">
                Kategori
              </h2>
              <Link
                href="/collections"
                className="text-xs text-neutral-500 hover:text-black transition-colors"
              >
                Lihat semua
              </Link>
            </div>

            <CategoryCarousel categories={carouselCategories} />
          </div>
        </div>
      </section>

      {/* ==================== BEST SELLERS ==================== */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="mx-auto max-w-7xl">
          <div className="flex items-end justify-between mb-12">
            <div>
              <p className="text-xs tracking-[0.3em] uppercase text-neutral-400 mb-2">
                Curated
              </p>
              <h2 className="text-2xl sm:text-3xl font-light">Best Sellers</h2>
            </div>
            <Link
              href="/collections"
              className="hidden sm:flex items-center gap-1.5 text-sm text-neutral-500 hover:text-black transition-colors"
            >
              View All
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-4 gap-y-8 sm:gap-x-6">
            {bestSellers.map((product) => {
              const promo = promoMap.get(product.id);
              const { price: cardPrice, original: cardOriginal } = effectivePromoPrice(
                Number(product.base_price),
                promo ? promo.discount_price : null,
                displayMap.get(product.id)
              );
              return (
                <ProductCard
                  key={product.slug}
                  slug={product.slug}
                  name={product.name}
                  price={cardPrice}
                  originalPrice={cardOriginal}
                  imageUrl={product.primary_image || PLACEHOLDER_IMG}
                  badge={product.total_sold > 200 ? "Best Seller" : undefined}
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

          <div className="mt-10 text-center sm:hidden">
            <Link
              href="/collections"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-black"
            >
              View All Products
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </section>

      {/* ==================== DISPLAY PROMO ==================== */}
      {displayPromo && <DisplayPromoBanner promo={displayPromo} />}

      {/* ==================== NEW ARRIVALS ==================== */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="mx-auto max-w-7xl">
          <div className="flex items-end justify-between mb-12">
            <div>
              <p className="text-xs tracking-[0.3em] uppercase text-neutral-400 mb-2">
                Just In
              </p>
              <h2 className="text-2xl sm:text-3xl font-light">New Arrivals</h2>
            </div>
            <Link
              href="/collections"
              className="hidden sm:flex items-center gap-1.5 text-sm text-neutral-500 hover:text-black transition-colors"
            >
              View All
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-4 gap-y-8 sm:gap-x-6">
            {newArrivals.map((product) => {
              const promo = promoMap.get(product.id);
              const { price: cardPrice, original: cardOriginal } = effectivePromoPrice(
                Number(product.base_price),
                promo ? promo.discount_price : null,
                displayMap.get(product.id)
              );
              return (
                <ProductCard
                  key={product.slug}
                  slug={product.slug}
                  name={product.name}
                  price={cardPrice}
                  originalPrice={cardOriginal}
                  imageUrl={product.primary_image || PLACEHOLDER_IMG}
                  badge="New"
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
        </div>
      </section>

      {/* ==================== FEATURES BAR ==================== */}
      <section className="relative border-t border-neutral-200 bg-gradient-to-b from-neutral-50 to-white overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(0,0,0,0.04),transparent_50%),radial-gradient(circle_at_80%_80%,rgba(0,0,0,0.03),transparent_50%)] pointer-events-none" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {[
              {
                Icon: Truck,
                title: "Free Shipping",
                desc: "On orders over Rp 500.000",
              },
              {
                Icon: RotateCcw,
                title: "Easy Returns",
                desc: "30-day return policy",
              },
              {
                Icon: ShieldCheck,
                title: "Secure Payment",
                desc: "100% secure checkout",
              },
            ].map(({ Icon, title, desc }) => (
              <div
                key={title}
                className="group relative flex items-center gap-4 rounded-2xl border border-neutral-200/70 bg-white/80 backdrop-blur-sm p-5 sm:p-6 transition-all duration-300 hover:border-black hover:shadow-[0_12px_40px_-12px_rgba(0,0,0,0.15)] hover:-translate-y-1"
              >
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-neutral-100 text-black transition-all duration-300 group-hover:bg-black group-hover:text-white group-hover:rotate-[-4deg]">
                  <Icon className="h-5 w-5" strokeWidth={1.75} />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-black tracking-tight">
                    {title}
                  </p>
                  <p className="text-xs text-neutral-500 mt-0.5 truncate">
                    {desc}
                  </p>
                </div>
                <ArrowRight className="ml-auto h-4 w-4 text-neutral-300 opacity-0 -translate-x-2 transition-all duration-300 group-hover:opacity-100 group-hover:translate-x-0 group-hover:text-black shrink-0" />
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
