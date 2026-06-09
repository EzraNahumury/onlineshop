"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { confirm } from "@/components/ui/confirm";

export function OrderActions({
  orderId,
  canComplete,
  canCancel,
}: {
  orderId: number;
  canComplete: boolean;
  canCancel: boolean;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function changeStatus(target: "completed" | "cancelled") {
    setError(null);
    setBusy(target);
    try {
      const res = await fetch(`/api/admin/orders/${orderId}/status`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: target }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Gagal");
        return;
      }
      router.refresh();
    } finally {
      setBusy(null);
    }
  }

  if (!canComplete && !canCancel) return null;

  return (
    <div>
      {error && (
        <div className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-lg border border-red-200 mb-3">
          {error}
        </div>
      )}
      <div className="flex flex-wrap items-center gap-2">
        {canComplete && (
          <Button
            onClick={() => changeStatus("completed")}
            loading={busy === "completed"}
            disabled={busy !== null}
            size="sm"
          >
            Tandai Selesai
          </Button>
        )}
        {canCancel && (
          <Button
            variant="outline"
            size="sm"
            onClick={async () => {
              const ok = await confirm({
                title: "Batalkan pesanan ini?",
                description: "Pesanan akan dibatalkan secara permanen.",
                confirmText: "Batalkan Pesanan",
                variant: "danger",
              });
              if (ok) changeStatus("cancelled");
            }}
            loading={busy === "cancelled"}
            disabled={busy !== null}
            className="text-red-600 hover:bg-red-50"
          >
            Batalkan Pesanan
          </Button>
        )}
      </div>
    </div>
  );
}
