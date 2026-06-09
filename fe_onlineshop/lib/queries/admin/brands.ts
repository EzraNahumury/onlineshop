import { db } from "@/lib/db";
import { RowDataPacket } from "mysql2";

export interface BrandRow extends RowDataPacket {
  id: number;
  name: string;
  slug: string;
}

export async function getActiveBrands(): Promise<BrandRow[]> {
  const [rows] = await db.query<BrandRow[]>(
    `SELECT id, name, slug FROM brands WHERE is_active = 1 ORDER BY name ASC`
  );
  return rows;
}
