import { db } from "@/lib/db";
import { RowDataPacket, ResultSetHeader } from "mysql2";

export interface AdminRow extends RowDataPacket {
  id: number;
  role_id: number;
  name: string;
  email: string;
  password_hash: string;
  is_active: number;
  role_name: string | null;
}

export interface AdminListRow extends RowDataPacket {
  id: number;
  role_id: number;
  name: string;
  email: string;
  is_active: number;
  role_name: string | null;
  last_login_at: Date | null;
  created_at: Date;
}

export interface AdminRoleRow extends RowDataPacket {
  id: number;
  name: string;
  description: string | null;
}

export async function findAdminByEmail(email: string): Promise<AdminRow | null> {
  const [rows] = await db.query<AdminRow[]>(
    `SELECT a.id, a.role_id, a.name, a.email, a.password_hash, a.is_active,
            r.name AS role_name
       FROM admins a
       LEFT JOIN admin_roles r ON r.id = a.role_id
      WHERE a.email = ?
      LIMIT 1`,
    [email]
  );
  return rows[0] || null;
}

export async function findAdminById(id: number): Promise<AdminRow | null> {
  const [rows] = await db.query<AdminRow[]>(
    `SELECT a.id, a.role_id, a.name, a.email, a.password_hash, a.is_active,
            r.name AS role_name
       FROM admins a
       LEFT JOIN admin_roles r ON r.id = a.role_id
      WHERE a.id = ?
      LIMIT 1`,
    [id]
  );
  return rows[0] || null;
}

export async function touchAdminLogin(id: number): Promise<void> {
  await db.query("UPDATE admins SET last_login_at = NOW() WHERE id = ?", [id]);
}

// ---------------------------------------------------------------------------
// Master > Role: admin account management
// ---------------------------------------------------------------------------

export async function listAdmins(): Promise<AdminListRow[]> {
  const [rows] = await db.query<AdminListRow[]>(
    `SELECT a.id, a.role_id, a.name, a.email, a.is_active,
            r.name AS role_name, a.last_login_at, a.created_at
       FROM admins a
       LEFT JOIN admin_roles r ON r.id = a.role_id
      ORDER BY a.id ASC`
  );
  return rows;
}

export async function listAdminRoles(): Promise<AdminRoleRow[]> {
  const [rows] = await db.query<AdminRoleRow[]>(
    `SELECT id, name, description FROM admin_roles ORDER BY id ASC`
  );
  return rows;
}

export async function adminEmailExists(
  email: string,
  exceptId?: number
): Promise<boolean> {
  const [rows] = await db.query<RowDataPacket[]>(
    `SELECT id FROM admins WHERE email = ?${exceptId ? " AND id <> ?" : ""} LIMIT 1`,
    exceptId ? [email, exceptId] : [email]
  );
  return rows.length > 0;
}

export async function roleExists(roleId: number): Promise<boolean> {
  const [rows] = await db.query<RowDataPacket[]>(
    `SELECT id FROM admin_roles WHERE id = ? LIMIT 1`,
    [roleId]
  );
  return rows.length > 0;
}

export async function createAdmin(input: {
  name: string;
  email: string;
  passwordHash: string;
  roleId: number;
  isActive: boolean;
}): Promise<number> {
  const [res] = await db.query<ResultSetHeader>(
    `INSERT INTO admins (role_id, name, email, password_hash, is_active)
     VALUES (?, ?, ?, ?, ?)`,
    [input.roleId, input.name, input.email, input.passwordHash, input.isActive ? 1 : 0]
  );
  return res.insertId;
}

export async function updateAdmin(
  id: number,
  input: { name: string; email: string; roleId: number; isActive: boolean }
): Promise<void> {
  await db.query<ResultSetHeader>(
    `UPDATE admins SET name = ?, email = ?, role_id = ?, is_active = ? WHERE id = ?`,
    [input.name, input.email, input.roleId, input.isActive ? 1 : 0, id]
  );
}

export async function updateAdminPassword(
  id: number,
  passwordHash: string
): Promise<void> {
  await db.query<ResultSetHeader>(
    `UPDATE admins SET password_hash = ? WHERE id = ?`,
    [passwordHash, id]
  );
}

export async function deleteAdmin(id: number): Promise<void> {
  await db.query<ResultSetHeader>(`DELETE FROM admins WHERE id = ?`, [id]);
}

export async function countActiveSuperAdmins(): Promise<number> {
  const [rows] = await db.query<RowDataPacket[]>(
    `SELECT COUNT(*) AS n FROM admins a JOIN admin_roles r ON r.id = a.role_id
      WHERE r.name = 'super_admin' AND a.is_active = 1`
  );
  return Number(rows[0]?.n) || 0;
}
