import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/user-auth";
import { verifyPassword, hashPassword } from "@/lib/auth";
import { db } from "@/lib/db";
import { RowDataPacket, ResultSetHeader } from "mysql2";

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const currentPassword = String(body.currentPassword || "");
  const newPassword = String(body.newPassword || "");

  if (!currentPassword || !newPassword) {
    return NextResponse.json(
      { error: "Kata sandi saat ini dan baru wajib diisi" },
      { status: 400 }
    );
  }
  if (newPassword.length < 8) {
    return NextResponse.json(
      { error: "Kata sandi baru minimal 8 karakter" },
      { status: 400 }
    );
  }
  if (currentPassword === newPassword) {
    return NextResponse.json(
      { error: "Kata sandi baru tidak boleh sama dengan yang lama" },
      { status: 400 }
    );
  }

  const [rows] = await db.query<RowDataPacket[]>(
    "SELECT password_hash FROM users WHERE id = ? LIMIT 1",
    [user.id]
  );
  if (rows.length === 0) {
    return NextResponse.json({ error: "User tidak ditemukan" }, { status: 404 });
  }

  const ok = await verifyPassword(currentPassword, rows[0].password_hash);
  if (!ok) {
    return NextResponse.json(
      { error: "Kata sandi saat ini salah" },
      { status: 401 }
    );
  }

  const newHash = await hashPassword(newPassword);
  await db.query<ResultSetHeader>(
    "UPDATE users SET password_hash = ? WHERE id = ?",
    [newHash, user.id]
  );

  return NextResponse.json({ ok: true });
}
