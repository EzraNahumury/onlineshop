import { db } from "@/lib/db";
import { RowDataPacket } from "mysql2";

export type AdminOrderTab =
  | "all"
  | "unpaid"
  | "to_ship"
  | "shipped"
  | "completed"
  | "returned";

export interface AdminOrderRow extends RowDataPacket {
  id: number;
  order_number: string;
  grand_total: string;
  order_status: string;
  fulfillment_status: string;
  shipping_deadline_at: Date | null;
  created_at: Date;
  user_name: string | null;
  user_email: string | null;
  item_count: number;
}

export interface AdminOrderListResult {
  rows: AdminOrderRow[];
  total: number;
}

export interface AdminOrderFilters {
  tab?: AdminOrderTab;
  search?: string;
  page?: number;
  limit?: number;
}

function tabClause(tab: AdminOrderTab): string {
  switch (tab) {
    case "unpaid":
      return `o.order_status IN ('unpaid','pending_payment')`;
    case "to_ship":
      return `o.order_status IN ('paid','processing','ready_to_ship')`;
    case "shipped":
      return `o.order_status = 'shipped'`;
    case "completed":
      return `o.order_status = 'completed'`;
    case "returned":
      return `o.order_status IN ('cancelled','refunded')`;
    case "all":
    default:
      return `1 = 1`;
  }
}

export async function getAdminOrders(
  filters: AdminOrderFilters = {}
): Promise<AdminOrderListResult> {
  const tab = filters.tab || "all";
  const page = Math.max(1, filters.page || 1);
  const limit = Math.max(1, Math.min(100, filters.limit || 20));
  const offset = (page - 1) * limit;

  const params: unknown[] = [];
  let searchSql = "";
  if (filters.search && filters.search.trim()) {
    searchSql = ` AND (o.order_number LIKE ? OR u.name LIKE ? OR u.email LIKE ?)`;
    const term = `%${filters.search.trim()}%`;
    params.push(term, term, term);
  }

  const baseFrom = `
    FROM orders o
    LEFT JOIN users u ON u.id = o.user_id
    WHERE ${tabClause(tab)}${searchSql}
  `;

  const [countRows] = await db.query<RowDataPacket[]>(
    `SELECT COUNT(*) AS n ${baseFrom}`,
    params
  );
  const total = Number(countRows[0]?.n) || 0;

  const [rows] = await db.query<AdminOrderRow[]>(
    `SELECT o.id, o.order_number, o.grand_total, o.order_status, o.fulfillment_status,
            o.shipping_deadline_at, o.created_at,
            u.name AS user_name, u.email AS user_email,
            (SELECT COALESCE(SUM(quantity),0) FROM order_items oi WHERE oi.order_id = o.id) AS item_count
     ${baseFrom}
     ORDER BY o.created_at DESC
     LIMIT ? OFFSET ?`,
    [...params, limit, offset]
  );

  return { rows, total };
}

export async function getOrderTabCounts(): Promise<Record<AdminOrderTab, number>> {
  const [rows] = await db.query<RowDataPacket[]>(
    `SELECT
       COUNT(*) AS all_count,
       SUM(CASE WHEN order_status IN ('unpaid','pending_payment') THEN 1 ELSE 0 END) AS unpaid_count,
       SUM(CASE WHEN order_status IN ('paid','processing','ready_to_ship') THEN 1 ELSE 0 END) AS to_ship_count,
       SUM(CASE WHEN order_status = 'shipped' THEN 1 ELSE 0 END) AS shipped_count,
       SUM(CASE WHEN order_status = 'completed' THEN 1 ELSE 0 END) AS completed_count,
       SUM(CASE WHEN order_status IN ('cancelled','refunded') THEN 1 ELSE 0 END) AS returned_count
       FROM orders`
  );
  const r = rows[0] || {};
  return {
    all: Number(r.all_count) || 0,
    unpaid: Number(r.unpaid_count) || 0,
    to_ship: Number(r.to_ship_count) || 0,
    shipped: Number(r.shipped_count) || 0,
    completed: Number(r.completed_count) || 0,
    returned: Number(r.returned_count) || 0,
  };
}
