"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Pencil, Archive } from "lucide-react";
import { confirm } from "@/components/ui/confirm";
import { toast } from "@/components/ui/toast";

export function ProductRowActions({
  productId,
  productName,
  status,
}: {
  productId: number;
  productName: string;
  status: string;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const canArchive = status !== "archived";

  async function handleArchive() {
    if (!canArchive) return;
    const ok = await confirm({
      title: `Arsipkan produk "${productName}"?`,
      description: "Produk tidak akan tampil di etalase customer.",
      confirmText: "Arsipkan",
      variant: "danger",
    });
    if (!ok) return;
    setBusy(true);
    try {
      const res = await fetch(`/api/admin/products/${productId}/archive`, {
        method: "POST",
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        toast.error(data.error || "Gagal mengarsipkan produk");
        return;
      }
      toast.success("Produk berhasil diarsipkan");
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex items-center justify-end gap-1">
      <Link
        href={`/admin/products/${productId}/edit`}
        className="inline-flex items-center justify-center w-8 h-8 rounded-md text-neutral-500 hover:bg-neutral-100 hover:text-black transition-colors"
        title="Edit"
      >
        <Pencil className="h-4 w-4" />
      </Link>
      <button
        type="button"
        onClick={handleArchive}
        disabled={!canArchive || busy}
        className="inline-flex items-center justify-center w-8 h-8 rounded-md text-neutral-500 hover:bg-neutral-100 hover:text-red-600 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
        title={canArchive ? "Arsipkan" : "Sudah diarsipkan"}
      >
        <Archive className="h-4 w-4" />
      </button>
    </div>
  );
}
