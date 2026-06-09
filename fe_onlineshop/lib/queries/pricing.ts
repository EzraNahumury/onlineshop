import { db } from "@/lib/db";
import { RowDataPacket } from "mysql2";

export interface ActivePromo {
  promotion_id: number;
  promotion_name: string;
  product_id: number;
  variant_id: number | null;
  original_price: number;
  discount_price: number;
  discount_percent: number;
  promo_stock: number;
  promo_sold: number;
  purchase_limit: number | null;
  end_at: Date;
}

const SELECT_ACTIVE_PROMO = `
  SELECT p.id AS promotion_id, p.name AS promotion_name, p.end_at,
         psi.product_id, psi.variant_id,
         psi.original_price, psi.discount_price, psi.discount_percent,
         psi.promo_stock, psi.promo_sold, psi.purchase_limit
  FROM promotion_store_items psi
  JOIN promotions p ON p.id = psi.promotion_id
  WHERE psi.is_active = 1
    AND p.status = 'active'
    AND NOW() BETWEEN p.start_at AND p.end_at
    AND (psi.promo_stock - psi.promo_sold) > 0
`;

function rowToPromo(r: RowDataPacket): ActivePromo {
  return {
    promotion_id: Number(r.promotion_id),
    promotion_name: String(r.promotion_name),
    product_id: Number(r.product_id),
    variant_id: r.variant_id != null ? Number(r.variant_id) : null,
    original_price: Number(r.original_price),
    discount_price: Number(r.discount_price),
    discount_percent: Number(r.discount_percent),
    promo_stock: Number(r.promo_stock),
    promo_sold: Number(r.promo_sold),
    purchase_limit: r.purchase_limit != null ? Number(r.purchase_limit) : null,
    end_at: new Date(r.end_at),
  };
}

export async function getActiveStorePromoForProduct(
  productId: number
): Promise<ActivePromo | null> {
  const [rows] = await db.query<RowDataPacket[]>(
    `${SELECT_ACTIVE_PROMO}
       AND psi.product_id = ?
       AND psi.variant_id IS NULL
     ORDER BY psi.discount_price ASC
     LIMIT 1`,
    [productId]
  );
  return rows.length > 0 ? rowToPromo(rows[0]) : null;
}

export async function getActiveStorePromosByProductIds(
  productIds: number[]
): Promise<Map<number, ActivePromo>> {
  const map = new Map<number, ActivePromo>();
  if (productIds.length === 0) return map;
  const placeholders = productIds.map(() => "?").join(",");
  const [rows] = await db.query<RowDataPacket[]>(
    `${SELECT_ACTIVE_PROMO}
       AND psi.product_id IN (${placeholders})
       AND psi.variant_id IS NULL`,
    productIds
  );
  for (const r of rows) {
    const candidate = rowToPromo(r);
    const existing = map.get(candidate.product_id);
    if (!existing || candidate.discount_price < existing.discount_price) {
      map.set(candidate.product_id, candidate);
    }
  }
  return map;
}
