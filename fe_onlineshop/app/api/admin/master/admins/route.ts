import { NextRequest, NextResponse } from "next/server";
import { getCurrentAdmin } from "@/lib/admin-auth";
import { hashPassword } from "@/lib/auth";
import { writeAuditLog } from "@/lib/audit";
import { adminEmailExists, roleExists, createAdmin } from "@/lib/queries/admins";

export async function POST(req: NextRequest) {
  const admin = await getCurrentAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const name = typeof body.name === "string" ? body.name.trim() : "";
  const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  const password = typeof body.password === "string" ? body.password : "";
  const roleId = Number(body.role_id);
  const isActive = body.is_active !== false;

  if (!name) return NextResponse.json({ error: "Nama wajib diisi" }, { status: 400 });
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: "Format email tidak valid" }, { status: 400 });
  }
  if (password.length < 6) {
    return NextResponse.json({ error: "Password minimal 6 karakter" }, { status: 400 });
  }
  if (!Number.isInteger(roleId) || !(await roleExists(roleId))) {
    return NextResponse.json({ error: "Role tidak valid" }, { status: 400 });
  }
  if (await adminEmailExists(email)) {
    return NextResponse.json({ error: "Email sudah dipakai admin lain" }, { status: 409 });
  }

  const passwordHash = await hashPassword(password);
  const id = await createAdmin({ name, email, passwordHash, roleId, isActive });

  await writeAuditLog({
    adminId: admin.id,
    action: "create_admin",
    entityType: "admin",
    entityId: id,
    newValues: { name, email, role_id: roleId, is_active: isActive },
    ipAddress: req.headers.get("x-forwarded-for"),
  });

  return NextResponse.json({ ok: true, id });
}
