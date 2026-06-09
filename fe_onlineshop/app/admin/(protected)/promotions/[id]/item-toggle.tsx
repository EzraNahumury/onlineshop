"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function ItemActiveToggle({
  promotionId,
  itemId,
  kind,
  defaultActive,
}: {
  promotionId: number;
  itemId: number;
  kind: "store" | "combo_addon" | "package";
  defaultActive: boolean;
}) {
  const router = useRouter();
  const [active, setActive] = useState(defaultActive);
  const [busy, setBusy] = useState(false);

  async function handleToggle(next: boolean) {
    setActive(next);
    setBusy(true);
    try {
      const res = await fetch(
        `/api/admin/promotions/${promotionId}/items/${itemId}/toggle`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ kind, is_active: next }),
        }
      );
      if (!res.ok) {
        setActive(!next);
        return;
      }
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  return (
    <input
      type="checkbox"
      checked={active}
      onChange={(e) => handleToggle(e.target.checked)}
      disabled={busy}
      className="rounded border-neutral-300"
    />
  );
}
