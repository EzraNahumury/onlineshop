"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { TabNav, type TabDef } from "@/components/admin/tab-nav";
import { Button } from "@/components/ui/button";
import { confirm } from "@/components/ui/confirm";
import type {
  ProductDetail,
  ProductImageRow,
  ProductVariantRow,
  ShippingProfileRow,
} from "@/lib/queries/admin/products";
import type { CategoryRow } from "@/lib/queries/admin/categories";
import type { BrandRow } from "@/lib/queries/admin/brands";
import { TabInfo } from "./tab-info";
import { TabDescription } from "./tab-description";
import { TabSales } from "./tab-sales";
import { TabShipping } from "./tab-shipping";

const tabs: TabDef[] = [
  { key: "info", label: "Informasi" },
  { key: "description", label: "Deskripsi" },
  { key: "sales", label: "Penjualan" },
  { key: "shipping", label: "Pengiriman" },
];

export function EditShell({
  product,
  images,
  variants,
  shipping,
  categories,
  brands,
}: {
  product: ProductDetail;
  images: ProductImageRow[];
  variants: ProductVariantRow[];
  shipping: ShippingProfileRow | null;
  categories: CategoryRow[];
  brands: BrandRow[];
}) {
  const router = useRouter();
  const [active, setActive] = useState<string>("info");
  const [statusBusy, setStatusBusy] = useState<"draft" | "live" | "archived" | null>(null);
  const [statusError, setStatusError] = useState<string | null>(null);

  async function changeStatus(target: "draft" | "live" | "archived") {
    setStatusBusy(target);
    setStatusError(null);
    try {
      const res = await fetch(`/api/admin/products/${product.id}/publish`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: target }),
      });
      const data = await res.json();
      if (!res.ok) {
        setStatusError(data.error || "Gagal memperbarui status");
        return;
      }
      router.refresh();
    } finally {
      setStatusBusy(null);
    }
  }

  return (
    <div className="space-y-4">
      {statusError && (
        <div className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-lg border border-red-200">
          {statusError}
        </div>
      )}

      <div className="bg-white border border-neutral-200 rounded-xl">
        <TabNav tabs={tabs} active={active} onChange={setActive} />

        <div className="p-6">
          {active === "info" && (
            <TabInfo
              product={product}
              images={images}
              categories={categories}
              brands={brands}
            />
          )}
          {active === "description" && <TabDescription product={product} />}
          {active === "sales" && <TabSales product={product} variants={variants} />}
          {active === "shipping" && <TabShipping product={product} shipping={shipping} />}
        </div>
      </div>

      <div className="sticky bottom-0 -mx-8 px-8 py-4 bg-white border-t border-neutral-200 flex flex-wrap items-center justify-end gap-3">
        {product.status === "live" ? (
          <Button
            variant="outline"
            onClick={() => changeStatus("draft")}
            loading={statusBusy === "draft"}
            disabled={statusBusy !== null}
          >
            Tarik dari Etalase
          </Button>
        ) : (
          <Button
            onClick={() => changeStatus("live")}
            loading={statusBusy === "live"}
            disabled={statusBusy !== null}
          >
            Simpan & Tampilkan
          </Button>
        )}
        {product.status !== "archived" && (
          <Button
            variant="outline"
            onClick={async () => {
              const ok = await confirm({
                title: "Arsipkan produk ini?",
                description: "Produk tidak akan tampil di etalase customer.",
                confirmText: "Arsipkan",
                variant: "danger",
              });
              if (ok) changeStatus("archived");
            }}
            loading={statusBusy === "archived"}
            disabled={statusBusy !== null}
          >
            Arsipkan
          </Button>
        )}
      </div>
    </div>
  );
}
