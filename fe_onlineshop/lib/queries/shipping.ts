import { db } from "@/lib/db";
import { RowDataPacket } from "mysql2";
import { getJneTariff, gramsToBillableKg, type JneTariffOption } from "@/lib/jne";
import { resolveJneDestinationForAddress } from "@/lib/queries/jne-destinations";
import { FREE_SHIPPING_THRESHOLD, FLAT_SHIPPING_FEE } from "@/lib/payment-config";

// TEMPORARY DEMO DEFAULT: the real warehouse origin is JOG20100 (Bantul,
// Kab. Bantul), but JNE's SANDBOX only has full REG/OKE/YES test data wired
// up for JOG10000 (Yogyakarta kota) — every other origin (incl. JOG20100)
// only returns one generic dummy tariff ("JTR<130") in sandbox. Using
// JOG10000 here so the multi-courier picker can be demoed end-to-end.
// TODO: switch back to JOG20100 once the JNE account is approved "Live"
// (production tariff data covers every origin properly, not just JOG10000).
export const JNE_ORIGIN_CODE = process.env.JNE_ORIGIN_CODE || "JOG10000";

export interface ShippingItemInput {
  productId: number;
  variantId: number | null;
  quantity: number;
}

// Sums weight_grams across the cart (variant weight wins when set, falls
// back to the product's own weight). Never trust client-sent weight.
export async function getCartWeightGrams(items: ShippingItemInput[]): Promise<number> {
  let totalGrams = 0;
  for (const it of items) {
    const qty = Math.max(0, Math.floor(Number(it.quantity)) || 0);
    if (qty === 0) continue;

    if (it.variantId != null) {
      const [rows] = await db.query<RowDataPacket[]>(
        `SELECT v.weight_grams AS variant_weight, p.weight_grams AS product_weight
           FROM product_variants v JOIN products p ON p.id = v.product_id
          WHERE v.id = ? AND v.product_id = ? LIMIT 1`,
        [it.variantId, it.productId]
      );
      const row = rows[0];
      const w = row ? Number(row.variant_weight) || Number(row.product_weight) || 0 : 0;
      totalGrams += w * qty;
    } else {
      const [rows] = await db.query<RowDataPacket[]>(
        `SELECT weight_grams FROM products WHERE id = ? LIMIT 1`,
        [it.productId]
      );
      totalGrams += (Number(rows[0]?.weight_grams) || 0) * qty;
    }
  }
  return totalGrams;
}

export type ShippingQuote =
  | { mode: "free"; amount: 0 }
  | { mode: "flat"; amount: number; reason: "no_destination_match" | "jne_unavailable" }
  | {
      mode: "jne";
      destinationLabel: string;
      weightKg: number;
      options: JneTariffOption[];
    };

// Central ongkir logic shared by the checkout preview endpoint and order
// creation, so the price the customer sees is exactly what gets charged.
export async function resolveShippingQuote(
  address: { city: string; district?: string | null },
  subtotal: number,
  weightGrams: number
): Promise<ShippingQuote> {
  if (subtotal >= FREE_SHIPPING_THRESHOLD) {
    return { mode: "free", amount: 0 };
  }

  const destination = await resolveJneDestinationForAddress(address);
  if (!destination) {
    return { mode: "flat", amount: FLAT_SHIPPING_FEE, reason: "no_destination_match" };
  }

  const weightKg = gramsToBillableKg(weightGrams);
  const options = await getJneTariff(JNE_ORIGIN_CODE, destination.jne_code, weightKg);
  if (!options || options.length === 0) {
    return { mode: "flat", amount: FLAT_SHIPPING_FEE, reason: "jne_unavailable" };
  }

  return {
    mode: "jne",
    destinationLabel: destination.label,
    weightKg,
    options,
  };
}

// Re-resolves the quote at order-creation time and picks the price for the
// service the customer selected — never trusts a client-sent price. Falls
// back to the flat fee if the chosen service isn't in the fresh quote
// (route changed, JNE hiccuped, or quote was "flat"/"free" all along).
export async function resolveShippingForOrder(
  address: { city: string; district?: string | null },
  subtotal: number,
  weightGrams: number,
  selectedServiceCode: string | null
): Promise<{
  amount: number;
  courier: string | null;
  serviceCode: string | null;
  serviceLabel: string | null;
  etd: string | null;
}> {
  const quote = await resolveShippingQuote(address, subtotal, weightGrams);

  if (quote.mode === "free") {
    return { amount: 0, courier: null, serviceCode: null, serviceLabel: null, etd: null };
  }
  if (quote.mode === "flat") {
    return {
      amount: quote.amount,
      courier: null,
      serviceCode: null,
      serviceLabel: "Ongkir Flat",
      etd: null,
    };
  }

  const chosen =
    quote.options.find((o) => o.serviceCode === selectedServiceCode) ?? quote.options[0];

  return {
    amount: chosen.price,
    courier: "JNE",
    serviceCode: chosen.serviceCode,
    serviceLabel: `JNE ${chosen.serviceDisplay}`,
    etd: chosen.etdFrom && chosen.etdThru ? `${chosen.etdFrom}-${chosen.etdThru} hari` : null,
  };
}
