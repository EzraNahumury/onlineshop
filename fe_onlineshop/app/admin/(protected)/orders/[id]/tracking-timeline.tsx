import type { JneTrackingResult } from "@/lib/jne";

export function TrackingTimeline({ tracking }: { tracking: JneTrackingResult | null }) {
  if (!tracking) {
    return (
      <p className="text-xs text-neutral-400 mt-2 italic">
        Status pengiriman belum tersedia dari JNE (resi belum terdeteksi, atau masih sandbox).
      </p>
    );
  }

  return (
    <div className="mt-3 bg-neutral-50 border border-neutral-200 rounded-lg p-3">
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <span className="text-xs font-medium text-black">
          Status: {tracking.podStatus || tracking.lastStatus || "Dalam pengiriman"}
        </span>
        {tracking.estimateDelivery && (
          <span className="text-xs text-neutral-500">Estimasi {tracking.estimateDelivery}</span>
        )}
      </div>
      {tracking.history.length > 0 && (
        <ul className="mt-2 space-y-1.5">
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
    </div>
  );
}
