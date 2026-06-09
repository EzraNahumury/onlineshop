import { getCurrentUser } from "@/lib/user-auth";
import {
  listUserOrders,
  PENDING_STATUSES,
} from "@/lib/queries/user-orders";
import { OrderList } from "@/components/shop/order-list";
import { formatPrice } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function PendingOrdersPage() {
  const user = await getCurrentUser();
  if (!user) return null;

  const orders = await listUserOrders(user.id, PENDING_STATUSES);
  const totalAmount = orders.reduce((s, o) => s + Number(o.grand_total), 0);

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold text-black">Pesanan Tertunda</h1>

      <div className="bg-white rounded-2xl border border-neutral-100 p-5">
        <p className="text-sm text-neutral-500">
          Pesanan yang <strong className="text-black">belum selesai</strong> —
          menunggu pembayaran, diproses, atau dalam pengiriman.
        </p>
        <div className="mt-3 flex items-center justify-between text-sm">
          <span className="text-neutral-500">Total Pengeluaran</span>
          <span className="text-black font-semibold tabular-nums">
            {formatPrice(totalAmount)}{" "}
            <span className="text-neutral-400 font-normal">
              dari {orders.length} pesanan
            </span>
          </span>
        </div>
      </div>

      <OrderList
        orders={orders}
        emptyText="Tidak ada pesanan tertunda saat ini."
      />
    </div>
  );
}
