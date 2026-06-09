import Link from "next/link";
import { getDashboardStats, getRecentOrders } from "@/lib/queries/admin/dashboard";
import { PageHeader } from "@/components/admin/page-header";
import { OrderStatusBadge } from "@/components/admin/status-badge";
import { EmptyState } from "@/components/admin/empty-state";
import { formatPrice } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const [stats, recentOrders] = await Promise.all([
    getDashboardStats(),
    getRecentOrders(5),
  ]);

  return (
    <div className="p-8">
      <PageHeader
        title="Dashboard"
        description="Ringkasan aktivitas toko"
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard label="Produk Live" value={stats.liveProducts.toString()} href="/admin/products?tab=live" />
        <StatCard label="Pesanan Perlu Dikirim" value={stats.ordersToShip.toString()} href="/admin/orders?tab=to_ship" />
        <StatCard label="Promo Aktif" value={stats.activePromotions.toString()} href="/admin/promotions?tab=active" />
        <StatCard
          label="Pendapatan Bulan Ini"
          value={formatPrice(stats.revenueThisMonth)}
          subtitle={`${stats.ordersThisMonth} pesanan`}
        />
      </div>

      <div className="bg-white border border-neutral-200 rounded-xl">
        <div className="px-5 py-4 border-b border-neutral-200 flex items-center justify-between">
          <h2 className="text-sm font-medium text-neutral-700">Pesanan Terbaru</h2>
          <Link href="/admin/orders" className="text-xs text-neutral-500 hover:text-black">
            Lihat semua →
          </Link>
        </div>
        {recentOrders.length === 0 ? (
          <EmptyState
            title="Belum ada pesanan"
            description="Pesanan akan muncul di sini setelah customer melakukan checkout."
          />
        ) : (
          <ul className="divide-y divide-neutral-100">
            {recentOrders.map((o) => (
              <li key={o.id} className="px-5 py-3 flex items-center justify-between gap-4">
                <div className="min-w-0">
                  <div className="text-sm font-medium text-black truncate">{o.order_number}</div>
                  <div className="text-xs text-neutral-500 truncate">
                    {o.user_name || "Customer"} · {new Date(o.created_at).toLocaleString("id-ID")}
                  </div>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0">
                  <span className="text-sm font-medium">{formatPrice(Number(o.grand_total))}</span>
                  <OrderStatusBadge status={o.order_status} />
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  subtitle,
  href,
}: {
  label: string;
  value: string;
  subtitle?: string;
  href?: string;
}) {
  const inner = (
    <div className="bg-white border border-neutral-200 rounded-xl p-5 hover:border-neutral-300 transition-colors">
      <div className="text-xs text-neutral-500 uppercase tracking-wider">{label}</div>
      <div className="text-2xl font-light text-black mt-2">{value}</div>
      {subtitle && (
        <div className="text-xs text-neutral-500 mt-1">{subtitle}</div>
      )}
    </div>
  );
  return href ? <Link href={href}>{inner}</Link> : inner;
}
