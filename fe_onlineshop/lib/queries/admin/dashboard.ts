import { db } from "@/lib/db";
import { RowDataPacket } from "mysql2";

export interface DashboardStats {
  liveProducts: number;
  ordersToShip: number;
  activePromotions: number;
  ordersThisMonth: number;
  revenueThisMonth: number;
}

export async function getDashboardStats(): Promise<DashboardStats> {
  const [products] = await db.query<RowDataPacket[]>(
    `SELECT COUNT(*) AS n FROM products WHERE status = 'live'`
  );
  const [shipQueue] = await db.query<RowDataPacket[]>(
    `SELECT COUNT(*) AS n FROM orders
      WHERE order_status IN ('paid','processing','ready_to_ship')`
  );
  const [promos] = await db.query<RowDataPacket[]>(
    `SELECT COUNT(*) AS n FROM promotions WHERE status = 'active'`
  );
  const [monthOrders] = await db.query<RowDataPacket[]>(
    `SELECT COUNT(*) AS n, COALESCE(SUM(grand_total),0) AS rev
       FROM orders
      WHERE order_status NOT IN ('unpaid','cancelled','refunded')
        AND created_at >= DATE_FORMAT(NOW(),'%Y-%m-01')`
  );

  return {
    liveProducts: Number(products[0]?.n) || 0,
    ordersToShip: Number(shipQueue[0]?.n) || 0,
    activePromotions: Number(promos[0]?.n) || 0,
    ordersThisMonth: Number(monthOrders[0]?.n) || 0,
    revenueThisMonth: Number(monthOrders[0]?.rev) || 0,
  };
}

export interface RecentOrderRow extends RowDataPacket {
  id: number;
  order_number: string;
  user_name: string | null;
  grand_total: string;
  order_status: string;
  created_at: Date;
}

export async function getRecentOrders(limit = 5): Promise<RecentOrderRow[]> {
  const [rows] = await db.query<RecentOrderRow[]>(
    `SELECT o.id, o.order_number, o.grand_total, o.order_status, o.created_at,
            u.name AS user_name
       FROM orders o
       LEFT JOIN users u ON u.id = o.user_id
      ORDER BY o.created_at DESC
      LIMIT ?`,
    [limit]
  );
  return rows;
}
