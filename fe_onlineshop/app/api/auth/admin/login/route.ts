import { NextRequest, NextResponse } from "next/server";
import { verifyPassword, signToken } from "@/lib/auth";
import { findAdminByEmail, touchAdminLogin } from "@/lib/queries/admins";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { email, password } = body;

  if (!email || !password) {
    return NextResponse.json(
      { error: "Email and password are required" },
      { status: 400 }
    );
  }

  const admin = await findAdminByEmail(email);
  if (!admin) {
    return NextResponse.json(
      { error: "Invalid email or password" },
      { status: 401 }
    );
  }

  if (!admin.is_active) {
    return NextResponse.json(
      { error: "Admin account is not active" },
      { status: 403 }
    );
  }

  const valid = await verifyPassword(password, admin.password_hash);
  if (!valid) {
    return NextResponse.json(
      { error: "Invalid email or password" },
      { status: 401 }
    );
  }

  await touchAdminLogin(admin.id);

  const token = signToken({
    userId: admin.id,
    email: admin.email,
    role: "admin",
  });

  const response = NextResponse.json({
    admin: {
      id: admin.id,
      name: admin.name,
      email: admin.email,
      role: admin.role_name,
    },
    token,
  });

  response.cookies.set("admin_token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7,
    path: "/",
  });

  return response;
}
