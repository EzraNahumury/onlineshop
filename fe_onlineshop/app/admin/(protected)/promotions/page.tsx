import Link from "next/link";
import { Tag, Boxes, Layers } from "lucide-react";
import {
  getAdminPromotions,
  getPromoTabCounts,
  type AdminPromoTab,
} from "@/lib/queries/admin/promotions";
import { PageHeader } from "@/components/admin/page-header";
import { StatusTabs, type TabItem } from "@/components/admin/status-tabs";
import { PromoStatusBadge, PromoTypeLabel } from "@/components/admin/status-badge";
import { Pagination } from "@/components/admin/pagination";
import { EmptyState } from "@/components/admin/empty-state";
import { PromoRowActions } from "./promo-row-actions";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 20;

const tabKeys: AdminPromoTab[] = ["all", "active", "scheduled", "ended", "draft"];
const tabLabels: Record<AdminPromoTab, string> = {
  all: "Semua",
  active: "Sedang Berlangsung",
  scheduled: "Akan Datang",
  ended: "Berakhir",
  draft: "Draft",
};

type SearchParams = Promise<{
  tab?: string;
  page?: string;
}>;

const promoTypes = [
  {
    key: "store_promo",
    title: "Promo Toko",
    description: "Diskon untuk produk-produk tertentu dalam periode tertentu.",
    icon: Tag,
    href: "/admin/promotions/store/create",
  },
  {
    key: "package_discount",
    title: "Paket Diskon",
    description: "Diskon bertingkat berdasarkan jumlah pembelian.",
    icon: Layers,
    href: "/admin/promotions/package/create",
  },
  {
    key: "combo_deal",
    title: "Kombo Hemat",
    description: "Beli produk utama, dapat diskon untuk produk tambahan.",
    icon: Boxes,
    href: "/admin/promotions/combo/create",
  },
];

export default async function AdminPromotionsPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const sp = await searchParams;
  const tab = (tabKeys.includes(sp.tab as AdminPromoTab) ? sp.tab : "all") as AdminPromoTab;
  const page = Math.max(1, Number(sp.page) || 1);

  const [list, counts] = await Promise.all([
    getAdminPromotions({ tab, page, limit: PAGE_SIZE }),
    getPromoTabCounts(),
  ]);

  const tabs: TabItem[] = tabKeys.map((k) => ({
    key: k,
    label: tabLabels[k],
    count: counts[k],
  }));

  return (
    <div className="p-8">
      <PageHeader
        title="Pusat Promosi"
        description="Kelola program promo untuk meningkatkan penjualan"
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {promoTypes.map((t) => {
          const Icon = t.icon;
          return (
            <Link
              key={t.key}
              href={t.href}
              className="bg-white border border-neutral-200 rounded-xl p-5 hover:border-black transition-colors group"
            >
              <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-neutral-100 group-hover:bg-black group-hover:text-white transition-colors mb-3">
                <Icon className="h-5 w-5" />
              </div>
              <div className="text-base font-medium text-black mb-1">{t.title}</div>
              <div className="text-xs text-neutral-500 leading-relaxed">{t.description}</div>
              <div className="mt-3 text-xs font-medium text-black">+ Buat baru</div>
            </Link>
          );
        })}
      </div>

      <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden">
        <div className="px-5 py-4 border-b border-neutral-200">
          <h2 className="text-sm font-medium text-neutral-700">Daftar Promosi</h2>
        </div>

        <StatusTabs tabs={tabs} />

        {list.rows.length === 0 ? (
          <EmptyState
            title="Belum ada promosi"
            description="Mulai buat program promo dari salah satu jenis di atas."
          />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-neutral-50 text-xs uppercase tracking-wider text-neutral-500">
                  <tr>
                    <th className="text-left px-5 py-3 font-medium">Nama Promo</th>
                    <th className="text-left px-5 py-3 font-medium">Jenis</th>
                    <th className="text-left px-5 py-3 font-medium">Periode</th>
                    <th className="text-right px-5 py-3 font-medium">Item</th>
                    <th className="text-left px-5 py-3 font-medium">Status</th>
                    <th className="text-right px-5 py-3 font-medium">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100">
                  {list.rows.map((p) => (
                    <tr key={p.id} className="hover:bg-neutral-50">
                      <td className="px-5 py-3 font-medium text-black">{p.name}</td>
                      <td className="px-5 py-3 text-neutral-600">
                        <PromoTypeLabel type={p.type} />
                      </td>
                      <td className="px-5 py-3 text-xs text-neutral-500">
                        {new Date(p.start_at).toLocaleDateString("id-ID")} –{" "}
                        {new Date(p.end_at).toLocaleDateString("id-ID")}
                      </td>
                      <td className="px-5 py-3 text-right tabular-nums text-neutral-600">
                        {p.item_count}
                      </td>
                      <td className="px-5 py-3">
                        <PromoStatusBadge status={p.status} />
                      </td>
                      <td className="px-5 py-3">
                        <PromoRowActions promoId={p.id} promoName={p.name} />
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
