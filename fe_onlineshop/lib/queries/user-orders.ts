import { db } from "@/lib/db";
import { RowDataPacket } from "mysql2";

export type OrderStatus =
  | "unpaid"
  | "pending_payment"
  | "paid"
  | "processing"
  | "ready_to_ship"
  | "shipped"
  | "completed"
  | "cancelled"
  | "refunded";

export const PENDING_STATUSES: OrderStatus[] = [
  "unpaid",
  "pending_payment",
  "paid",
  "processing",
  "ready_to_ship",
  "shipped",
];

export const HISTORY_STATUSES: OrderStatus[] = [
  "completed",
  "cancelled",
  "refunded",
];

export interface UserOrderRow extends RowDataPacket {
  id: number;
  order_number: string;
  grand_total: string;
  order_status: OrderStatus;
  fulfillment_status: string;
  created_at: Date;
  completed_at: Date | null;
  cancelled_at: Date | null;
  item_count: number;
  first_item_name: string | null;
  first_item_image: string | null;
  courier_name: string | null;
  tracking_number: string | null;
}

export async function listUserOrders(
  userId: number,
  statuses: OrderStatus[]
): Promise<UserOrderRow[]> {
  if (statuses.length === 0) return [];
  const placeholders = statuses.map(() => "?").join(", ");
  const [rows] = await db.query<UserOrderRow[]>(
    `SELECT
       o.id, o.order_number, o.grand_total, o.order_status, o.fulfillment_status,
       o.created_at, o.completed_at, o.cancelled_at,
       (SELECT COUNT(*) FROM order_items WHERE order_id = o.id) AS item_count,
       (SELECT product_name FROM order_items WHERE order_id = o.id ORDER BY id ASC LIMIT 1) AS first_item_name,
       (SELECT image_url FROM order_items WHERE order_id = o.id ORDER BY id ASC LIMIT 1) AS first_item_image,
       (SELECT c.name FROM shipments s LEFT JOIN couriers c ON c.id = s.courier_id
         WHERE s.order_id = o.id ORDER BY s.created_at DESC LIMIT 1) AS courier_name,
       (SELECT s.tracking_number FROM shipments s
         WHERE s.order_id = o.id ORDER BY s.created_at DESC LIMIT 1) AS tracking_number
     FROM orders o
     WHERE o.user_id = ? AND o.order_status IN (${placeholders})
     ORDER BY o.created_at DESC`,
    [userId, ...statuses]
  );
  return rows;
}
