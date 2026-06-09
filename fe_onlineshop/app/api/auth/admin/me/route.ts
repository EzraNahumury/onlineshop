import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";
import { findAdminById } from "@/lib/queries/admins";

export async function GET(req: NextRequest) {
  const token = req.cookies.get("admin_token")?.value;

  if (!token) {
    return NextResponse.json({ admin: null }, { status: 401 });
  }

  const payload = verifyToken(token);
  if (!payload || payload.role !== "admin") {
    return NextResponse.json({ admin: null }, { status: 401 });
  }

  const admin = await findAdminById(payload.userId);
  if (!admin || !admin.is_active) {
    return NextResponse.json({ admin: null }, { status: 401 });
  }

  return NextResponse.json({
    admin: {
      id: admin.id,
      name: admin.name,
      email: admin.email,
      role: admin.role_name,
    },
  });
}
