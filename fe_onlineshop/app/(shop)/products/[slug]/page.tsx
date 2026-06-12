import { notFound } from "next/navigation";
import Link from "next/link";
import { Tag, Clock, Star } from "lucide-react";
import {
  getProductBySlug,
  getProductVariants,
  getProductImages,
  getBestSellers,
} from "@/lib/queries/products";
import {
  getActiveStorePromoForProduct,
  getActiveStorePromosByProductIds,
} from "@/lib/queries/pricing";
import {
  getDisplayPromoForProduct,
  getDisplayPromoMapForProducts,
  applyDisplayDiscount,
  effectivePromoPrice,
} from "@/lib/queries/display-promo";
import { formatPrice } from "@/lib/utils";
import { ProductCard } from "@/components/shop/product-card";
import { VariantSelector } from "./variant-selector";
import { ProductGallery } from "./product-gallery";
import { WishlistButton } from "@/components/shop/wishlist-button";
import { getCurrentUser } from "@/lib/user-auth";
import { isInWishlist } from "@/lib/queries/wishlist";
import type { Metadata } from "next";

const PLACEHOLDER = "https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=600&h=800&fit=crop";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return { title: "Product Not Found" };
  return {
    title: product.name,
    description: product.description || `Shop ${product.name} at AYRES`,
  };
}

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) notFound();

  const [variants, images, related, promo, displayPromo, currentUser] =
    await Promise.all([
      getProductVariants(product.id),
      getProductImages(product.id),
      getBestSellers(4),
      getActiveStorePromoForProduct(product.id),
      getDisplayPromoForProduct(product.id),
      getCurrentUser(),
    ]);

  const initialInWishlist = currentUser
    ? await isInWishlist(currentUser.id, product.id)
    : false;

  const colorOptions = [
    ...new Set(variants.map((v) => v.option_value_1).filter(Boolean)),
  ] as string[];
  const sizeOptions = [
    ...new Set(variants.map((v) => v.option_value_2).filter(Boolean)),
  ] as string[];

  const relatedProducts = related.filter((p) => p.slug !== slug).slice(0, 4);
  const relatedIds = relatedProducts.map((p) => p.id);
  const [relatedPromos, relatedDisplay] = await Promise.all([
    getActiveStorePromosByProductIds(relatedIds),
    getDisplayPromoMapForProducts(relatedIds),
  ]);

  const basePrice = Number(product.base_price);
  const storePrice = promo ? promo.discount_price : null;
  const displayPrice = displayPromo
    ? applyDisplayDiscount(basePrice, displayPromo.discount_type, displayPromo.discount_value)
    : basePrice;
  const effectivePrice = Math.min(basePrice, storePrice ?? basePrice, displayPrice);
  const hasPromo = effectivePrice < basePrice && !product.has_variant;
  // Which promo actually produced the lowest price (for the label shown).
  const usingStore = !!promo && (storePrice ?? basePrice) === effectivePrice;
  const savings = basePrice - effectivePrice;
  const discountPercent = Math.round((savings / basePrice) * 100);

  return (
    <div>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-neutral-400 mb-8">
          <Link href="/" className="hover:text-black transition-colors">
            Home
          </Link>
          <span>/</span>
          {product.category_slug && (
            <>
              <Link
                href={`/collections/${product.category_slug}`}
                className="hover:text-black transition-colors"
              >
                {product.category_name}
              </Link>
              <span>/</span>
            </>
          )}
          <span className="text-neutral-700 truncate">{product.name}</span>
        </nav>

        {/* Product layout */}
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-16">
          <ProductGallery
            images={images.map((img) => ({
              id: img.id,
              image_url: img.image_url,
              alt_text: img.alt_text,
            }))}
            productName={product.name}
            fallback={PLACEHOLDER}
            productId={product.id}
            variantImages={Object.fromEntries(
              variants
                .filter((v) => v.image_url && v.option_value_1)
                .map((v) => [v.option_value_1 as string, v.image_url as string])
            )}
          />

          <div className="lg:sticky lg:top-32 lg:self-start">
            <div className="flex flex-col gap-6">
              {product.brand_name && (
                <p className="text-xs tracking-[0.3em] uppercase text-neutral-400">
                  {product.brand_name}
                </p>
              )}

              <div className="flex items-start justify-between gap-4">
                <h1 className="font-display text-3xl sm:text-4xl font-light leading-tight flex-1">
                  {product.name}
                </h1>
                <WishlistButton
                  productId={product.id}
                  initialInWishlist={initialInWishlist}
                  loggedIn={!!currentUser}
                  nextPath={`/products/${product.slug}`}
                />
              </div>

              {/* Rating & sold */}
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm -mt-2">
                <div className="flex items-center gap-0.5">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <Star
                      key={n}
                      className={`h-4 w-4 ${
                        n <= Math.round(Number(product.rating_avg))
                          ? "fill-amber-400 text-amber-400"
                          : "fill-neutral-200 text-neutral-200"
                      }`}
                    />
                  ))}
                  <span className="ml-1.5 text-neutral-500">
                    {product.rating_count > 0
                      ? `${Number(product.rating_avg).toFixed(1)} (${product.rating_count} ulasan)`
                      : "Belum ada ulasan"}
                  </span>
                </div>
                {product.total_sold > 0 && (
                  <>
                    <span className="text-neutral-300">·</span>
                    <span className="text-neutral-500">
                      {product.total_sold.toLocaleString("id-ID")} terjual
                    </span>
                  </>
                )}
              </div>

              {/* Price */}
              {hasPromo && usingStore && promo ? (
                <div className="space-y-2">
                  <div className="flex items-baseline gap-3 flex-wrap">
                    <span className="font-display text-3xl font-semibold text-red-600">
                      {formatPrice(effectivePrice)}
                    </span>
                    <span className="text-base text-neutral-400 line-through">
                      {formatPrice(basePrice)}
                    </span>
                    <span className="bg-red-600 text-white text-xs font-bold px-2 py-1 rounded-md">
                      −{Math.round(promo.discount_percent)}%
                    </span>
                  </div>
                  <div className="inline-flex items-center gap-2 text-xs text-red-700 bg-red-50 border border-red-100 rounded-full px-3 py-1.5">
                    <Tag className="h-3 w-3" />
                    <span className="font-medium">{promo.promotion_name}</span>
                    <span className="text-red-500">·</span>
                    <Clock className="h-3 w-3" />
                    <span>
                      Berakhir {new Date(promo.end_at).toLocaleDateString("id-ID", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </span>
                  </div>
                  <p className="text-xs text-neutral-500">
                    Hemat {formatPrice(basePrice - effectivePrice)} ·{" "}
                    Stok promo: {promo.promo_stock - promo.promo_sold}
                  </p>
                </div>
              ) : hasPromo ? (
                <div className="space-y-2">
                  <div className="flex items-baseline gap-3 flex-wrap">
                    <span className="font-display text-3xl font-semibold text-red-600">
                      {formatPrice(effectivePrice)}
                    </span>
                    <span className="text-base text-neutral-400 line-through">
                      {formatPrice(basePrice)}
                    </span>
                    <span className="bg-red-600 text-white text-xs font-bold px-2 py-1 rounded-md">
                      −{discountPercent}%
                    </span>
                  </div>
                  <div className="inline-flex items-center gap-2 text-xs text-red-700 bg-red-50 border border-red-100 rounded-full px-3 py-1.5">
                    <Tag className="h-3 w-3" />
                    <span className="font-medium">Promo Spesial — Waktu Terbatas</span>
                  </div>
                  <p className="text-xs text-neutral-500">Hemat {formatPrice(savings)}</p>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <span className="font-display text-3xl font-semibold">
                    {formatPrice(basePrice)}
                  </span>
                </div>
              )}

              <hr className="border-neutral-100" />

              <VariantSelector
                productId={product.id}
                productSlug={product.slug}
                productName={product.name}
                productImage={images[0]?.image_url || product.primary_image || null}
                basePrice={hasPromo ? effectivePrice : basePrice}
                originalPrice={hasPromo ? basePrice : null}
                hasVariant={!!product.has_variant}
                variants={variants.map((v) => ({
                  id: v.id,
                  color: v.option_value_1 || "",
                  size: v.option_value_2 || "",
                  price: Number(v.price),
                  stock: v.stock,
                  image_url: v.image_url,
                }))}
                colorOptions={colorOptions}
                sizeOptions={sizeOptions}
                stock={product.stock}
                minPurchase={product.min_purchase}
                maxPurchase={product.max_purchase}
              />

              <div className="rounded-2xl border border-neutral-200 divide-y divide-neutral-100">
                {product.description && (
                  <details className="group px-4" open>
                    <summary className="flex items-center justify-between cursor-pointer py-3 list-none">
                      <span className="text-sm font-medium">Description</span>
                      <span className="text-neutral-400 group-open:rotate-180 transition-transform">
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                          <path d="M4 6L8 10L12 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                        </svg>
                      </span>
                    </summary>
                    <p className="text-sm text-neutral-500 leading-relaxed pb-4">
                      {product.description}
                    </p>
                  </details>
                )}

                <details className="group px-4">
                  <summary className="flex items-center justify-between cursor-pointer py-3 list-none">
                    <span className="text-sm font-medium">Shipping & Returns</span>
                    <span className="text-neutral-400 group-open:rotate-180 transition-transform">
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                        <path d="M4 6L8 10L12 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                      </svg>
                    </span>
                  </summary>
                  <div className="text-sm text-neutral-500 leading-relaxed pb-4 space-y-2">
                    <p>Free shipping on orders over Rp 500.000</p>
                    <p>Standard delivery: 2-5 business days</p>
                    <p>30-day easy return policy</p>
                    <p>Weight: {product.weight_grams}g</p>
                  </div>
                </details>
              </div>
            </div>
          </div>
        </div>
      </div>

      {relatedProducts.length > 0 && (
        <section className="bg-white mt-16 py-20 px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <h2 className="font-display text-2xl font-light mb-10">You May Also Like</h2>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-4 gap-y-8 sm:gap-x-6">
              {relatedProducts.map((p) => {
                const rp = relatedPromos.get(p.id);
                const { price, original } = effectivePromoPrice(
                  Number(p.base_price),
                  rp ? rp.discount_price : null,
                  relatedDisplay.get(p.id)
                );
                return (
                  <ProductCard
                    key={p.slug}
                    slug={p.slug}
                    name={p.name}
                    price={price}
                    originalPrice={original}
                    imageUrl={p.primary_image || PLACEHOLDER}
                    productId={p.id}
                    category={p.category_name}
                    rating={Number(p.rating_avg)}
                    ratingCount={p.rating_count}
                    stock={p.stock}
                    hasVariant={!!p.has_variant}
                  />
                );
              })}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
