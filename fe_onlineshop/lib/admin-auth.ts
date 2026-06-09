import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { verifyToken } from "@/lib/auth";
import { findAdminById, type AdminRow } from "@/lib/queries/admins";

export async function getCurrentAdmin(): Promise<AdminRow | null> {
  const store = await cookies();
  const token = store.get("admin_token")?.value;
  if (!token) return null;

  const payload = verifyToken(token);
  if (!payload || payload.role !== "admin") return null;

  const admin = await findAdminById(payload.userId);
  if (!admin || !admin.is_active) return null;

  return admin;
}

export async function requireAdmin(): Promise<AdminRow> {
  const admin = await getCurrentAdmin();
  if (!admin) redirect("/admin/login");
  return admin;
}
