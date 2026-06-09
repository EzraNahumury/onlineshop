import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth";
import { db } from "@/lib/db";
import { RowDataPacket } from "mysql2";

export interface CurrentUser {
  id: number;
  name: string;
  email: string;
}

export async function getCurrentUser(): Promise<CurrentUser | null> {
  const token = (await cookies()).get("token")?.value;
  if (!token) return null;
  const payload = verifyToken(token);
  if (!payload) return null;

  const [rows] = await db.query<RowDataPacket[]>(
    "SELECT id, name, email, is_active FROM users WHERE id = ? LIMIT 1",
    [payload.userId]
  );
  if (rows.length === 0 || !rows[0].is_active) return null;
  return {
    id: rows[0].id,
    name: rows[0].name,
    email: rows[0].email,
  };
}
