import crypto from "crypto";

// Salt untuk meng-obfuscate ID order di URL (mis. /admin/orders/<sha256>).
// Harus sama dengan backfill SQL: SHA2(CONCAT('ayres_order_v1:', id), 256).
const ORDER_HASH_SALT = "ayres_order_v1";

// SHA-256 deterministik dari ID order -> string hex 64 karakter.
export function orderHash(id: number): string {
  return crypto
    .createHash("sha256")
    .update(`${ORDER_HASH_SALT}:${id}`)
    .digest("hex");
}

export function isOrderHash(value: string): boolean {
  return /^[a-f0-9]{64}$/.test(value);
}
