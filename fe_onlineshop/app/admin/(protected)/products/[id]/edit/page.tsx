import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import {
  getProductDetail,
  getProductImages,
  getProductVariants,
  getShippingProfile,
} from "@/lib/queries/admin/products";
import { getActiveCategories } from "@/lib/queries/admin/categories";
import { getActiveBrands } from "@/lib/queries/admin/brands";
import { ProductStatusBadge } from "@/components/admin/status-badge";
import { EditShell } from "./edit-shell";

export const dynamic = "force-dynamic";

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const productId = Number(id);
  if (!Number.isInteger(productId) || productId <= 0) notFound();

  const product = await getProductDetail(productId);
  if (!product) notFound();

  const [images, variants, shipping, categories, brands] = await Promise.all([
    getProductImages(productId),
    getProductVariants(productId),
    getShippingProfile(productId),
    getActiveCategories(),
    getActiveBrands(),
  ]);

  return (
    <div className="p-8 max-w-5xl">
      <Link
        href="/admin/products"
        className="inline-flex items-center gap-1 text-sm text-neutral-500 hover:text-black mb-4"
      >
        <ChevronLeft className="h-4 w-4" />
        Kembali ke daftar produk
      </Link>

      <div className="flex items-start justify-between gap-4 mb-6">
        <div className="min-w-0">
          <h1 className="text-2xl font-light text-black truncate">{product.name}</h1>
          <div className="flex items-center gap-2 mt-1">
            <ProductStatusBadge status={product.status} />
            <span className="text-xs text-neutral-500">/{product.slug}</span>
          </div>
        </div>
      </div>

      <EditShell
        product={product}
        images={images}
        variants={variants}
        shipping={shipping}
        categories={categories}
        brands={brands}
      />
    </div>
  );
}
