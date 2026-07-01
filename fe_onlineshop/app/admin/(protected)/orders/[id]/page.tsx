import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import {
  getOrderDetail,
  getOrderItems,
  getOrderInvoiceWithPayment,
  getOrderShipments,
  getStatusHistory,
  getOrderIdByHash,
  type AddressSnapshot,
} from "@/lib/queries/admin/order-detail";
import { getActiveCouriers } from "@/lib/queries/admin/couriers";
import { getPaymentConfirmation } from "@/lib/queries/payment";
import { OrderStatusBadge } from "@/components/admin/status-badge";
import { formatPrice, formatDate } from "@/lib/utils";
import { ShipOrderSection } from "./ship-section";
import { OrderActions } from "./order-actions";
import { PaymentVerifyButton } from "./payment-verify";
import { AdminNoteEditor } from "./note-editor";
import { trackJneShipment } from "@/lib/jne";
import { TrackingTimeline } from "./tracking-timeline";

export const dynamic = "force-dynamic";

const SHIPPABLE = new Set(["paid", "processing", "ready_to_ship"]);

export default async function OrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const orderId = await getOrderIdByHash(id);
  if (!orderId) notFound();

  const order = await getOrderDetail(orderId);
  if (!order) notFound();

  const [items, invoice, shipments, history, couriers, paymentConfirmation] =
    await Promise.all([
      getOrderItems(orderId),
      getOrderInvoiceWithPayment(orderId),
      getOrderShipments(orderId),
      getStatusHistory(orderId),
      getActiveCouriers(),
      getPaymentConfirmation(orderId),
    ]);

  const address: AddressSnapshot =
    typeof order.address_snapshot === "string"
      ? safeParse(order.address_snapshot)
      : order.address_snapshot || {};

  const latestShipment = shipments[0] || null;
  const jneTracking =
    latestShipment?.courier_name === "JNE" && latestShipment.tracking_number
      ? await trackJneShipment(latestShipment.tracking_number)
      : null;

  const canShip = SHIPPABLE.has(order.order_status);
  const canComplete = order.order_status === "shipped";
  const canVerifyPayment = ["unpaid", "pending_payment"].includes(order.order_status);
  const canCancel = ["unpaid", "pending_payment", "paid", "processing", "ready_to_ship"].includes(
    order.order_status
  );

  return (
    <div className="p-8 max-w-6xl">
      <Link
        href="/admin/orders"
        className="inline-flex items-center gap-1 text-sm text-neutral-500 hover:text-black mb-4"
      >
        <ChevronLeft className="h-4 w-4" />
        Kembali ke daftar pesanan
      </Link>

      <div className="flex items-start justify-between gap-4 mb-6">
        <div className="min-w-0">
          <h1 className="text-2xl font-light text-black">{order.order_number}</h1>
          <div className="flex flex-wrap items-center gap-2 mt-2 text-sm text-neutral-500">
            <OrderStatusBadge status={order.order_status} />
            <span>·</span>
            <span>
              Dibuat {new Date(order.created_at).toLocaleString("id-ID")}
            </span>
            {order.shipping_deadline_at && (
              <>
                <span>·</span>
                <span>
                  Deadline kirim:{" "}
                  {new Date(order.shipping_deadline_at).toLocaleString("id-ID")}
                </span>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-start gap-3">
        {canVerifyPayment && <PaymentVerifyButton orderId={order.id} />}
        <OrderActions
          orderId={order.id}
          canComplete={canComplete}
          canCancel={canCancel}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
        <div className="lg:col-span-2 space-y-6">
          <Section title={`Item Pesanan (${items.length})`}>
            {items.length === 0 ? (
              <Empty text="Tidak ada item." />
            ) : (
              <ul className="divide-y divide-neutral-100">
                {items.map((it) => (
                  <li key={it.id} className="py-3 flex items-center gap-3">
                    <div className="w-12 h-12 rounded-md bg-neutral-100 overflow-hidden relative flex-shrink-0">
                      {it.image_url && (
                        <Image
                          src={it.image_url}
                          alt=""
                          fill
                          sizes="48px"
                          className="object-cover"
                        />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-black truncate">
                        {it.product_name}
                      </div>
                      {it.variant_name && (
                        <div className="text-xs text-neutral-500">{it.variant_name}</div>
                      )}
                      <div className="text-xs text-neutral-500">
                        {it.quantity} × {formatPrice(Number(it.unit_price))}
                      </div>
                    </div>
                    <div className="text-sm font-medium tabular-nums">
                      {formatPrice(Number(it.subtotal))}
                    </div>
                  </li>
                ))}
              </ul>
            )}

            <div className="border-t border-neutral-200 pt-3 mt-3 space-y-1 text-sm">
              <Row label="Subtotal" value={formatPrice(Number(order.subtotal))} />
              {Number(order.discount_amount) > 0 && (
                <Row
                  label="Diskon"
                  value={`−${formatPrice(Number(order.discount_amount))}`}
                  positive
                />
              )}
              <Row label="Ongkir" value={formatPrice(Number(order.shipping_amount))} />
              {order.shipping_service_label && (
                <p className="text-xs text-neutral-400 -mt-0.5">
                  {order.shipping_service_label}
                  {order.shipping_etd ? ` • estimasi ${order.shipping_etd}` : ""}
                </p>
              )}
              {Number(order.service_fee) > 0 && (
                <Row label="Biaya layanan" value={formatPrice(Number(order.service_fee))} />
              )}
              <Row
                label="Total"
                value={formatPrice(Number(order.grand_total))}
                emphasize
              />
            </div>
          </Section>

          <Section title="Pengiriman">
            {canShip && (
              <div className="mb-4">
                <ShipOrderSection
                  orderId={order.id}
                  couriers={couriers}
                  shippingCourier={order.shipping_courier}
                  shippingServiceCode={order.shipping_service_code}
                />
              </div>
            )}
            {shipments.length === 0 ? (
              <Empty text="Belum ada data pengiriman." />
            ) : (
              <ul className="divide-y divide-neutral-100">
                {shipments.map((s) => (
                  <li key={s.id} className="py-3 text-sm">
                    <div className="flex items-start justify-between gap-3 flex-wrap">
                      <div>
                        <div className="font-medium text-black">
                          {s.courier_name || "Tanpa kurir"} · {labelMethod(s.shipping_method)}
                        </div>
                        {s.tracking_number && (
                          <div className="text-xs text-neutral-500 mt-0.5">
                            Resi: {s.tracking_number}
                          </div>
                        )}
                      </div>
                      <div className="text-xs text-neutral-500">
                        {s.shipped_at ? new Date(s.shipped_at).toLocaleString("id-ID") : "—"}
                      </div>
                    </div>
                    {s.id === latestShipment?.id && s.courier_name === "JNE" && s.tracking_number && (
                      <TrackingTimeline tracking={jneTracking} />
                    )}
                  </li>
                ))}
              </ul>
            )}
          </Section>

          <Section title="Riwayat Status">
            {history.length === 0 ? (
              <Empty text="Belum ada riwayat." />
            ) : (
              <ul className="space-y-3">
                {history.map((h) => (
                  <li key={h.id} className="flex gap-3">
                    <div className="w-2 h-2 rounded-full bg-neutral-300 mt-1.5 flex-shrink-0" />
                    <div className="flex-1 min-w-0 text-sm">
                      <div className="text-black">
                        {h.from_status ? `${h.from_status} → ` : ""}
                        <span className="font-medium">{h.to_status}</span>
                      </div>
                      {h.note && (
                        <div className="text-xs text-neutral-500 mt-0.5">{h.note}</div>
                      )}
                      <div className="text-xs text-neutral-400 mt-0.5">
                        {h.changed_by ? `oleh ${h.changed_by} · ` : ""}
                        {new Date(h.created_at).toLocaleString("id-ID")}
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </Section>
        </div>

        <div className="space-y-6">
          <Section title="Customer">
            <div className="text-sm space-y-1">
              <div className="font-medium text-black">{order.user_name || "—"}</div>
              <div className="text-neutral-600">{order.user_email}</div>
              {order.user_phone && (
                <div className="text-neutral-600">{order.user_phone}</div>
              )}
            </div>
          </Section>

          <Section title="Alamat Pengiriman">
            {address.receiver_name ? (
              <div className="text-sm space-y-1">
                <div className="font-medium text-black">{address.receiver_name}</div>
                {address.phone && (
                  <div className="text-neutral-600">{address.phone}</div>
                )}
                <div className="text-neutral-600">{address.address_line}</div>
                {address.address_detail && (
                  <div className="text-neutral-600">{address.address_detail}</div>
                )}
                <div className="text-neutral-600">
                  {[address.district, address.city, address.province, address.postal_code]
                    .filter(Boolean)
                    .join(", ")}
                </div>
              </div>
            ) : (
              <Empty text="Snapshot alamat tidak tersedia." />
            )}
          </Section>

          <Section title="Pembayaran">
            {invoice ? (
              <div className="text-sm space-y-1">
                <div className="text-neutral-500 text-xs">No. Invoice</div>
                <div className="font-medium text-black">{invoice.invoice_number}</div>
                <div className="flex items-center gap-2 text-xs mt-2">
                  <span className="text-neutral-500">Status:</span>
                  <span className="font-medium">{invoice.invoice_status}</span>
                </div>
                {invoice.payment_provider && (
                  <div className="text-xs text-neutral-500">
                    {invoice.payment_provider} · {invoice.payment_method || "—"}
                  </div>
                )}
                {invoice.payment_paid_at && (
                  <div className="text-xs text-neutral-500">
                    Dibayar: {new Date(invoice.payment_paid_at).toLocaleString("id-ID")}
                  </div>
                )}
              </div>
            ) : (
              <Empty text="Belum ada invoice." />
            )}
          </Section>

          {paymentConfirmation && (
            <Section title="Bukti Pembayaran">
              <div className="text-sm space-y-2">
                <div className="flex items-center gap-2 text-xs">
                  <span className="text-neutral-500">Status:</span>
                  <span
                    className={
                      paymentConfirmation.status === "verified"
                        ? "font-medium text-emerald-600"
                        : paymentConfirmation.status === "rejected"
                        ? "font-medium text-red-600"
                        : "font-medium text-amber-600"
                    }
                  >
                    {paymentConfirmation.status === "verified"
                      ? "Terverifikasi"
                      : paymentConfirmation.status === "rejected"
                      ? "Ditolak"
                      : "Menunggu verifikasi"}
                  </span>
                </div>
                <Row label="Pengirim" value={paymentConfirmation.sender_name} />
                <Row
                  label="Transfer ke"
                  value={paymentConfirmation.bank_label || paymentConfirmation.bank_code}
                />
                <Row
                  label="Tanggal transfer"
                  value={formatDate(paymentConfirmation.transfer_date)}
                />
                <Row
                  label="Jumlah"
                  value={formatPrice(Number(paymentConfirmation.amount))}
                />
                {paymentConfirmation.proof_image ? (
                  <a
                    href={paymentConfirmation.proof_image}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block mt-2"
                  >
                    <div className="relative w-full h-44 rounded-lg overflow-hidden border border-neutral-200 bg-neutral-50">
                      <Image
                        src={paymentConfirmation.proof_image}
                        alt="Bukti transfer"
                        fill
                        sizes="320px"
                        className="object-contain"
                      />
                    </div>
                    <span className="text-xs text-blue-600 hover:underline mt-1 inline-block">
                      Buka gambar penuh
                    </span>
                  </a>
                ) : (
                  <p className="text-xs text-neutral-400">Tanpa lampiran bukti.</p>
                )}
              </div>
            </Section>
          )}

          {order.customer_note && (
            <Section title="Catatan Customer">
              <p className="text-sm text-neutral-700">{order.customer_note}</p>
            </Section>
          )}

          <Section title="Catatan Internal Admin">
            <AdminNoteEditor orderId={order.id} initialNote={order.admin_note || ""} />
          </Section>
        </div>
      </div>
    </div>
  );
}

function safeParse(str: string): AddressSnapshot {
  try {
    return JSON.parse(str);
  } catch {
    return {};
  }
}

function labelMethod(m: string): string {
  if (m === "pickup") return "Pickup";
  if (m === "drop_off") return "Drop Off";
  return "Manual";
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="bg-white border border-neutral-200 rounded-xl">
      <div className="px-5 py-3 border-b border-neutral-200">
        <h2 className="text-sm font-medium text-neutral-700">{title}</h2>
      </div>
      <div className="px-5 py-4">{children}</div>
    </section>
  );
}

function Empty({ text }: { text: string }) {
  return <div className="text-sm text-neutral-500 py-4 text-center">{text}</div>;
}

function Row({
  label,
  value,
  positive,
  emphasize,
}: {
  label: string;
  value: string;
  positive?: boolean;
  emphasize?: boolean;
}) {
  return (
    <div className="flex justify-between">
      <span className={emphasize ? "font-medium text-black" : "text-neutral-600"}>
        {label}
      </span>
      <span
        className={
          emphasize
            ? "font-semibold text-black tabular-nums"
            : positive
            ? "text-emerald-600 tabular-nums"
            : "text-neutral-700 tabular-nums"
        }
      >
        {value}
      </span>
    </div>
  );
}
