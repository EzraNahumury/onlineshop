// JNE "API TARIFF" client — calculates ongkir based on origin/destination
// code + weight. Sandbox by default (JNE's own published test credentials);
// once the account is approved "Live", set JNE_API_BASE_URL/JNE_USERNAME/
// JNE_API_KEY/JNE_ORIGIN_CODE in the environment to switch over.
const JNE_API_BASE_URL =
  process.env.JNE_API_BASE_URL || "https://apiv2.jne.co.id:10202/tracing/api/pricedev";
const JNE_USERNAME = process.env.JNE_USERNAME || "TESTAPI";
const JNE_API_KEY = process.env.JNE_API_KEY || "25c898a9faea1a100859ecd9ef674548";

// "API TRACE TRACKING" — read-only status lookup by AWB/cnote number.
const JNE_TRACKING_BASE_URL =
  process.env.JNE_TRACKING_BASE_URL ||
  "https://apiv2.jne.co.id:10202/tracing/api/list/v1/cnote";

// "API PICKUP OR CASHLESS" — creates a real JNE shipment (AWB) and can
// request a courier pickup. Needs JNE-assigned identifiers that are NOT the
// same as the tariff/tracking username+api_key — these come from JNE
// directly. JNE told us (for the AYRES account) that the cust_id DIFFERS per
// service family:
//   REG & YES  -> 12089600   (JNE_CUST_ID_REG)
//   JTR        -> 12089601   (JNE_CUST_ID_JTR)
//   COD        -> 12089602   (default REG; not used yet — COD is off)
// They're account-specific so they live in env (not committed to git).
const JNE_PICKUP_BASE_URL =
  process.env.JNE_PICKUP_BASE_URL || "https://apiv2.jne.co.id:10202/pickupcashless";
const JNE_CUST_ID_REG = process.env.JNE_CUST_ID_REG || "";
const JNE_CUST_ID_JTR = process.env.JNE_CUST_ID_JTR || "";
// MERCHANT_ID is seller-defined — JNE explicitly said "ID merchant
// dikembalikan ke seller sendiri" — so a stable self-chosen value is fine.
const JNE_MERCHANT_ID = process.env.JNE_MERCHANT_ID || "AYRES";
// Sandbox-documented test value ("for testing u can fill with CGK000").
// If a live pickup is rejected with a branch error, set the real branch
// code of the seller's nearest JNE counter here.
const JNE_BRANCH_CODE = process.env.JNE_BRANCH_CODE || "CGK000";

// Picks the cust_id matching the chosen service: the JTR family bills to the
// JTR account, everything else (REG/REG15/REG23/YES/OKE) to the reguler one.
export function resolveJneCustId(serviceCode: string): string {
  return serviceCode.trim().toUpperCase().startsWith("JTR")
    ? JNE_CUST_ID_JTR
    : JNE_CUST_ID_REG;
}

// The button is shown when the primary (reguler) account is configured;
// per-service gaps are caught with a precise error at submit time.
export function isJnePickupConfigured(): boolean {
  return Boolean(JNE_CUST_ID_REG && JNE_MERCHANT_ID);
}

export interface JneTariffOption {
  serviceCode: string;
  serviceDisplay: string;
  goodsType: string;
  price: number;
  etdFrom: string;
  etdThru: string;
}

// Calls JNE's tariff endpoint and returns every service it quotes for the
// route (REG/OKE/YES/...), cheapest first. Returns null on ANY failure
// (network, bad credentials, unknown area, malformed response) so callers
// can fall back to the flat shipping fee — ongkir must never block checkout
// just because the courier API is unreachable or the route isn't mapped yet.
export async function getJneTariff(
  originCode: string,
  destinationCode: string,
  weightKg: number
): Promise<JneTariffOption[] | null> {
  if (!originCode || !destinationCode || !(weightKg > 0)) return null;

  try {
    const body = new URLSearchParams({
      username: JNE_USERNAME,
      api_key: JNE_API_KEY,
      from: originCode,
      thru: destinationCode,
      weight: String(weightKg),
    });

    const res = await fetch(JNE_API_BASE_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Accept: "application/json",
        "User-Agent": "AyresShop/1.0 (+https://shop.ayreslab.id)",
      },
      body,
      cache: "no-store",
      signal: AbortSignal.timeout(8000),
    });

    const data = await res.json().catch(() => null);
    if (!data || !Array.isArray(data.price)) return null;

    const options = (data.price as Record<string, unknown>[])
      .map((p): JneTariffOption => ({
        serviceCode: String(p.service_code ?? "").trim(),
        serviceDisplay: String(p.service_display ?? p.service_code ?? "").trim(),
        goodsType: String(p.goods_type ?? "").trim(),
        price: Number(p.price) || 0,
        etdFrom: String(p.etd_from ?? "").trim(),
        etdThru: String(p.etd_thru ?? "").trim(),
      }))
      .filter((o) => o.serviceCode && o.price > 0)
      .sort((a, b) => a.price - b.price);

    return options.length > 0 ? options : null;
  } catch (err) {
    console.error("[jne] tariff request failed:", err);
    return null;
  }
}

