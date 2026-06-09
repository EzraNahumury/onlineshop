import { db } from "@/lib/db";
import { verifyPassword, signToken } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";
import { RowDataPacket } from "mysql2";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { email, password } = body;

  if (!email || !password) {
    return NextResponse.json(
      { error: "Email and password are required" },
      { status: 400 }
    );
  }

  const [users] = await db.query<RowDataPacket[]>(
    "SELECT id, name, email, password_hash, is_active FROM users WHERE email = ? LIMIT 1",
    [email]
  );

  if (users.length === 0) {
    return NextResponse.json(
      { error: "Invalid email or password" },
      { status: 401 }
    );
  }

  const user = users[0];

  if (!user.is_active) {
    return NextResponse.json(
      { error: "Account is not active" },
      { status: 403 }
    );
  }

  const valid = await verifyPassword(password, user.password_hash);
  if (!valid) {
    return NextResponse.json(
      { error: "Invalid email or password" },
      { status: 401 }
    );
  }

  // Update last login
  await db.query("UPDATE users SET last_login_at = NOW() WHERE id = ?", [user.id]);

  const token = signToken({
    userId: user.id,
    email: user.email,
    role: "customer",
  });

  const response = NextResponse.json({
    user: { id: user.id, name: user.name, email: user.email },
    token,
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
