"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import type { PromoStatus } from "@/lib/queries/admin/promotions";
import { confirm } from "@/components/ui/confirm";

export function PromoActionBar({
  id,
  status,
}: {
  id: number;
  status: PromoStatus;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const isFinal = status === "ended" || status === "cancelled";

  async function changeStatus(target: PromoStatus) {
    setError(null);
    setBusy(target);
    try {
      const res = await fetch(`/api/admin/promotions/${id}/status`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: target }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Gagal mengubah status");
        return;
      }
      router.refresh();
    } finally {
      setBusy(null);
    }
  }

  async function handleDelete() {
    const ok = await confirm({
      title: "Hapus promo ini?",
      description: "Tindakan ini tidak bisa dibatalkan.",
      confirmText: "Hapus",
      variant: "danger",
    });
    if (!ok) return;
    setBusy("delete");
    try {
      const res = await fetch(`/api/admin/promotions/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error || "Gagal menghapus");
        return;
      }
      router.push("/admin/promotions");
    } finally {
      setBusy(null);
    }
  }

  return (
    <div>
      {error && (
        <div className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-lg border border-red-200 mb-3">
          {error}
        </div>
      )}
      <div className="flex flex-wrap items-center gap-2">
        {status === "active" && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => changeStatus("paused")}
            loading={busy === "paused"}
            disabled={busy !== null}
          >
            Jeda Promo
          </Button>
        )}
        {status === "paused" && (
          <Button
            size="sm"
            onClick={() => changeStatus("active")}
            loading={busy === "active"}
            disabled={busy !== null}
          >
            Lanjutkan Promo
          </Button>
        )}
        {!isFinal && (
          <Button
            variant="outline"
            size="sm"
            onClick={async () => {
              const ok = await confirm({
                title: "Batalkan promo ini?",
                description: "Promo tidak akan aktif lagi.",
                confirmText: "Batalkan Promo",
                variant: "danger",
              });
              if (ok) changeStatus("cancelled");
            }}
            loading={busy === "cancelled"}
            disabled={busy !== null}
          >
            Batalkan
          </Button>
        )}
        <Button
          variant="outline"
          size="sm"
          onClick={handleDelete}
          loading={busy === "delete"}
          disabled={busy !== null}
          className="text-red-600 hover:bg-red-50"
        >
          Hapus
        </Button>
      </div>
    </div>
  );
}
