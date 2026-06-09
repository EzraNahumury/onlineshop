import { db } from "@/lib/db";
import { RowDataPacket, ResultSetHeader } from "mysql2";

export type AddressLabel = "rumah" | "kantor" | "lainnya";

export interface UserAddress extends RowDataPacket {
  id: number;
  user_id: number;
  receiver_name: string;
  phone: string;
  province: string;
  city: string;
  district: string;
  village: string | null;
  postal_code: string;
  address_line: string;
  address_detail: string | null;
  label: AddressLabel;
  is_default: number;
}

export interface AddressInput {
  receiver_name: string;
  phone: string;
  province: string;
  city: string;
  district: string;
  village?: string | null;
  postal_code: string;
  address_line: string;
  address_detail?: string | null;
  label: AddressLabel;
  is_default: boolean;
}

export async function listUserAddresses(userId: number): Promise<UserAddress[]> {
  const [rows] = await db.query<UserAddress[]>(
    `SELECT * FROM user_addresses WHERE user_id = ? ORDER BY is_default DESC, id DESC`,
    [userId]
  );
  return rows;
}

export async function getUserAddress(
  userId: number,
  id: number
): Promise<UserAddress | null> {
  const [rows] = await db.query<UserAddress[]>(
    `SELECT * FROM user_addresses WHERE user_id = ? AND id = ? LIMIT 1`,
    [userId, id]
  );
  return rows[0] ?? null;
}

async function clearDefault(userId: number, exceptId?: number) {
  if (exceptId) {
    await db.query(
      `UPDATE user_addresses SET is_default = 0 WHERE user_id = ? AND id <> ?`,
      [userId, exceptId]
    );
  } else {
    await db.query(
      `UPDATE user_addresses SET is_default = 0 WHERE user_id = ?`,
      [userId]
    );
  }
}

export async function createAddress(
  userId: number,
  input: AddressInput
): Promise<number> {
  // If user has no addresses yet, force first address as default.
  const [countRows] = await db.query<RowDataPacket[]>(
    `SELECT COUNT(*) AS n FROM user_addresses WHERE user_id = ?`,
    [userId]
  );
  const forceDefault = countRows[0].n === 0;
  const isDefault = forceDefault || input.is_default ? 1 : 0;

  if (isDefault) await clearDefault(userId);

  const [result] = await db.query<ResultSetHeader>(
    `INSERT INTO user_addresses
       (user_id, receiver_name, phone, province, city, district, village, postal_code,
        address_line, address_detail, label, is_default)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      userId,
      input.receiver_name,
      input.phone,
      input.province,
      input.city,
      input.district,
      input.village ?? null,
      input.postal_code,
      input.address_line,
      input.address_detail ?? null,
      input.label,
      isDefault,
    ]
  );
  return result.insertId;
}

export async function updateAddress(
  userId: number,
  id: number,
  input: AddressInput
): Promise<boolean> {
  const existing = await getUserAddress(userId, id);
  if (!existing) return false;

  const isDefault = input.is_default ? 1 : 0;
  if (isDefault) await clearDefault(userId, id);

  const [result] = await db.query<ResultSetHeader>(
    `UPDATE user_addresses
       SET receiver_name = ?, phone = ?, province = ?, city = ?, district = ?,
           village = ?, postal_code = ?, address_line = ?, address_detail = ?,
           label = ?, is_default = ?
     WHERE user_id = ? AND id = ?`,
    [
      input.receiver_name,
      input.phone,
      input.province,
      input.city,
      input.district,
      input.village ?? null,
      input.postal_code,
      input.address_line,
      input.address_detail ?? null,
      input.label,
      isDefault,
      userId,
      id,
    ]
  );
  return result.affectedRows > 0;
}

export async function deleteAddress(
  userId: number,
  id: number
): Promise<boolean> {
  const existing = await getUserAddress(userId, id);
  if (!existing) return false;

  const [result] = await db.query<ResultSetHeader>(
    `DELETE FROM user_addresses WHERE user_id = ? AND id = ?`,
    [userId, id]
  );

  // If we deleted the default, promote another to default.
  if (existing.is_default === 1) {
    await db.query(
      `UPDATE user_addresses SET is_default = 1
         WHERE user_id = ? AND id = (SELECT id FROM (
           SELECT id FROM user_addresses WHERE user_id = ? ORDER BY id DESC LIMIT 1
         ) t)`,
      [userId, userId]
    );
  }
  return result.affectedRows > 0;
}
