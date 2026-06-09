"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { confirm } from "@/components/ui/confirm";

export function PaymentVerifyButton({ orderId }: { orderId: number }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function verify() {
    const ok = await confirm({
      title: "Verifikasi pembayaran?",
      description:
        "Pastikan bukti transfer sudah benar. Pesanan akan masuk ke tab 'Perlu Dikirim'.",
      confirmText: "Verifikasi Pembayaran",
    });
    if (!ok) return;

    setError(null);
    setBusy(true);
    try {
      const res = await fetch(`/api/admin/orders/${orderId}/verify-payment`, {
        method: "POST",
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Gagal memverifikasi.");
        return;
      }
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      {error && (
        <div className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-lg border border-red-200 mb-3">
          {error}
        </div>
      )}
      <Button onClick={verify} loading={busy} size="sm">
        <CheckCircle2 className="h-4 w-4" />
        Verifikasi Pembayaran
      </Button>
    </div>
  );
}
