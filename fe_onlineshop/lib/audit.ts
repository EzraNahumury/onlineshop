import { db } from "@/lib/db";

export interface AuditLogInput {
  adminId: number;
  action: string;
  entityType: string;
  entityId: number;
  oldValues?: unknown;
  newValues?: unknown;
  ipAddress?: string | null;
}

export async function writeAuditLog(input: AuditLogInput): Promise<void> {
  await db.query(
    `INSERT INTO audit_logs (admin_id, action, entity_type, entity_id, old_values, new_values, ip_address)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [
      input.adminId,
      input.action,
      input.entityType,
      input.entityId,
      input.oldValues ? JSON.stringify(input.oldValues) : null,
      input.newValues ? JSON.stringify(input.newValues) : null,
      input.ipAddress || null,
    ]
  );
}
