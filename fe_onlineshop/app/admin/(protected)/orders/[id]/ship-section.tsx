"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Truck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ShipForm, type ShipFormValues } from "@/components/admin/ship-form";
import type { CourierRow } from "@/lib/queries/admin/couriers";

export function ShipOrderSection({
  orderId,
  couriers,
}: {
  orderId: number;
  couriers: CourierRow[];
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(values: ShipFormValues) {
    setError(null);
    setSubmitting(true);
    try {
      const res = await fetch(`/api/admin/orders/${orderId}/ship`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Gagal");
        return;
      }
      setOpen(false);
      router.refresh();
    } finally {
      setSubmitting(false);
    }
  }

  if (!open) {
    return (
      <Button onClick={() => setOpen(true)} className="w-full">
        <Truck className="h-4 w-4" />
        Atur Pengiriman
      </Button>
    );
  }

  return (
    <div className="border border-neutral-200 rounded-lg p-4 bg-neutral-50">
      <div className="text-sm font-medium mb-3">Atur Pengiriman</div>
      <ShipForm
        couriers={couriers}
        onSubmit={handleSubmit}
        onCancel={() => setOpen(false)}
        submitting={submitting}
        error={error}
      />
    </div>
  );
}
