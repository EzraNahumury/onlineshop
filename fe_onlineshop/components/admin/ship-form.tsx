"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { CourierRow } from "@/lib/queries/admin/couriers";

export type ShipMethod = "pickup" | "drop_off" | "manual";

export interface ShipFormValues {
  method: ShipMethod;
  courier_id: number | null;
  tracking_number: string | null;
}

export function ShipForm({
  couriers,
  showTracking = true,
  initialMethod = "drop_off",
  onSubmit,
  onCancel,
  submitting,
  submitLabel = "Konfirmasi Pengiriman",
  error,
}: {
  couriers: CourierRow[];
  showTracking?: boolean;
  initialMethod?: ShipMethod;
  onSubmit: (values: ShipFormValues) => void;
  onCancel?: () => void;
  submitting?: boolean;
  submitLabel?: string;
  error?: string | null;
}) {
  const [method, setMethod] = useState<ShipMethod>(initialMethod);
  const [courierId, setCourierId] = useState<string>("");
  const [tracking, setTracking] = useState<string>("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onSubmit({
      method,
      courier_id: courierId ? Number(courierId) : null,
      tracking_number: tracking.trim() || null,
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="bg-red-50 text-red-600 text-sm px-3 py-2 rounded-lg border border-red-200">
          {error}
        </div>
      )}

      <div>
        <label className="text-sm font-medium text-neutral-700 mb-2 block">
          Metode Pengiriman
        </label>
        <div className="grid grid-cols-3 gap-2">
          <MethodOption
            value="drop_off"
            label="Drop Off"
            current={method}
            onSelect={setMethod}
            description="Antar ke kurir"
          />
          <MethodOption
            value="pickup"
            label="Pickup"
            current={method}
            onSelect={setMethod}
            description="Kurir jemput"
          />
          <MethodOption
            value="manual"
            label="Manual"
            current={method}
            onSelect={setMethod}
            description="Diantar sendiri"
          />
        </div>
      </div>

      {method !== "manual" && (
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-neutral-700">Kurir</label>
          {couriers.length === 0 ? (
            <div className="text-xs text-amber-600 px-3 py-2 bg-amber-50 border border-amber-200 rounded-lg">
              Belum ada kurir terdaftar. Import{" "}
              <code className="px-1 bg-amber-100 rounded">database/seed_couriers.sql</code> dulu,
              atau pakai metode &quot;Manual&quot;.
            </div>
          ) : (
            <select
              value={courierId}
              onChange={(e) => setCourierId(e.target.value)}
              className="h-11 rounded-lg border border-neutral-300 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
            >
              <option value="">— Pilih kurir —</option>
              {couriers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          )}
        </div>
      )}

      {showTracking && (
        <Input
          id="tracking"
          label="Nomor Resi (opsional)"
          placeholder="Bisa diisi nanti setelah resi keluar"
          value={tracking}
          onChange={(e) => setTracking(e.target.value)}
        />
      )}

      <div className="flex justify-end gap-2 pt-2">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel} disabled={submitting}>
            Batal
          </Button>
        )}
        <Button type="submit" loading={submitting}>
          {submitLabel}
        </Button>
      </div>
    </form>
  );
}

function MethodOption({
  value,
  label,
  description,
  current,
  onSelect,
}: {
  value: ShipMethod;
  label: string;
  description: string;
  current: ShipMethod;
  onSelect: (v: ShipMethod) => void;
}) {
  const active = current === value;
  return (
    <button
      type="button"
      onClick={() => onSelect(value)}
      className={
        active
          ? "border-2 border-black bg-neutral-50 rounded-lg p-3 text-left transition-all"
          : "border border-neutral-200 bg-white hover:border-neutral-400 rounded-lg p-3 text-left transition-all"
      }
    >
      <div className="text-sm font-medium text-black">{label}</div>
      <div className="text-xs text-neutral-500 mt-0.5">{description}</div>
    </button>
  );
}
