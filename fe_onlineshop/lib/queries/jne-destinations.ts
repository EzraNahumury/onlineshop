import { db } from "@/lib/db";
import { RowDataPacket, ResultSetHeader } from "mysql2";

export interface JneDestinationRow extends RowDataPacket {
  id: number;
  jne_code: string;
  label: string;
  province: string | null;
  city: string;
  district: string | null;
  is_active: number;
  created_at: Date;
  updated_at: Date;
}

export async function listJneDestinations(search?: string): Promise<JneDestinationRow[]> {
  if (search && search.trim()) {
    const term = `%${search.trim()}%`;
    const [rows] = await db.query<JneDestinationRow[]>(
      `SELECT * FROM jne_destinations
        WHERE city LIKE ? OR district LIKE ? OR label LIKE ? OR jne_code LIKE ?
        ORDER BY city ASC, district ASC LIMIT 300`,
      [term, term, term, term]
    );
    return rows;
  }
  const [rows] = await db.query<JneDestinationRow[]>(
    `SELECT * FROM jne_destinations ORDER BY city ASC, district ASC LIMIT 300`
  );
  return rows;
}

export async function getJneDestinationById(id: number): Promise<JneDestinationRow | null> {
  const [rows] = await db.query<JneDestinationRow[]>(
    `SELECT * FROM jne_destinations WHERE id = ? LIMIT 1`,
    [id]
  );
  return rows[0] || null;
}

export interface JneDestinationInput {
  jneCode: string;
  label: string;
  province?: string | null;
  city: string;
  district?: string | null;
  isActive: boolean;
}

// Addresses use the official emsifa wilayah names (lib/location-api.ts),
// which always prefix the regency with "KOTA "/"KABUPATEN " (e.g. "KOTA
// AMBON"). JNE's own reference list (imported via supportfile-jne/convert.py)
// drops that prefix ("AMBON") — so the prefix has to be stripped before
// matching, and rows are stored normalized so manual admin entries line up
// with the auto-imported ones.
function stripCityPrefix(city: string): string {
  return city
    .trim()
    .toUpperCase()
    .replace(/^(KABUPATEN\.?\s*|KAB\.?\s*|KOTA\.?\s*)+/, "")
    .trim();
}

function normalizeDistrict(district: string | null | undefined): string | null {
  const d = district?.trim().toUpperCase();
  return d || null;
}

// One tariff code legitimately covers many city/district combos, so the
// natural key is (city, district) — not jne_code. Used to block accidental
// duplicate mappings when adding/editing destinations by hand.
export async function isDestinationDuplicate(
  city: string,
  district: string | null,
  exceptId?: number
): Promise<boolean> {
  const cityNorm = stripCityPrefix(city);
  const districtNorm = normalizeDistrict(district);
  const [rows] = await db.query<RowDataPacket[]>(
    `SELECT id FROM jne_destinations
      WHERE city = ? AND district ${districtNorm ? "= ?" : "IS NULL"}
        ${exceptId ? "AND id <> ?" : ""}
      LIMIT 1`,
    districtNorm
      ? exceptId
        ? [cityNorm, districtNorm, exceptId]
        : [cityNorm, districtNorm]
      : exceptId
      ? [cityNorm, exceptId]
      : [cityNorm]
  );
  return rows.length > 0;
}

export async function createJneDestination(input: JneDestinationInput): Promise<number> {
  const [res] = await db.query<ResultSetHeader>(
    `INSERT INTO jne_destinations (jne_code, label, province, city, district, is_active)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [
      input.jneCode.trim(),
      input.label.trim(),
      input.province?.trim() || null,
      stripCityPrefix(input.city),
      normalizeDistrict(input.district),
      input.isActive ? 1 : 0,
    ]
  );
  return res.insertId;
}

export async function updateJneDestination(id: number, input: JneDestinationInput): Promise<void> {
  await db.query<ResultSetHeader>(
    `UPDATE jne_destinations
        SET jne_code = ?, label = ?, province = ?, city = ?, district = ?, is_active = ?
      WHERE id = ?`,
    [
      input.jneCode.trim(),
      input.label.trim(),
      input.province?.trim() || null,
      stripCityPrefix(input.city),
      normalizeDistrict(input.district),
      input.isActive ? 1 : 0,
      id,
    ]
  );
}

export async function deleteJneDestination(id: number): Promise<void> {
  await db.query(`DELETE FROM jne_destinations WHERE id = ?`, [id]);
}

// Match a customer address to a JNE destination code. Tries the most
// specific match first (city + district); only accepts it if unambiguous,
// then falls back to city-only (again, only if unambiguous). Returns null
// when no safe match exists, so the caller falls back to the flat shipping
// fee instead of guessing a destination.
export async function resolveJneDestinationForAddress(address: {
  city: string;
  district?: string | null;
}): Promise<JneDestinationRow | null> {
  const city = stripCityPrefix(address.city || "");
  if (!city) return null;

  const district = address.district?.trim().toUpperCase();
  if (district) {
    const [exact] = await db.query<JneDestinationRow[]>(
      `SELECT * FROM jne_destinations WHERE is_active = 1 AND city = ? AND district = ? LIMIT 2`,
      [city, district]
    );
    if (exact.length === 1) return exact[0];
  }

  const [byCity] = await db.query<JneDestinationRow[]>(
    `SELECT * FROM jne_destinations WHERE is_active = 1 AND city = ? LIMIT 2`,
    [city]
  );
  if (byCity.length === 1) return byCity[0];

  return null;
}
