"use client";

import { useState } from "react";
import { ChevronDown, Loader2, PackageSearch } from "lucide-react";

interface TrackingHistoryItem {
  date: string;
  desc: string;
  code: string;
}

interface TrackingResult {
  podStatus: string;
  lastStatus: string;
  estimateDelivery: string | null;
  history: TrackingHistoryItem[];
}

export function OrderTrackingButton({
  orderNumber,
  trackingNumber,
}: {
  orderNumber: string;
  trackingNumber: string;
}) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tracking, setTracking] = useState<TrackingResult | null>(null);

  async function handleToggle() {
    if (open) {
      setOpen(false);
      return;
    }
    setOpen(true);
    if (tracking) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/track", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ order_number: orderNumber }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Gagal memuat status pengiriman.");
        return;
      }
      setTracking(data.tracking);
    } catch {
      setError("Terjadi kesalahan jaringan.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mt-4 pt-3 border-t border-neutral-100">
      <button
        type="button"
        onClick={handleToggle}
        className="w-full flex items-center justify-between text-xs text-neutral-600 hover:text-black transition-colors"
      >
        <span className="inline-flex items-center gap-1.5">
          <PackageSearch className="h-3.5 w-3.5" />
          Resi: <span className="font-mono">{trackingNumber}</span>
        </span>
        <ChevronDown className={`h-3.5 w-3.5 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className="mt-3 bg-neutral-50 border border-neutral-100 rounded-lg p-3">
          {loading && (
            <div className="flex items-center gap-2 text-xs text-neutral-400">
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              Memuat status...
            </div>
          )}
          {error && <p className="text-xs text-neutral-400 italic">{error}</p>}
          {tracking && (
            <>
              <div className="flex items-center justify-between gap-2 flex-wrap mb-2">
                <span className="text-xs font-medium text-black">
                  {tracking.podStatus || tracking.lastStatus || "Dalam pengiriman"}
                </span>
                {tracking.estimateDelivery && (
                  <span className="text-xs text-neutral-500">
                    Estimasi {tracking.estimateDelivery}
                  </span>
                )}
              </div>
              {tracking.history.length > 0 && (
                <ul className="space-y-1.5">
                  {tracking.history
                    .slice()
                    .reverse()
                    .map((h, idx) => (
                      <li key={idx} className="text-xs text-neutral-600 flex gap-2">
                        <span className="text-neutral-400 shrink-0">{h.date}</span>
                        <span>{h.desc}</span>
                      </li>
                    ))}
                </ul>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
