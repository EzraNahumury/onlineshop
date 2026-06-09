import {
  getAdminOrders,
  getOrderTabCounts,
  type AdminOrderTab,
} from "@/lib/queries/admin/orders";
import { getActiveCouriers } from "@/lib/queries/admin/couriers";
import { orderHash } from "@/lib/order-hash";
import { PageHeader } from "@/components/admin/page-header";
import { StatusTabs, type TabItem } from "@/components/admin/status-tabs";
import { SearchBar } from "@/components/admin/search-bar";
import { Pagination } from "@/components/admin/pagination";
import { EmptyState } from "@/components/admin/empty-state";
import { OrdersTable, type OrderRowItem } from "./orders-table";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 20;

const tabKeys: AdminOrderTab[] = [
  "all",
  "unpaid",
  "to_ship",
  "shipped",
  "completed",
  "returned",
];
const tabLabels: Record<AdminOrderTab, string> = {
  all: "Semua",
  unpaid: "Belum Bayar",
  to_ship: "Perlu Dikirim",
  shipped: "Dikirim",
  completed: "Selesai",
  returned: "Pengembalian",
};

type SearchParams = Promise<{
  tab?: string;
  search?: string;
  page?: string;
}>;

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const sp = await searchParams;
  const tab = (tabKeys.includes(sp.tab as AdminOrderTab) ? sp.tab : "all") as AdminOrderTab;
  const search = sp.search || "";
  const page = Math.max(1, Number(sp.page) || 1);

  const [list, counts, couriers] = await Promise.all([
    getAdminOrders({ tab, search, page, limit: PAGE_SIZE }),
    getOrderTabCounts(),
    getActiveCouriers(),
  ]);

  const tabs: TabItem[] = tabKeys.map((k) => ({
    key: k,
    label: tabLabels[k],
    count: counts[k],
  }));

  const orders: OrderRowItem[] = list.rows.map((o) => ({
    id: o.id,
    hash: orderHash(o.id),
    order_number: o.order_number,
    user_name: o.user_name,
    user_email: o.user_email,
    item_count: Number(o.item_count) || 0,
    grand_total: o.grand_total,
    order_status: o.order_status,
    shipping_deadline_at: o.shipping_deadline_at ? new Date(o.shipping_deadline_at).toISOString() : null,
    created_at: new Date(o.created_at).toISOString(),
  }));

  const bulkEnabled = tab === "to_ship";

  return (
    <div className="p-8">
      <PageHeader
        title="Pesanan"
        description="Pantau dan proses pesanan customer"
      />

      <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden">
        <StatusTabs tabs={tabs} />

        <div className="px-5 py-4 border-b border-neutral-200">
          <SearchBar placeholder="Cari nomor pesanan, nama, atau email…" />
        </div>

        {orders.length === 0 ? (
          <EmptyState
            title={search ? "Tidak ada hasil" : "Belum ada pesanan"}
            description={
              search
                ? `Tidak ada pesanan yang cocok dengan "${search}".`
                : "Pesanan dari customer akan muncul di sini setelah checkout berhasil."
            }
          />
        ) : (
          <>
            <OrdersTable
              orders={orders}
              bulkEnabled={bulkEnabled}
              couriers={couriers}
            />
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
