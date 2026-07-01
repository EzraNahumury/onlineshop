"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Truck, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ShipForm, type ShipFormValues } from "@/components/admin/ship-form";
import type { CourierRow } from "@/lib/queries/admin/couriers";

type Mode = "closed" | "manual" | "jne_auto";

function todayDDMMYYYY(): string {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Jakarta",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).formatToParts(new Date());
  const get = (t: string) => parts.find((p) => p.type === t)?.value || "";
  return `${get("day")}-${get("month")}-${get("year")}`;
}

export function ShipOrderSection({
  orderId,
  couriers,
  shippingCourier,
  shippingServiceCode,
}: {
  orderId: number;
  couriers: CourierRow[];
  shippingCourier?: string | null;
  shippingServiceCode?: string | null;
}) {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("closed");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canAutoJne = shippingCourier === "JNE" && Boolean(shippingServiceCode);

  async function handleManualSubmit(values: ShipFormValues) {
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
      setMode("closed");
      router.refresh();
    } finally {
      setSubmitting(false);
    }
  }

  if (mode === "closed") {
    return (
      <div className="flex flex-col sm:flex-row gap-2">
        {canAutoJne && (
          <Button onClick={() => setMode("jne_auto")} className="flex-1">
            <Zap className="h-4 w-4" />
            Buat Resi Otomatis (JNE)
          </Button>
        )}
        <Button
          onClick={() => setMode("manual")}
          variant={canAutoJne ? "outline" : undefined}
          className="flex-1"
        >
          <Truck className="h-4 w-4" />
          Atur Pengiriman Manual
        </Button>
      </div>
    );
  }

  if (mode === "jne_auto") {
    return (
      <div className="border border-neutral-200 rounded-lg p-4 bg-neutral-50">
        <div className="text-sm font-medium mb-3">Buat Resi Otomatis via JNE</div>
        <JneAutoForm
          submitting={submitting}
          error={error}
          onSubmit={async (values) => {
            setError(null);
            setSubmitting(true);
            try {
              const res = await fetch(`/api/admin/orders/${orderId}/jne-ship`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(values),
              });
              const data = await res.json();
              if (!res.ok) {
                setError(data.error || "Gagal membuat resi JNE.");
                return;
              }
              setMode("closed");
              router.refresh();
            } catch {
              setError("Terjadi kesalahan jaringan. Coba lagi.");
            } finally {
              setSubmitting(false);
            }
          }}
          onCancel={() => setMode("closed")}
        />
      </div>
    );
  }

  return (
    <div className="border border-neutral-200 rounded-lg p-4 bg-neutral-50">
      <div className="text-sm font-medium mb-3">Atur Pengiriman</div>
      <ShipForm
        couriers={couriers}
        onSubmit={handleManualSubmit}
        onCancel={() => setMode("closed")}
        submitting={submitting}
        error={error}
      />
    </div>
  );
}

function JneAutoForm({
  submitting,
  error,
  onSubmit,
  onCancel,
}: {
  submitting: boolean;
  error: string | null;
  onSubmit: (values: {
    pickup_date: string;
    pickup_time: string;
    pickup_vehicle: "Motor" | "Mobil" | "Truck";
    type: "PICKUP" | "DROP";
  }) => void;
  onCancel: () => void;
}) {
  const [type, setType] = useState<"PICKUP" | "DROP">("PICKUP");
  const [pickupDate, setPickupDate] = useState(todayDDMMYYYY());
  const [pickupTime, setPickupTime] = useState("10:00");
  const [pickupVehicle, setPickupVehicle] = useState<"Motor" | "Mobil" | "Truck">("Motor");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onSubmit({ pickup_date: pickupDate, pickup_time: pickupTime, pickup_vehicle: pickupVehicle, type });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="bg-red-50 text-red-600 text-sm px-3 py-2 rounded-lg border border-red-200">
          {error}
        </div>
      )}

      <p className="text-xs text-neutral-500">
        Sistem akan membuat resi (AWB) langsung ke JNE memakai layanan yang sudah dipilih pelanggan
        saat checkout, lalu menyimpan nomor resinya secara otomatis.
      </p>

      <div>
        <label className="text-sm font-medium text-neutral-700 mb-2 block">Tipe</label>
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => setType("PICKUP")}
            className={
              type === "PICKUP"
                ? "border-2 border-black bg-white rounded-lg p-3 text-left"
                : "border border-neutral-200 bg-white hover:border-neutral-400 rounded-lg p-3 text-left"
            }
          >
            <div className="text-sm font-medium text-black">Pickup</div>
            <div className="text-xs text-neutral-500 mt-0.5">Kurir jemput ke gudang</div>
          </button>
          <button
            type="button"
            onClick={() => setType("DROP")}
            className={
              type === "DROP"
                ? "border-2 border-black bg-white rounded-lg p-3 text-left"
                : "border border-neutral-200 bg-white hover:border-neutral-400 rounded-lg p-3 text-left"
            }
          >
            <div className="text-sm font-medium text-black">Drop Off</div>
            <div className="text-xs text-neutral-500 mt-0.5">Diantar ke counter JNE</div>
          </button>
        </div>
      </div>

      {type === "PICKUP" && (
        <div className="grid grid-cols-2 gap-3">
          <Input
            id="pickup_date"
            label="Tanggal Jemput"
            placeholder="DD-MM-YYYY"
            value={pickupDate}
            onChange={(e) => setPickupDate(e.target.value)}
          />
          <Input
            id="pickup_time"
            label="Jam Jemput"
            placeholder="HH:MM"
            value={pickupTime}
            onChange={(e) => setPickupTime(e.target.value)}
          />
        </div>
      )}

      <div>
        <label className="text-sm font-medium text-neutral-700 mb-2 block">Kendaraan</label>
        <select
          value={pickupVehicle}
          onChange={(e) => setPickupVehicle(e.target.value as "Motor" | "Mobil" | "Truck")}
          className="h-11 w-full rounded-lg border border-neutral-300 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
        >
          <option value="Motor">Motor</option>
          <option value="Mobil">Mobil</option>
          <option value="Truck">Truck</option>
        </select>
      </div>

      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="outline" onClick={onCancel} disabled={submitting}>
          Batal
        </Button>
        <Button type="submit" loading={submitting}>
          Buat Resi
        </Button>
      </div>
    </form>
  );
}
