"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Truck } from "lucide-react";
import { OrderStatusBadge } from "@/components/admin/status-badge";
import { Modal } from "@/components/admin/modal";
import { ShipForm, type ShipFormValues } from "@/components/admin/ship-form";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/utils";
import type { CourierRow } from "@/lib/queries/admin/couriers";

export interface OrderRowItem {
  id: number;
  hash: string;
  order_number: string;
  user_name: string | null;
  user_email: string | null;
  item_count: number;
  grand_total: string;
  order_status: string;
  shipping_deadline_at: string | null;
  created_at: string;
}

const SHIPPABLE_STATUSES = new Set(["paid", "processing", "ready_to_ship"]);

export function OrdersTable({
  orders,
  bulkEnabled,
  couriers,
}: {
  orders: OrderRowItem[];
  bulkEnabled: boolean;
  couriers: CourierRow[];
}) {
  const router = useRouter();
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [bulkOpen, setBulkOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [bulkError, setBulkError] = useState<string | null>(null);
  const [resultMsg, setResultMsg] = useState<string | null>(null);

  const shippableIds = useMemo(
    () => orders.filter((o) => SHIPPABLE_STATUSES.has(o.order_status)).map((o) => o.id),
    [orders]
  );
  const allShippableSelected =
    bulkEnabled && shippableIds.length > 0 && shippableIds.every((id) => selected.has(id));

  function toggleAll() {
    if (allShippableSelected) setSelected(new Set());
    else setSelected(new Set(shippableIds));
  }

  function toggleOne(id: number) {
    const next = new Set(selected);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelected(next);
  }

  async function handleBulkSubmit(values: ShipFormValues) {
    setSubmitting(true);
    setBulkError(null);
    try {
      const res = await fetch("/api/admin/orders/bulk-ship", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          order_ids: Array.from(selected),
          method: values.method,
          courier_id: values.courier_id,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setBulkError(data.error || "Gagal");
        return;
      }
      setBulkOpen(false);
      setSelected(new Set());
      setResultMsg(
        `Berhasil: ${data.success}, Gagal: ${data.failed}. ${
          data.failed > 0 ? "Cek detail per pesanan." : ""
        }`
      );
      router.refresh();
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      {resultMsg && (
        <div className="bg-emerald-50 text-emerald-700 text-sm px-4 py-3 border-b border-emerald-200">
          {resultMsg}
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-neutral-50 text-xs uppercase tracking-wider text-neutral-500">
            <tr>
              {bulkEnabled && (
                <th className="w-10 px-4 py-3">
                  <input
                    type="checkbox"
                    checked={allShippableSelected}
                    onChange={toggleAll}
                    disabled={shippableIds.length === 0}
                    className="rounded border-neutral-300"
                  />
                </th>
              )}
              <th className="text-left px-5 py-3 font-medium">Nomor Pesanan</th>
              <th className="text-left px-5 py-3 font-medium">Customer</th>
              <th className="text-right px-5 py-3 font-medium">Item</th>
              <th className="text-right px-5 py-3 font-medium">Total</th>
              <th className="text-left px-5 py-3 font-medium">Status</th>
              <th className="text-left px-5 py-3 font-medium">Deadline Kirim</th>
              <th className="text-right px-5 py-3 font-medium">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100">
            {orders.map((o) => {
              const shippable = SHIPPABLE_STATUSES.has(o.order_status);
              return (
                <tr key={o.id} className={selected.has(o.id) ? "bg-blue-50/30" : "hover:bg-neutral-50"}>
                  {bulkEnabled && (
                    <td className="w-10 px-4 py-3">
                      <input
                        type="checkbox"
                        checked={selected.has(o.id)}
                        onChange={() => toggleOne(o.id)}
                        disabled={!shippable}
                        className="rounded border-neutral-300 disabled:opacity-30"
                      />
                    </td>
                  )}
                  <td className="px-5 py-3">
                    <div className="font-medium text-black">{o.order_number}</div>
                    <div className="text-xs text-neutral-500">
                      {new Date(o.created_at).toLocaleString("id-ID")}
                    </div>
                  </td>
                  <td className="px-5 py-3">
                    <div className="text-neutral-700">{o.user_name || "—"}</div>
                    <div className="text-xs text-neutral-500">{o.user_email || "—"}</div>
                  </td>
                  <td className="px-5 py-3 text-right tabular-nums text-neutral-600">
                    {o.item_count}
                  </td>
                  <td className="px-5 py-3 text-right tabular-nums font-medium">
                    {formatPrice(Number(o.grand_total))}
                  </td>
                  <td className="px-5 py-3">
                    <OrderStatusBadge status={o.order_status} />
                  </td>
                  <td className="px-5 py-3 text-xs text-neutral-500">
                    {o.shipping_deadline_at
                      ? new Date(o.shipping_deadline_at).toLocaleString("id-ID")
                      : "—"}
                  </td>
                  <td className="px-5 py-3 text-right">
                    <Link
                      href={`/admin/orders/${o.hash}`}
                      className="text-sm font-medium text-black hover:underline"
                    >
                      Detail
                    </Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {bulkEnabled && selected.size > 0 && (
        <div className="sticky bottom-0 bg-white border-t border-neutral-200 px-5 py-3 flex items-center justify-between gap-3 shadow-lg">
          <div className="text-sm">
            <span className="font-medium">{selected.size}</span> pesanan dipilih
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => setSelected(new Set())}>
              Batal Pilih
            </Button>
            <Button size="sm" onClick={() => setBulkOpen(true)}>
              <Truck className="h-4 w-4" />
              Pengiriman Massal
            </Button>
          </div>
        </div>
      )}

      <Modal
        open={bulkOpen}
        onClose={() => setBulkOpen(false)}
        title={`Pengiriman Massal (${selected.size} pesanan)`}
      >
        <ShipForm
          couriers={couriers}
          showTracking={false}
          onSubmit={handleBulkSubmit}
          onCancel={() => setBulkOpen(false)}
          submitting={submitting}
          submitLabel={`Proses ${selected.size} Pesanan`}
          error={bulkError}
        />
      </Modal>
    </>
  );
}
