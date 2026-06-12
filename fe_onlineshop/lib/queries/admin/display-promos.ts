import { db } from "@/lib/db";
import { RowDataPacket, ResultSetHeader } from "mysql2";

export type DisplayDiscountType = "percentage" | "fixed_amount";

export interface DisplayPromoRow extends RowDataPacket {
  id: number;
  title: string;
  subtitle: string | null;
  discount_type: DisplayDiscountType;
  discount_value: string;
  stock: number | null;
  start_at: Date;
  end_at: Date;
  is_active: number;
  product_count: number;
}

export interface DisplayPromoInput {
  title: string;
  subtitle: string | null;
  discountType: DisplayDiscountType;
  discountValue: number;
  stock: number | null;
  startAt: string; // "YYYY-MM-DD HH:MM:SS"
  endAt: string;
  isActive: boolean;
  productIds: number[];
}

export async function listDisplayPromos(): Promise<DisplayPromoRow[]> {
  const [rows] = await db.query<DisplayPromoRow[]>(
    `SELECT dp.id, dp.title, dp.subtitle, dp.discount_type, dp.discount_value, dp.stock,
            dp.start_at, dp.end_at, dp.is_active,
            (SELECT COUNT(*) FROM display_promo_products x WHERE x.display_promo_id = dp.id) AS product_count
       FROM display_promos dp
      ORDER BY dp.created_at DESC, dp.id DESC`
  );
  return rows;
}

export interface DisplayPromoProductLite extends RowDataPacket {
  display_promo_id: number;
  id: number;
  name: string;
  stock: number;
  image: string | null;
}

export async function listDisplayPromoProducts(): Promise<DisplayPromoProductLite[]> {
  const [rows] = await db.query<DisplayPromoProductLite[]>(
    `SELECT dpp.display_promo_id, p.id, p.name, p.stock,
            (SELECT pi.image_url FROM product_images pi
              WHERE pi.product_id = p.id
              ORDER BY pi.is_primary DESC, pi.sort_order ASC LIMIT 1) AS image
       FROM display_promo_products dpp
       JOIN products p ON p.id = dpp.product_id
      ORDER BY dpp.id ASC`
  );
  return rows;
}

// Total available stock across the chosen products — the cap for promo stock.
export async function getTotalProductStock(productIds: number[]): Promise<number> {
  const ids = [...new Set(productIds.filter((n) => Number.isInteger(n) && n > 0))];
  if (ids.length === 0) return 0;
  const placeholders = ids.map(() => "?").join(",");
  const [rows] = await db.query<RowDataPacket[]>(
    `SELECT COALESCE(SUM(stock), 0) AS total FROM products WHERE id IN (${placeholders})`,
    ids
  );
  return Number(rows[0]?.total) || 0;
}

export async function getDisplayPromoProductIds(promoId: number): Promise<number[]> {
  const [rows] = await db.query<RowDataPacket[]>(
    `SELECT product_id FROM display_promo_products WHERE display_promo_id = ?`,
    [promoId]
  );
  return rows.map((r) => Number(r.product_id));
}

async function replaceProducts(
  conn: import("mysql2/promise").PoolConnection,
  promoId: number,
  productIds: number[]
) {
  await conn.query<ResultSetHeader>(
    `DELETE FROM display_promo_products WHERE display_promo_id = ?`,
    [promoId]
  );
  const ids = [...new Set(productIds.filter((n) => Number.isInteger(n) && n > 0))];
  if (ids.length === 0) return;
  const values = ids.map(() => `(?, ?)`).join(", ");
  const params: unknown[] = [];
  for (const pid of ids) params.push(promoId, pid);
  await conn.query<ResultSetHeader>(
    `INSERT INTO display_promo_products (display_promo_id, product_id) VALUES ${values}`,
    params
  );
}

export async function createDisplayPromo(
  input: DisplayPromoInput,
  createdBy: number
): Promise<number> {
  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();
    const [res] = await conn.query<ResultSetHeader>(
      `INSERT INTO display_promos
         (title, subtitle, discount_type, discount_value, stock, start_at, end_at, is_active, created_by)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        input.title,
        input.subtitle,
        input.discountType,
        input.discountValue,
        input.stock,
        input.startAt,
        input.endAt,
        input.isActive ? 1 : 0,
        createdBy,
      ]
    );
    const id = res.insertId;
    await replaceProducts(conn, id, input.productIds);
    await conn.commit();
    return id;
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
}

export async function updateDisplayPromo(
  id: number,
  input: DisplayPromoInput
): Promise<void> {
  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();
    await conn.query<ResultSetHeader>(
      `UPDATE display_promos
          SET title = ?, subtitle = ?, discount_type = ?, discount_value = ?, stock = ?,
              start_at = ?, end_at = ?, is_active = ?
        WHERE id = ?`,
      [
        input.title,
        input.subtitle,
        input.discountType,
        input.discountValue,
        input.stock,
        input.startAt,
        input.endAt,
        input.isActive ? 1 : 0,
        id,
      ]
    );
    await replaceProducts(conn, id, input.productIds);
    await conn.commit();
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
}

export async function deleteDisplayPromo(id: number): Promise<void> {
  await db.query<ResultSetHeader>(`DELETE FROM display_promos WHERE id = ?`, [id]);
}

export async function displayPromoExists(id: number): Promise<boolean> {
  const [rows] = await db.query<RowDataPacket[]>(
    `SELECT id FROM display_promos WHERE id = ? LIMIT 1`,
    [id]
  );
  return rows.length > 0;
}
