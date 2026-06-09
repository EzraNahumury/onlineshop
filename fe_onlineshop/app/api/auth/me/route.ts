import { db } from "@/lib/db";
import { verifyToken } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";
import { RowDataPacket } from "mysql2";

export async function GET(req: NextRequest) {
  const token = req.cookies.get("token")?.value;

  if (!token) {
    return NextResponse.json({ user: null }, { status: 401 });
  }

  const payload = verifyToken(token);
  if (!payload) {
    return NextResponse.json({ user: null }, { status: 401 });
  }

  const [users] = await db.query<RowDataPacket[]>(
    "SELECT id, name, email, phone, is_active FROM users WHERE id = ? LIMIT 1",
    [payload.userId]
  );

  if (users.length === 0 || !users[0].is_active) {
    return NextResponse.json({ user: null }, { status: 401 });
  }

  return NextResponse.json({ user: users[0] });
}
