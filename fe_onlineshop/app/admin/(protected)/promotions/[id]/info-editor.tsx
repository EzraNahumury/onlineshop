"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

function toLocalInput(d: Date | string): string {
  const date = new Date(d);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(
    date.getHours()
  )}:${pad(date.getMinutes())}`;
}

export function InfoEditor({
  promoId,
  initial,
  editable,
}: {
  promoId: number;
  initial: {
    name: string;
    description: string | null;
    start_at: string | Date;
    end_at: string | Date;
    max_purchase_per_user: number | null;
  };
  editable: boolean;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState(initial.name);
  const [description, setDescription] = useState(initial.description || "");
  const [start, setStart] = useState(toLocalInput(initial.start_at));
  const [end, setEnd] = useState(toLocalInput(initial.end_at));
  const [maxPerUser, setMaxPerUser] = useState(
    initial.max_purchase_per_user?.toString() || ""
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!editable) return null;

  if (!open) {
    return (
      <Button variant="outline" size="sm" onClick={() => setOpen(true)}>
        <Pencil className="h-3.5 w-3.5" />
        Edit Info
      </Button>
    );
  }

  async function handleSave() {
    setError(null);
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/promotions/${promoId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          description,
          start_at: new Date(start).toISOString(),
          end_at: new Date(end).toISOString(),
          max_purchase_per_user: maxPerUser ? Number(maxPerUser) : null,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Gagal");
        return;
      }
      setOpen(false);
      router.refresh();
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="border border-neutral-200 rounded-lg p-4 bg-white space-y-3 mt-3 max-w-2xl">
      {error && (
        <div className="bg-red-50 text-red-600 text-xs px-3 py-2 rounded-lg border border-red-200">
          {error}
        </div>
      )}
      <Input
        id="name"
        label="Nama Promo"
        value={name}
        onChange={(e) => setName(e.target.value)}
        maxLength={255}
      />
      <div className="grid grid-cols-2 gap-3">
        <DateField label="Mulai" value={start} onChange={setStart} />
        <DateField label="Selesai" value={end} onChange={setEnd} />
      </div>
      <Input
        id="max"
        label="Batas pembelian per user (opsional)"
        type="number"
        min="1"
        value={maxPerUser}
        onChange={(e) => setMaxPerUser(e.target.value)}
      />
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-neutral-700">Deskripsi (opsional)</label>
        <textarea
          rows={3}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent resize-y"
        />
      </div>
      <div className="flex justify-end gap-2 pt-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setOpen(false)}
          disabled={saving}
        >
          Batal
        </Button>
        <Button size="sm" onClick={handleSave} loading={saving}>
          Simpan
        </Button>
      </div>
    </div>
  );
}

function DateField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-medium text-neutral-700">{label}</label>
      <input
        type="datetime-local"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-11 w-full rounded-lg border border-neutral-300 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
      />
    </div>
  );
}
