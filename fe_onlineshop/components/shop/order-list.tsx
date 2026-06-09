import Image from "next/image";
import Link from "next/link";
import { formatPrice } from "@/lib/utils";
import type { UserOrderRow, OrderStatus } from "@/lib/queries/user-orders";

const PLACEHOLDER =
  "https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=200&h=200&fit=crop";

const statusLabel: Record<OrderStatus, string> = {
  unpaid: "Belum Bayar",
  pending_payment: "Menunggu Konfirmasi",
  paid: "Dibayar",
  processing: "Diproses",
  ready_to_ship: "Siap Dikirim",
  shipped: "Dikirim",
  completed: "Selesai",
  cancelled: "Dibatalkan",
  refunded: "Dikembalikan",
};

const statusStyle: Record<OrderStatus, string> = {
  unpaid: "bg-amber-50 text-amber-700 border-amber-100",
  pending_payment: "bg-amber-50 text-amber-700 border-amber-100",
  paid: "bg-blue-50 text-blue-700 border-blue-100",
  processing: "bg-blue-50 text-blue-700 border-blue-100",
  ready_to_ship: "bg-blue-50 text-blue-700 border-blue-100",
  shipped: "bg-indigo-50 text-indigo-700 border-indigo-100",
  completed: "bg-emerald-50 text-emerald-700 border-emerald-100",
  cancelled: "bg-red-50 text-red-700 border-red-100",
  refunded: "bg-neutral-100 text-neutral-700 border-neutral-200",
};

function formatDate(d: Date | null) {
  if (!d) return "-";
  return new Date(d).toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function OrderList({
  orders,
  emptyText,
}: {
  orders: UserOrderRow[];
  emptyText: string;
}) {
  if (orders.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-neutral-100 p-10 text-center">
        <p className="text-sm text-neutral-400">{emptyText}</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {orders.map((o) => (
        <article
          key={o.id}
          className="bg-white rounded-2xl border border-neutral-100 p-5 hover:shadow-sm transition-shadow"
        >
          <div className="flex items-center justify-between gap-3 mb-4 flex-wrap">
            <div className="flex items-center gap-3">
              <span className="font-mono text-xs text-neutral-500">
                #{o.order_number}
              </span>
              <span className="text-xs text-neutral-400">·</span>
              <span className="text-xs text-neutral-500">
                {formatDate(o.created_at)}
              </span>
            </div>
            <span
              className={`text-[10px] tracking-wider uppercase px-2.5 py-1 rounded-full border font-medium ${statusStyle[o.order_status]}`}
            >
              {statusLabel[o.order_status]}
            </span>
          </div>

          <div className="flex items-center gap-4">
            <div className="relative w-16 h-16 flex-shrink-0 rounded-lg overflow-hidden bg-neutral-100">
              <Image
                src={o.first_item_image || PLACEHOLDER}
                alt={o.first_item_name || "Produk"}
                fill
                sizes="64px"
                className="object-cover"
              />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-neutral-900 line-clamp-1">
                {o.first_item_name || "Pesanan"}
              </div>
              {o.item_count > 1 && (
                <div className="text-xs text-neutral-500 mt-0.5">
                  + {o.item_count - 1} produk lainnya
                </div>
              )}
            </div>
            <div className="text-right flex-shrink-0">
              <div className="text-xs text-neutral-400">Total</div>
              <div className="text-base font-semibold text-black tabular-nums">
                {formatPrice(Number(o.grand_total))}
              </div>
            </div>
          </div>

          {(o.order_status === "unpaid" || o.order_status === "pending_payment") && (
            <div className="mt-4 pt-3 border-t border-neutral-100 flex justify-end">
              <Link
                href={`/payment/${o.order_number}`}
                className="inline-flex items-center h-9 px-4 rounded-full bg-black text-white text-xs font-medium hover:bg-neutral-800 transition-colors"
              >
                {o.order_status === "unpaid"
                  ? "Bayar Sekarang"
                  : "Lihat / Konfirmasi Pembayaran"}
              </Link>
            </div>
          )}
        </article>
      ))}
    </div>
  );
}
