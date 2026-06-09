import { db } from "@/lib/db";
import { RowDataPacket } from "mysql2";

export interface CourierRow extends RowDataPacket {
  id: number;
  name: string;
  code: string;
  logo_url: string | null;
}

export async function getActiveCouriers(): Promise<CourierRow[]> {
  const [rows] = await db.query<CourierRow[]>(
    `SELECT id, name, code, logo_url FROM couriers WHERE is_active = 1 ORDER BY name ASC`
  );
  return rows;
}
