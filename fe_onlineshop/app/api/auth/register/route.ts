import { db } from "@/lib/db";
import { hashPassword, signToken } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";
import { ResultSetHeader, RowDataPacket } from "mysql2";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const name = typeof body.name === "string" ? body.name.trim() : "";
  const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  const phone = typeof body.phone === "string" ? body.phone.trim() : "";
  const password = typeof body.password === "string" ? body.password : "";

  if (!name || !email || !phone || !password) {
    return NextResponse.json(
      { error: "Nama, email, no. HP, dan password wajib diisi" },
      { status: 400 }
    );
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: "Format email tidak valid" }, { status: 400 });
  }
  const phoneClean = phone.replace(/\s|-/g, "");
  if (!/^(\+62|62|0)8\d{7,13}$/.test(phoneClean)) {
    return NextResponse.json(
      { error: "Format no. HP tidak valid (contoh: 08xxxxxxxxxx)" },
      { status: 400 }
    );
  }
  if (password.length < 6) {
    return NextResponse.json(
      { error: "Password minimal 6 karakter" },
      { status: 400 }
    );
  }

  // Reject duplicates up-front for a friendly message (UNIQUE keys also guard below).
  const [existing] = await db.query<RowDataPacket[]>(
    "SELECT id, email FROM users WHERE email = ? OR phone = ? LIMIT 1",
    [email, phoneClean]
  );
  if (existing.length > 0) {
    const sameEmail = existing[0].email === email;
    return NextResponse.json(
      { error: sameEmail ? "Email sudah terdaftar" : "No. HP sudah terdaftar" },
      { status: 409 }
    );
  }

  const passwordHash = await hashPassword(password);

  let userId: number;
  try {
    const [result] = await db.query<ResultSetHeader>(
      `INSERT INTO users (name, email, phone, password_hash, email_verified_at, last_login_at)
       VALUES (?, ?, ?, ?, NOW(), NOW())`,
      [name, email, phoneClean, passwordHash]
    );
    userId = result.insertId;
  } catch (err: unknown) {
    if ((err as { code?: string })?.code === "ER_DUP_ENTRY") {
      return NextResponse.json(
        { error: "Email atau no. HP sudah terdaftar" },
        { status: 409 }
      );
    }
    throw err;
  }

  const token = signToken({ userId, email, role: "customer" });

  const response = NextResponse.json({
    user: { id: userId, name, email },
  });

  response.cookies.set("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7,
    path: "/",
  });

  return response;
}
