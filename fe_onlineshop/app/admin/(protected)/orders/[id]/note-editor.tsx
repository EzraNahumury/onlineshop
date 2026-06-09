"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export function AdminNoteEditor({
  orderId,
  initialNote,
}: {
  orderId: number;
  initialNote: string;
}) {
  const router = useRouter();
  const [note, setNote] = useState(initialNote);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<{ type: "ok" | "err"; text: string } | null>(null);

  async function handleSave() {
    setSaving(true);
    setMsg(null);
    try {
      const res = await fetch(`/api/admin/orders/${orderId}/note`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ note }),
      });
      const data = await res.json();
      if (!res.ok) {
        setMsg({ type: "err", text: data.error || "Gagal" });
        return;
      }
      setMsg({ type: "ok", text: "Tersimpan" });
      router.refresh();
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-2">
      <textarea
        value={note}
        onChange={(e) => setNote(e.target.value)}
        rows={4}
        placeholder="Catatan internal hanya untuk admin…"
        className="w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent resize-y"
      />
      <div className="flex items-center justify-between">
        <span
          className={
            msg
              ? msg.type === "ok"
                ? "text-xs text-emerald-600"
                : "text-xs text-red-600"
              : "text-xs text-neutral-400"
          }
        >
          {msg?.text || ""}
        </span>
        <Button size="sm" onClick={handleSave} loading={saving}>
          Simpan Catatan
        </Button>
      </div>
    </div>
  );
}
