import { db } from "@/lib/db";
import { RowDataPacket, ResultSetHeader } from "mysql2";

export interface WishlistItem extends RowDataPacket {
  id: number;
  product_id: number;
  slug: string;
  name: string;
  base_price: string;
  primary_image: string | null;
  status: string;
  created_at: Date;
}

export async function getUserWishlist(userId: number): Promise<WishlistItem[]> {
  const [rows] = await db.query<WishlistItem[]>(
    `SELECT
       w.id,
       w.product_id,
       p.slug,
       p.name,
       p.base_price,
       p.status,
       w.created_at,
       (SELECT image_url FROM product_images
         WHERE product_id = p.id
         ORDER BY is_primary DESC, sort_order ASC
         LIMIT 1) AS primary_image
     FROM wishlists w
     JOIN products p ON p.id = w.product_id
     WHERE w.user_id = ?
     ORDER BY w.created_at DESC`,
    [userId]
  );
  return rows;
}

export async function addToWishlist(
  userId: number,
  productId: number
): Promise<boolean> {
  const [result] = await db.query<ResultSetHeader>(
    `INSERT IGNORE INTO wishlists (user_id, product_id) VALUES (?, ?)`,
    [userId, productId]
  );
  return result.affectedRows > 0;
}

export async function removeFromWishlist(
  userId: number,
  productId: number
): Promise<boolean> {
  const [result] = await db.query<ResultSetHeader>(
    `DELETE FROM wishlists WHERE user_id = ? AND product_id = ?`,
    [userId, productId]
  );
  return result.affectedRows > 0;
}

export async function isInWishlist(
  userId: number,
  productId: number
): Promise<boolean> {
  const [rows] = await db.query<WishlistItem[]>(
    `SELECT id FROM wishlists WHERE user_id = ? AND product_id = ? LIMIT 1`,
    [userId, productId]
  );
  return rows.length > 0;
}