// JNE bills per whole kilogram, rounded up, minimum 1kg.
export function gramsToBillableKg(grams: number): number {
  return Math.max(1, Math.ceil(grams / 1000));
}

export interface JneTrackingHistoryItem {
  date: string;
  desc: string;
  code: string;
}

export interface JneTrackingResult {
  cnoteNo: string;
  podStatus: string;
  lastStatus: string;
  receiverName: string | null;
  podDate: string | null;
  estimateDelivery: string | null;
  history: JneTrackingHistoryItem[];
}

// Looks up live delivery status + history for an AWB ("cnote"). Returns
// null on any failure (not found, bad credentials, network) — tracking is
// a convenience display, it must never break the order page.
export async function trackJneShipment(awb: string): Promise<JneTrackingResult | null> {
  const trimmed = awb.trim();
  if (!trimmed) return null;

  try {
    const url = `${JNE_TRACKING_BASE_URL}/${encodeURIComponent(trimmed)}`;
    const body = new URLSearchParams({ username: JNE_USERNAME, api_key: JNE_API_KEY });

    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Accept: "application/json",
        "User-Agent": "AyresShop/1.0 (+https://shop.ayreslab.id)",
      },
      body,
      cache: "no-store",
      signal: AbortSignal.timeout(8000),
    });

    const data = await res.json().catch(() => null);
    if (!data || !data.cnote || data.status === false) return null;

    const cnote = data.cnote as Record<string, unknown>;
    const history = Array.isArray(data.history)
      ? (data.history as Record<string, unknown>[]).map((h) => ({
          date: String(h.date ?? ""),
          desc: String(h.desc ?? ""),
          code: String(h.code ?? ""),
        }))
      : [];

    return {
      cnoteNo: String(cnote.cnote_no ?? trimmed),
      podStatus: String(cnote.pod_status ?? ""),
      lastStatus: String(cnote.last_status ?? ""),
      receiverName: cnote.cnote_receiver_name ? String(cnote.cnote_receiver_name) : null,
      podDate: cnote.cnote_pod_date ? String(cnote.cnote_pod_date) : null,
      estimateDelivery: cnote.estimate_delivery ? String(cnote.estimate_delivery) : null,
      history,
    };
  } catch (err) {
    console.error("[jne] tracking request failed:", err);
    return null;
  }
}

export interface JnePickupAddress {
  name: string;
  addr1: string;
  addr2?: string;
  city: string;
  zip: string;
  region: string;
  contact: string;
  phone: string;
}

export interface JnePickupInput {
  orderId: string; // unique per submission — JNE rejects re-use
  pickupDate: string; // DD-MM-YYYY
  pickupTime: string; // HH:MM (24h)
  pickupDistrict: string;
  pickupCity: string;
  pickupVehicle: "Motor" | "Mobil" | "Truck";
  type: "PICKUP" | "DROP";
  shipper: JnePickupAddress;
  receiver: JnePickupAddress;
  originCode: string;
  destinationCode: string;
  serviceCode: string;
  weightKg: number;
  qty: number;
  goodsDesc: string;
  goodsAmount: number;
}

export interface JnePickupResult {
  cnoteNo: string;
}

export class JnePickupError extends Error {}

