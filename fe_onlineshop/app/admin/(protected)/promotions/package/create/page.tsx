import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { PackagePromoForm } from "./package-form";

export const dynamic = "force-dynamic";

export default function CreatePackagePromoPage() {
  return (
    <div className="p-8 max-w-5xl">
      <Link
        href="/admin/promotions"
        className="inline-flex items-center gap-1 text-sm text-neutral-500 hover:text-black mb-4"
      >
        <ChevronLeft className="h-4 w-4" />
        Kembali ke Pusat Promosi
      </Link>

      <h1 className="text-2xl font-light text-black">Buat Paket Diskon</h1>
      <p className="text-sm text-neutral-500 mt-1 mb-6">
        Diskon bertingkat berdasarkan jumlah pembelian.
      </p>

      <PackagePromoForm />
    </div>
  );
}
