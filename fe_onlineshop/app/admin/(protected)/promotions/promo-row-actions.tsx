"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Pencil, Trash2 } from "lucide-react";
import { confirm } from "@/components/ui/confirm";
import { toast } from "@/components/ui/toast";

export function PromoRowActions({
  promoId,
  promoName,
}: {
  promoId: number;
  promoName: string;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function handleDelete() {
    const ok = await confirm({
      title: `Hapus promo "${promoName}"?`,
      description: "Tindakan ini tidak bisa dibatalkan.",
      confirmText: "Hapus",
      variant: "danger",
    });
    if (!ok) return;
    setBusy(true);
    try {
      const res = await fetch(`/api/admin/promotions/${promoId}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        toast.error(data.error || "Gagal menghapus promo");
        return;
      }
      toast.success("Promo berhasil dihapus");
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex items-center justify-end gap-1">
      <Link
        href={`/admin/promotions/${promoId}`}
        className="inline-flex items-center justify-center w-8 h-8 rounded-md text-neutral-500 hover:bg-neutral-100 hover:text-black transition-colors"
        title="Edit / Kelola"
      >
        <Pencil className="h-4 w-4" />
      </Link>
      <button
        type="button"
        onClick={handleDelete}
        disabled={busy}
        className="inline-flex items-center justify-center w-8 h-8 rounded-md text-neutral-500 hover:bg-neutral-100 hover:text-red-600 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
        title="Hapus"
      >
        <Trash2 className="h-4 w-4" />
      </button>
    </div>
  );
}