// "API PICKUP OR CASHLESS" — creates a real JNE shipment (AWB/cnote) and,
// when type is "PICKUP", schedules a courier pickup. Throws JnePickupError
// with JNE's own message on failure (unlike the tariff/tracking helpers,
// callers here need to know exactly why so the admin can fix it and retry).
export async function createJnePickup(input: JnePickupInput): Promise<JnePickupResult> {
  const custId = resolveJneCustId(input.serviceCode);
  if (!custId || !JNE_MERCHANT_ID) {
    const which = input.serviceCode.trim().toUpperCase().startsWith("JTR")
      ? "JNE_CUST_ID_JTR"
      : "JNE_CUST_ID_REG";
    throw new JnePickupError(
      `${which} / JNE_MERCHANT_ID belum diisi di server untuk layanan ${input.serviceCode}. Set dulu di environment.`
    );
  }

  // JNE rejects the whole request ("Please do not let parameters empty") if
  // ANY mandatory field is blank — and it treats a lone space as blank too.
  // So every mandatory text field gets a non-empty fallback of "-".
  const f = (v: string | undefined | null): string => {
    const t = (v ?? "").trim();
    return t.length > 0 ? t : "-";
  };

  const body = new URLSearchParams({
    username: JNE_USERNAME,
    api_key: JNE_API_KEY,
    PICKUP_NAME: f(input.shipper.name),
    PICKUP_DATE: input.pickupDate,
    PICKUP_TIME: input.pickupTime,
    PICKUP_PIC: f(input.shipper.contact),
    PICKUP_PIC_PHONE: f(input.shipper.phone),
    PICKUP_ADDRESS: f(input.shipper.addr1),
    PICKUP_DISTRICT: f(input.pickupDistrict),
    PICKUP_CITY: f(input.pickupCity),
    PICKUP_SERVICE: "Domestic",
    PICKUP_VEHICLE: input.pickupVehicle,
    BRANCH: f(JNE_BRANCH_CODE),
    CUST_ID: custId,
    ORDER_ID: input.orderId,
    SHIPPER_NAME: f(input.shipper.name),
    SHIPPER_ADDR1: f(input.shipper.addr1),
    SHIPPER_ADDR2: f(input.shipper.addr2),
    SHIPPER_ADDR3: "-",
    SHIPPER_CITY: f(input.shipper.city),
    SHIPPER_ZIP: f(input.shipper.zip),
    SHIPPER_REGION: f(input.shipper.region),
    SHIPPER_COUNTRY: "INDONESIA",
    SHIPPER_CONTACT: f(input.shipper.contact),
    SHIPPER_PHONE: f(input.shipper.phone),
    RECEIVER_NAME: f(input.receiver.name),
    RECEIVER_ADDR1: f(input.receiver.addr1),
    RECEIVER_ADDR2: f(input.receiver.addr2),
    RECEIVER_ADDR3: "-",
    RECEIVER_CITY: f(input.receiver.city),
    RECEIVER_ZIP: f(input.receiver.zip),
    RECEIVER_REGION: f(input.receiver.region),
    RECEIVER_COUNTRY: "INDONESIA",
    RECEIVER_CONTACT: f(input.receiver.contact),
    RECEIVER_PHONE: f(input.receiver.phone),
    ORIGIN_CODE: input.originCode,
    DESTINATION_CODE: input.destinationCode,
    SERVICE_CODE: input.serviceCode,
    WEIGHT: String(input.weightKg),
    QTY: String(input.qty),
    GOODS_DESC: f(input.goodsDesc),
    GOODS_AMOUNT: String(Math.round(input.goodsAmount)),
    INSURANCE_FLAG: "N",
    SPECIAL_INS: "-",
    MERCHANT_ID: JNE_MERCHANT_ID,
    TYPE: input.type,
    COD_FLAG: "NO",
  });

  let data: Record<string, unknown> | null;
  try {
    const res = await fetch(JNE_PICKUP_BASE_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Accept: "application/json",
        "User-Agent": "AyresShop/1.0 (+https://shop.ayreslab.id)",
      },
      body,
      cache: "no-store",
      signal: AbortSignal.timeout(10000),
    });
    data = await res.json().catch(() => null);
  } catch (err) {
    console.error("[jne] pickup request failed:", err);
    throw new JnePickupError("Tidak bisa menghubungi server JNE. Coba lagi.");
  }

  const detail = Array.isArray(data?.detail) ? (data!.detail as Record<string, unknown>[]) : [];
  const first = detail[0];

  if (first && String(first.status) === "success" && first.cnote_no) {
    return { cnoteNo: String(first.cnote_no) };
  }

  const reason =
    (first && String(first.reason || "")) ||
    (data && String(data.error || "")) ||
    "Gagal membuat resi JNE.";
  throw new JnePickupError(reason);
}
