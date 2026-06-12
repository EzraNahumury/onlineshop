import type { DisplayPromoInput } from "@/lib/queries/admin/display-promos";

const DT_RE = /^\d{4}-\d{2}-\d{2}[ T]\d{2}:\d{2}(:\d{2})?$/;

function normalizeDateTime(s: string): string | null {
  if (!DT_RE.test(s)) return null;
  let v = s.replace("T", " ");
  if (v.length === 16) v += ":00"; // add seconds
  return v;
}

export function parseDisplayPromoBody(
  body: Record<string, unknown>
): { value: DisplayPromoInput } | { error: string } {
  const title = typeof body.title === "string" ? body.title.trim() : "";
  if (!title) return { error: "Judul wajib diisi" };
  if (title.length > 255) return { error: "Judul terlalu panjang" };

  const subtitle =
    typeof body.subtitle === "string" && body.subtitle.trim()
      ? body.subtitle.trim().slice(0, 255)
      : null;

  const discountType = body.discount_type;
  if (discountType !== "percentage" && discountType !== "fixed_amount") {
    return { error: "Jenis display tidak valid" };
  }

  const discountValue = Number(body.discount_value);
  if (!Number.isFinite(discountValue) || discountValue <= 0) {
    return { error: "Nominal harus lebih dari 0" };
  }
  if (discountType === "percentage" && discountValue > 100) {
    return { error: "Diskon persen maksimal 100%" };
  }

  let stock: number | null = null;
  if (body.stock !== null && body.stock !== undefined && body.stock !== "") {
    const s = Number(body.stock);
    if (!Number.isInteger(s) || s < 0) {
      return { error: "Stok harus angka bulat ≥ 0" };
    }
    stock = s;
  }

  const startAt = normalizeDateTime(String(body.start_at || ""));
  const endAt = normalizeDateTime(String(body.end_at || ""));
  if (!startAt) return { error: "Waktu mulai tidak valid" };
  if (!endAt) return { error: "Waktu selesai tidak valid" };
  if (endAt <= startAt) return { error: "Waktu selesai harus setelah waktu mulai" };

  const rawIds = Array.isArray(body.product_ids) ? body.product_ids : [];
  const productIds = rawIds
    .map((x) => Number(x))
    .filter((n) => Number.isInteger(n) && n > 0);
  if (productIds.length === 0) {
    return { error: "Pilih minimal satu produk untuk didisplay" };
  }

  return {
    value: {
      title,
      subtitle,
      discountType,
      discountValue,
      stock,
      startAt,
      endAt,
      isActive: body.is_active !== false,
      productIds,
    },
  };
}
