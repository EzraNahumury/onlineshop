import { NextRequest, NextResponse } from "next/server";
import { getCurrentAdmin } from "@/lib/admin-auth";
import { hashPassword } from "@/lib/auth";
import { writeAuditLog } from "@/lib/audit";
import {
  adminEmailExists,
  roleExists,
  updateAdmin,
  updateAdminPassword,
  deleteAdmin,
  findAdminById,
  countActiveSuperAdmins,
} from "@/lib/queries/admins";

export async function PUT(
  req: NextRequest,
  ctx: { params: Promise<{ id: string }> }
) {
  const admin = await getCurrentAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await ctx.params;
  const adminId = Number(id);
  if (!Number.isInteger(adminId) || adminId <= 0) {
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  }

  const target = await findAdminById(adminId);
  if (!target) return NextResponse.json({ error: "Admin tidak ditemukan" }, { status: 404 });

  const body = await req.json().catch(() => ({}));
  const name = typeof body.name === "string" ? body.name.trim() : "";
  const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  const roleId = Number(body.role_id);
  const isActive = body.is_active !== false;
  const password = typeof body.password === "string" ? body.password : "";

  if (!name) return NextResponse.json({ error: "Nama wajib diisi" }, { status: 400 });
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: "Format email tidak valid" }, { status: 400 });
  }
  if (!Number.isInteger(roleId) || !(await roleExists(roleId))) {
    return NextResponse.json({ error: "Role tidak valid" }, { status: 400 });
  }
  if (await adminEmailExists(email, adminId)) {
    return NextResponse.json({ error: "Email sudah dipakai admin lain" }, { status: 409 });
  }
  if (password && password.length < 6) {
    return NextResponse.json({ error: "Password minimal 6 karakter" }, { status: 400 });
  }

  // Guard: don't let the last active super_admin be demoted/deactivated.
  const wasSuper = target.role_name === "super_admin" && target.is_active === 1;
  const willStaySuper = (await roleExists(roleId)) && isActive; // refined below
  if (wasSuper) {
    const stillSuperActive = roleId === target.role_id && isActive;
    if (!stillSuperActive && (await countActiveSuperAdmins()) <= 1) {
      return NextResponse.json(
        { error: "Tidak bisa menonaktifkan/mengubah role super admin terakhir." },
        { status: 409 }
      );
    }
  }
  void willStaySuper;

  await updateAdmin(adminId, { name, email, roleId, isActive });
  if (password) {
    await updateAdminPassword(adminId, await hashPassword(password));
  }

  await writeAuditLog({
    adminId: admin.id,
    action: "update_admin",
    entityType: "admin",
    entityId: adminId,
    oldValues: { name: target.name, email: target.email, role_id: target.role_id, is_active: target.is_active },
    newValues: { name, email, role_id: roleId, is_active: isActive, password_changed: !!password },
    ipAddress: req.headers.get("x-forwarded-for"),
  });

  return NextResponse.json({ ok: true });
}

export async function DELETE(
  req: NextRequest,
  ctx: { params: Promise<{ id: string }> }
) {
  const admin = await getCurrentAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await ctx.params;
  const adminId = Number(id);
  if (!Number.isInteger(adminId) || adminId <= 0) {
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  }
  if (adminId === admin.id) {
    return NextResponse.json({ error: "Tidak bisa menghapus akun sendiri." }, { status: 409 });
  }

  const target = await findAdminById(adminId);
  if (!target) return NextResponse.json({ error: "Admin tidak ditemukan" }, { status: 404 });

  if (target.role_name === "super_admin" && target.is_active === 1) {
    if ((await countActiveSuperAdmins()) <= 1) {
      return NextResponse.json(
        { error: "Tidak bisa menghapus super admin terakhir." },
        { status: 409 }
      );
    }
  }

  await deleteAdmin(adminId);

  await writeAuditLog({
    adminId: admin.id,
    action: "delete_admin",
    entityType: "admin",
    entityId: adminId,
    oldValues: { name: target.name, email: target.email },
    ipAddress: req.headers.get("x-forwarded-for"),
  });

  return NextResponse.json({ ok: true });
}
