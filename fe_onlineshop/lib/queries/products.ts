import { db } from "@/lib/db";
import { RowDataPacket } from "mysql2";

export interface ProductRow extends RowDataPacket {
  id: number;
  name: string;
  slug: string;
  base_price: string;
  stock: number;
  status: string;
  has_variant: number;
  total_sold: number;
  rating_avg: string;
  rating_count: number;
  description: string | null;
  weight_grams: number;
  min_purchase: number;
  max_purchase: number | null;
  category_name: string | null;
  category_slug: string | null;
  brand_name: string | null;
  primary_image: string | null;
  second_image: string | null;
}

export interface VariantRow extends RowDataPacket {
  id: number;
  product_id: number;
  option_name_1: string | null;
  option_value_1: string | null;
  option_name_2: string | null;
  option_value_2: string | null;
  price: string;
  stock: number;
  is_active: number;
  image_url: string | null;
}

export interface ImageRow extends RowDataPacket {
  id: number;
  product_id: number;
  image_url: string;
  alt_text: string | null;
  sort_order: number;
  is_primary: number;
}

const PRODUCT_BASE_QUERY = `
  SELECT p.*,
         c.name as category_name, c.slug as category_slug,
         b.name as brand_name,
         (SELECT pi.image_url FROM product_images pi WHERE pi.product_id = p.id AND pi.is_primary = 1 LIMIT 1) as primary_image,
         (SELECT pi2.image_url FROM product_images pi2 WHERE pi2.product_id = p.id AND pi2.is_primary = 0 ORDER BY pi2.sort_order ASC LIMIT 1) as second_image
  FROM products p
  LEFT JOIN product_categories c ON p.category_id = c.id
  LEFT JOIN brands b ON p.brand_id = b.id
`;

export async function getLiveProducts(limit?: number): Promise<ProductRow[]> {
  const sql = `${PRODUCT_BASE_QUERY} WHERE p.status = 'live' ORDER BY p.created_at DESC ${limit ? `LIMIT ${limit}` : ""}`;
  const [rows] = await db.query<ProductRow[]>(sql);
  return rows;
}

export async function getBestSellers(limit = 4): Promise<ProductRow[]> {
  const sql = `${PRODUCT_BASE_QUERY} WHERE p.status = 'live' ORDER BY p.total_sold DESC LIMIT ?`;
  const [rows] = await db.query<ProductRow[]>(sql, [limit]);
  return rows;
}

export async function getNewArrivals(limit = 4): Promise<ProductRow[]> {
  const sql = `${PRODUCT_BASE_QUERY} WHERE p.status = 'live' ORDER BY p.published_at DESC LIMIT ?`;
  const [rows] = await db.query<ProductRow[]>(sql, [limit]);
  return rows;
}

export async function getProductsByCategory(
  categorySlug: string,
  sort = "newest",
  limit?: number
): Promise<ProductRow[]> {
  let orderBy = "p.created_at DESC";
  if (sort === "price_asc") orderBy = "p.base_price ASC";
  else if (sort === "price_desc") orderBy = "p.base_price DESC";
  else if (sort === "popular") orderBy = "p.total_sold DESC";

  // Parent slug → include products from all descendant categories as well.
  const sql = `${PRODUCT_BASE_QUERY}
    WHERE p.status = 'live'
      AND (
        c.slug = ?
        OR c.parent_id = (SELECT id FROM product_categories WHERE slug = ? LIMIT 1)
      )
    ORDER BY ${orderBy} ${limit ? `LIMIT ${limit}` : ""}`;
  const [rows] = await db.query<ProductRow[]>(sql, [categorySlug, categorySlug]);
  return rows;
}

export async function getProductBySlug(slug: string): Promise<ProductRow | null> {
  const sql = `${PRODUCT_BASE_QUERY} WHERE p.slug = ? AND p.status = 'live' LIMIT 1`;
  const [rows] = await db.query<ProductRow[]>(sql, [slug]);
  return rows[0] || null;
}

export async function getProductVariants(productId: number): Promise<VariantRow[]> {
  const [rows] = await db.query<VariantRow[]>(
    `SELECT * FROM product_variants WHERE product_id = ? AND is_active = 1 ORDER BY option_value_1, option_value_2`,
    [productId]
  );
  return rows;
}

export async function getProductImages(productId: number): Promise<ImageRow[]> {
  const [rows] = await db.query<ImageRow[]>(
    `SELECT * FROM product_images WHERE product_id = ? ORDER BY is_primary DESC, sort_order ASC`,
    [productId]
  );
  return rows;
}

export async function getCategories() {
  const [rows] = await db.query<RowDataPacket[]>(
    `SELECT
        c.*,
        (SELECT COUNT(*) FROM products p2
           JOIN product_categories c2 ON c2.id = p2.category_id
          WHERE p2.status = 'live'
            AND (c2.id = c.id OR c2.parent_id = c.id)
        ) AS product_count,
        (SELECT pi.image_url
           FROM products p3
           JOIN product_images pi ON pi.product_id = p3.id
           JOIN product_categories c3 ON c3.id = p3.category_id
          WHERE p3.status = 'live'
            AND pi.is_primary = 1
            AND (c3.id = c.id OR c3.parent_id = c.id)
          ORDER BY p3.total_sold DESC, p3.created_at DESC
          LIMIT 1) AS hero_image
     FROM product_categories c
     WHERE c.is_active = 1
     ORDER BY c.sort_order ASC`
  );
  return rows;
}

export async function searchProducts(query: string, limit = 20): Promise<ProductRow[]> {
  const sql = `${PRODUCT_BASE_QUERY} WHERE p.status = 'live' AND (p.name LIKE ? OR p.description LIKE ?) ORDER BY p.total_sold DESC LIMIT ?`;
  const searchTerm = `%${query}%`;
  const [rows] = await db.query<ProductRow[]>(sql, [searchTerm, searchTerm, limit]);
  return rows;
}

export async function searchProductsByKeywords(
  keywords: string[],
  limit = 40
): Promise<ProductRow[]> {
  const cleaned = keywords.map((k) => k.trim()).filter((k) => k.length > 0);
  if (cleaned.length === 0) return [];
  const conditions = cleaned.map(() => `(p.name LIKE ? OR p.description LIKE ?)`).join(" AND ");
  const params: unknown[] = [];
  for (const k of cleaned) {
    params.push(`%${k}%`, `%${k}%`);
  }
  params.push(limit);
  const sql = `${PRODUCT_BASE_QUERY} WHERE p.status = 'live' AND ${conditions} ORDER BY p.total_sold DESC, p.created_at DESC LIMIT ?`;
  const [rows] = await db.query<ProductRow[]>(sql, params);
  return rows;
}
