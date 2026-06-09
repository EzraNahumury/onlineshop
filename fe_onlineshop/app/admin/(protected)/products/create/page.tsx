import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { CreateProductForm } from "./create-form";
import { Stepper, PRODUCT_STEPS } from "@/components/admin/stepper";
import { getActiveCategories } from "@/lib/queries/admin/categories";

export const dynamic = "force-dynamic";

export default async function CreateProductPage() {
  const categories = await getActiveCategories();

  return (
    <div className="p-8 max-w-3xl">
      <Link
        href="/admin/products"
        className="inline-flex items-center gap-1 text-sm text-neutral-500 hover:text-black mb-4"
      >
        <ChevronLeft className="h-4 w-4" />
        Kembali ke daftar produk
      </Link>

      <h1 className="text-2xl font-light text-black">Tambah Produk Baru</h1>
      <p className="text-sm text-neutral-500 mt-1 mb-6">
        Isi informasi dasar produk. Anda dapat melengkapi spesifikasi, harga, variasi, dan
        pengiriman pada langkah berikutnya.
      </p>

      <div className="bg-white border border-neutral-200 rounded-xl p-6 mb-6">
        <Stepper steps={PRODUCT_STEPS} current={1} />
      </div>

      <div className="bg-white border border-neutral-200 rounded-xl p-6">
        <CreateProductForm categories={categories} />
      </div>
    </div>
  );
}
