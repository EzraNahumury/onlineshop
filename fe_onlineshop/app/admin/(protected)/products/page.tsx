import Image from "next/image";
import Link from "next/link";
import { Plus } from "lucide-react";
import {
  getAdminProducts,
  getProductTabCounts,
  type AdminProductTab,
  type AdminProductSort,
} from "@/lib/queries/admin/products";
import { PageHeader } from "@/components/admin/page-header";
import { StatusTabs, type TabItem } from "@/components/admin/status-tabs";
import { ProductStatusBadge } from "@/components/admin/status-badge";
import { SearchBar } from "@/components/admin/search-bar";
import { Pagination } from "@/components/admin/pagination";
import { EmptyState } from "@/components/admin/empty-state";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/utils";
import { ProductRowActions } from "./product-row-actions";
import { SortSelect } from "./sort-select";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 20;

const tabKeys: AdminProductTab[] = [
  "all",
  "live",
  "needs_action",
  "under_review",
  "draft",
  "archived",
];
const tabLabels: Record<AdminProductTab, string> = {
  all: "Semua",
  live: "Live",
  needs_action: "Perlu Tindakan",
  under_review: "Sedang Ditinjau",
  draft: "Belum Ditampilkan",
  archived: "Diarsipkan",
};

const sortOptions: { value: AdminProductSort; label: string }[] = [
  { value: "newest", label: "Terbaru" },
  { value: "price_asc", label: "Harga: Rendah ke Tinggi" },
  { value: "price_desc", label: "Harga: Tinggi ke Rendah" },
  { value: "stock_asc", label: "Stok Terendah" },
  { value: "best_selling", label: "Terlaris" },
];

type SearchParams = Promise<{
  tab?: string;
  sort?: string;
  search?: string;
  page?: string;
}>;

export default async function AdminProductsPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const sp = await searchParams;
  const tab = (tabKeys.includes(sp.tab as AdminProductTab) ? sp.tab : "all") as AdminProductTab;
  const sort = (sp.sort as AdminProductSort) || "newest";
  const search = sp.search || "";
  const page = Math.max(1, Number(sp.page) || 1);

  const [list, counts] = await Promise.all([
    getAdminProducts({ tab, sort, search, page, limit: PAGE_SIZE }),
    getProductTabCounts(),
  ]);

  const tabs: TabItem[] = tabKeys.map((k) => ({
    key: k,
    label: tabLabels[k],
    count: counts[k],
  }));

  return (
    <div className="p-8">
      <PageHeader
        title="Produk"
        description="Kelola katalog produk toko"
        action={
          <Link href="/admin/products/create">
            <Button>
              <Plus className="h-4 w-4" />
              Tambah Produk
            </Button>
          </Link>
        }
      />

      <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden">
        <StatusTabs tabs={tabs} />

        <div className="px-5 py-4 flex flex-wrap items-center gap-3 border-b border-neutral-200">
          <SearchBar placeholder="Cari nama atau SKU…" />
          <div className="ml-auto">
            <SortSelect options={sortOptions} defaultValue={sort} />
          </div>
        </div>

        {list.rows.length === 0 ? (
          <EmptyState
            title={search ? "Tidak ada hasil" : "Belum ada produk"}
            description={
              search
                ? `Tidak ada produk yang cocok dengan "${search}".`
                : "Mulai bangun katalog Anda dengan menambahkan produk pertama."
            }
            action={
              !search && (
                <Link href="/admin/products/create">
                  <Button>
                    <Plus className="h-4 w-4" />
                    Tambah Produk
                  </Button>
                </Link>
              )
            }
          />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-neutral-50 text-xs uppercase tracking-wider text-neutral-500">
                  <tr>
                    <th className="text-left px-5 py-3 font-medium">Produk</th>
                    <th className="text-left px-5 py-3 font-medium">Kategori</th>
                    <th className="text-right px-5 py-3 font-medium">Harga</th>
                    <th className="text-right px-5 py-3 font-medium">Stok</th>
                    <th className="text-right px-5 py-3 font-medium">Terjual</th>
                    <th className="text-left px-5 py-3 font-medium">Status</th>
                    <th className="text-right px-5 py-3 font-medium">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100">
                  {list.rows.map((p) => (
                    <tr key={p.id} className="hover:bg-neutral-50">
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-10 h-10 rounded-md bg-neutral-100 flex-shrink-0 overflow-hidden relative">
                            {p.primary_image ? (
                              <Image
                                src={p.primary_image}
                                alt={p.name}
                                fill
                                sizes="40px"
                                className="object-cover"
                              />
                            ) : null}
                          </div>
                          <div className="min-w-0">
                            <div className="font-medium text-black truncate">{p.name}</div>
                            {p.has_variant === 1 && (
                              <div className="text-xs text-neutral-500">memiliki variasi</div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3 text-neutral-600">{p.category_name || "—"}</td>
                      <td className="px-5 py-3 text-right tabular-nums">
                        {formatPrice(Number(p.base_price))}
                      </td>
                      <td className="px-5 py-3 text-right tabular-nums">
                        <span className={p.stock < 10 ? "text-red-600" : ""}>{p.stock}</span>
                      </td>
                      <td className="px-5 py-3 text-right tabular-nums text-neutral-600">
                        {p.total_sold}
                      </td>
                      <td className="px-5 py-3">
                        <ProductStatusBadge status={p.status} />
                      </td>
                      <td className="px-5 py-3">
                        <ProductRowActions
                          productId={p.id}
                          productName={p.name}
                          status={p.status}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <Pagination
              total={list.total}
              pageSize={PAGE_SIZE}
              currentPage={page}
            />
          </>
        )}
      </div>
    </div>
  );
}
