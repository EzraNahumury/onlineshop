import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/user-auth";
import { db } from "@/lib/db";
import { ResultSetHeader, RowDataPacket } from "mysql2";

export async function PATCH(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const name = body.name ? String(body.name).trim() : null;
  const phone = body.phone !== undefined ? String(body.phone).trim() : undefined;

  if (name !== null && (name.length < 2 || name.length > 100)) {
    return NextResponse.json(
      { error: "Nama harus 2-100 karakter" },
      { status: 400 }
    );
  }

  if (phone !== undefined && phone.length > 0) {
    if (!/^[0-9+\-\s]{8,20}$/.test(phone)) {
      return NextResponse.json(
        { error: "Format nomor telepon tidak valid" },
        { status: 400 }
      );
    }
    // Check phone uniqueness
    const [dup] = await db.query<RowDataPacket[]>(
      `SELECT id FROM users WHERE phone = ? AND id <> ? LIMIT 1`,
      [phone, user.id]
    );
    if (dup.length > 0) {
      return NextResponse.json(
        { error: "Nomor telepon sudah digunakan" },
        { status: 409 }
      );
    }
  }

  const fields: string[] = [];
  const params: unknown[] = [];
  if (name !== null) {
    fields.push("name = ?");
    params.push(name);
  }
  if (phone !== undefined) {
    fields.push("phone = ?");
    params.push(phone || null);
  }
  if (fields.length === 0) {
    return NextResponse.json({ ok: true, updated: false });
  }
  params.push(user.id);
  await db.query<ResultSetHeader>(
    `UPDATE users SET ${fields.join(", ")} WHERE id = ?`,
    params
  );
  return NextResponse.json({ ok: true, updated: true });
}

export async function DELETE() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Soft delete: keep orders and history intact via FK, disable login.
  await db.query<ResultSetHeader>(
    `UPDATE users SET is_active = 0 WHERE id = ?`,
    [user.id]
  );

  const res = NextResponse.json({ ok: true });
  res.cookies.set("token", "", {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
  return res;
}
