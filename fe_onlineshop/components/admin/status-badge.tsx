import { cn } from "@/lib/utils";

type Tone = "neutral" | "success" | "warning" | "danger" | "info" | "purple" | "orange";

const toneStyles: Record<Tone, string> = {
  neutral: "bg-neutral-100 text-neutral-700 border-neutral-200",
  success: "bg-emerald-50 text-emerald-700 border-emerald-200",
  warning: "bg-amber-50 text-amber-700 border-amber-200",
  danger: "bg-red-50 text-red-700 border-red-200",
  info: "bg-blue-50 text-blue-700 border-blue-200",
  purple: "bg-purple-50 text-purple-700 border-purple-200",
  orange: "bg-orange-50 text-orange-700 border-orange-200",
};

export function StatusBadge({
  tone = "neutral",
  children,
  className,
}: {
  tone?: Tone;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium border",
        toneStyles[tone],
        className
      )}
    >
      {children}
    </span>
  );
}

const productStatusMap: Record<string, { tone: Tone; label: string }> = {
  draft: { tone: "neutral", label: "Draft" },
  live: { tone: "success", label: "Live" },
  under_review: { tone: "warning", label: "Sedang Ditinjau" },
  archived: { tone: "neutral", label: "Diarsipkan" },
  rejected: { tone: "danger", label: "Ditolak" },
};

export function ProductStatusBadge({ status }: { status: string }) {
  const m = productStatusMap[status] || { tone: "neutral" as Tone, label: status };
  return <StatusBadge tone={m.tone}>{m.label}</StatusBadge>;
}

const orderStatusMap: Record<string, { tone: Tone; label: string }> = {
  unpaid: { tone: "warning", label: "Belum Bayar" },
  pending_payment: { tone: "orange", label: "Menunggu Pembayaran" },
  paid: { tone: "info", label: "Dibayar" },
  processing: { tone: "purple", label: "Diproses" },
  ready_to_ship: { tone: "purple", label: "Siap Kirim" },
  shipped: { tone: "info", label: "Dikirim" },
  completed: { tone: "success", label: "Selesai" },
  cancelled: { tone: "danger", label: "Dibatalkan" },
  refunded: { tone: "neutral", label: "Refund" },
};

export function OrderStatusBadge({ status }: { status: string }) {
  const m = orderStatusMap[status] || { tone: "neutral" as Tone, label: status };
  return <StatusBadge tone={m.tone}>{m.label}</StatusBadge>;
}

const promoStatusMap: Record<string, { tone: Tone; label: string }> = {
  draft: { tone: "neutral", label: "Draft" },
  scheduled: { tone: "info", label: "Terjadwal" },
  active: { tone: "success", label: "Aktif" },
  paused: { tone: "warning", label: "Dijeda" },
  ended: { tone: "neutral", label: "Berakhir" },
  cancelled: { tone: "danger", label: "Dibatalkan" },
};

export function PromoStatusBadge({ status }: { status: string }) {
  const m = promoStatusMap[status] || { tone: "neutral" as Tone, label: status };
  return <StatusBadge tone={m.tone}>{m.label}</StatusBadge>;
}

const promoTypeMap: Record<string, string> = {
  store_promo: "Promo Toko",
  package_discount: "Paket Diskon",
  combo_deal: "Kombo Hemat",
};

export function PromoTypeLabel({ type }: { type: string }) {
  return <span>{promoTypeMap[type] || type}</span>;
}
