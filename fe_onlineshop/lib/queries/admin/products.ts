import { db } from "@/lib/db";
import { RowDataPacket, ResultSetHeader } from "mysql2";

export type AdminProductTab =
  | "all"
  | "live"
  | "needs_action"
  | "under_review"
  | "draft"
  | "archived";

export type AdminProductSort = "newest" | "price_asc" | "price_desc" | "stock_asc" | "best_selling";

export interface AdminProductRow extends RowDataPacket {
  id: number;
  name: string;
  slug: string;
  base_price: string;
  stock: number;
  status: "draft" | "live" | "under_review" | "archived" | "rejected";
  has_variant: number;
  total_sold: number;
  category_name: string | null;
  primary_image: string | null;
  created_at: Date;
  updated_at: Date;
}

export interface AdminProductListResult {
  rows: AdminProductRow[];
  total: number;
}

export interface AdminProductFilters {
  tab?: AdminProductTab;
  sort?: AdminProductSort;
  search?: string;
  page?: number;
  limit?: number;
}

function tabClause(tab: AdminProductTab): { sql: string; params: unknown[] } {
  switch (tab) {
    case "live":
      return { sql: `p.status = 'live'`, params: [] };
    case "needs_action":
      return {
        sql: `(p.status = 'live' AND (p.stock < 10 OR NOT EXISTS (SELECT 1 FROM product_images pi WHERE pi.product_id = p.id))) OR p.status = 'rejected'`,
        params: [],
      };
    case "under_review":
      return { sql: `p.status = 'under_review'`, params: [] };
    case "draft":
      return { sql: `p.status = 'draft'`, params: [] };
    case "archived":
      return { sql: `p.status = 'archived'`, params: [] };
    case "all":
    default:
      return { sql: `1 = 1`, params: [] };
  }
}

function sortClause(sort: AdminProductSort): string {
  switch (sort) {
    case "price_asc":
      return "p.base_price ASC";
    case "price_desc":
      return "p.base_price DESC";
    case "stock_asc":
      return "p.stock ASC";
    case "best_selling":
      return "p.total_sold DESC";
    case "newest":
    default:
      return "p.created_at DESC";
  }
}

export async function getAdminProducts(
  filters: AdminProductFilters = {}
): Promise<AdminProductListResult> {
  const tab = filters.tab || "all";
  const sort = filters.sort || "newest";
  const page = Math.max(1, filters.page || 1);
  const limit = Math.max(1, Math.min(100, filters.limit || 20));
  const offset = (page - 1) * limit;

  const tabPart = tabClause(tab);
  const params: unknown[] = [...tabPart.params];

  let searchSql = "";
  if (filters.search && filters.search.trim()) {
    searchSql = ` AND (p.name LIKE ? OR p.sku LIKE ?)`;
    const term = `%${filters.search.trim()}%`;
    params.push(term, term);
  }

  const baseFrom = `
    FROM products p
    LEFT JOIN product_categories c ON c.id = p.category_id
    WHERE ${tabPart.sql}${searchSql}
  `;

  const [countRows] = await db.query<RowDataPacket[]>(
    `SELECT COUNT(*) AS n ${baseFrom}`,
    params
  );
  const total = Number(countRows[0]?.n) || 0;

  const [rows] = await db.query<AdminProductRow[]>(
    `SELECT p.id, p.name, p.slug, p.base_price, p.stock, p.status, p.has_variant,
            p.total_sold, p.created_at, p.updated_at,
            c.name AS category_name,
            (SELECT pi.image_url FROM product_images pi
              WHERE pi.product_id = p.id
              ORDER BY pi.is_primary DESC, pi.sort_order ASC LIMIT 1) AS primary_image
     ${baseFrom}
     ORDER BY ${sortClause(sort)}
     LIMIT ? OFFSET ?`,
    [...params, limit, offset]
  );

  return { rows, total };
}

export async function getProductTabCounts(): Promise<Record<AdminProductTab, number>> {
  const [rows] = await db.query<RowDataPacket[]>(
    `SELECT
       SUM(1) AS all_count,
       SUM(CASE WHEN p.status = 'live' THEN 1 ELSE 0 END) AS live_count,
       SUM(CASE WHEN p.status = 'under_review' THEN 1 ELSE 0 END) AS under_review_count,
       SUM(CASE WHEN p.status = 'draft' THEN 1 ELSE 0 END) AS draft_count,
       SUM(CASE WHEN p.status = 'archived' THEN 1 ELSE 0 END) AS archived_count,
       SUM(CASE WHEN p.status = 'rejected'
                 OR (p.status = 'live' AND (p.stock < 10
                   OR NOT EXISTS (SELECT 1 FROM product_images pi WHERE pi.product_id = p.id)))
                THEN 1 ELSE 0 END) AS needs_action_count
       FROM products p`
  );
  const r = rows[0] || {};
  return {
    all: Number(r.all_count) || 0,
    live: Number(r.live_count) || 0,
    needs_action: Number(r.needs_action_count) || 0,
    under_review: Number(r.under_review_count) || 0,
    draft: Number(r.draft_count) || 0,
    archived: Number(r.archived_count) || 0,
  };
}

export async function archiveProduct(id: number): Promise<void> {
  await db.query<ResultSetHeader>(
    `UPDATE products SET status = 'archived' WHERE id = ?`,
    [id]
  );
}

export async function findProductForAudit(id: number): Promise<{ id: number; status: string; name: string } | null> {
  const [rows] = await db.query<RowDataPacket[]>(
    `SELECT id, status, name FROM products WHERE id = ? LIMIT 1`,
    [id]
  );
  return (rows[0] as { id: number; status: string; name: string }) || null;
}

export interface ProductDetail {
  id: number;
  category_id: number | null;
  brand_id: number | null;
  name: string;
  slug: string;
  sku: string | null;
  gtin: string | null;
  description: string | null;
  base_price: string;
  stock: number;
  status: "draft" | "live" | "under_review" | "archived" | "rejected";
  has_variant: number;
  min_purchase: number;
  max_purchase: number | null;
  weight_grams: number;
  length_cm: string | null;
  width_cm: string | null;
  height_cm: string | null;
}

export interface ProductImageRow {
  id: number;
  product_id: number;
  image_url: string;
  alt_text: string | null;
  sort_order: number;
  is_primary: number;
}

export interface ProductVariantRow {
  id: number;
  product_id: number;
  sku: string | null;
  gtin: string | null;
  option_name_1: string | null;
  option_value_1: string | null;
  option_name_2: string | null;
  option_value_2: string | null;
  price: string;
  stock: number;
  weight_grams: number | null;
  is_active: number;
  image_url: string | null;
}

export interface ShippingProfileRow {
  id: number;
  product_id: number;
  is_free_shipping: number;
  shipping_fee_flat: string | null;
  notes: string | null;
}

export async function getProductDetail(id: number): Promise<ProductDetail | null> {
  const [rows] = await db.query<RowDataPacket[]>(
    `SELECT id, category_id, brand_id, name, slug, sku, gtin, description,
            base_price, stock, status, has_variant, min_purchase, max_purchase,
            weight_grams, length_cm, width_cm, height_cm
       FROM products WHERE id = ? LIMIT 1`,
    [id]
  );
  return (rows[0] as ProductDetail) || null;
}

export async function getProductImages(productId: number): Promise<ProductImageRow[]> {
  const [rows] = await db.query<RowDataPacket[]>(
    `SELECT id, product_id, image_url, alt_text, sort_order, is_primary
       FROM product_images
      WHERE product_id = ?
      ORDER BY is_primary DESC, sort_order ASC, id ASC`,
    [productId]
  );
  return rows as ProductImageRow[];
}

export async function getProductVariants(productId: number): Promise<ProductVariantRow[]> {
  const [rows] = await db.query<RowDataPacket[]>(
    `SELECT id, product_id, sku, gtin, option_name_1, option_value_1,
            option_name_2, option_value_2, price, stock, weight_grams, is_active, image_url
       FROM product_variants
      WHERE product_id = ?
      ORDER BY id ASC`,
    [productId]
  );
  return rows as ProductVariantRow[];
}

export async function getShippingProfile(productId: number): Promise<ShippingProfileRow | null> {
  const [rows] = await db.query<RowDataPacket[]>(
    `SELECT id, product_id, is_free_shipping, shipping_fee_flat, notes
       FROM product_shipping_profiles
      WHERE product_id = ?
      LIMIT 1`,
    [productId]
  );
  return (rows[0] as ShippingProfileRow) || null;
}

async function isSlugTaken(slug: string, excludeId?: number): Promise<boolean> {
  const params: unknown[] = [slug];
  let sql = `SELECT id FROM products WHERE slug = ?`;
  if (excludeId) {
    sql += ` AND id != ?`;
    params.push(excludeId);
  }
  sql += ` LIMIT 1`;
  const [rows] = await db.query<RowDataPacket[]>(sql, params);
  return rows.length > 0;
}

import { slugify } from "@/lib/utils";

export async function generateUniqueSlug(name: string, excludeId?: number): Promise<string> {
  const base = slugify(name) || "produk";
  let candidate = base;
  let attempt = 0;
  while (await isSlugTaken(candidate, excludeId)) {
    attempt++;
    candidate = `${base}-${Math.random().toString(36).slice(2, 6)}`;
    if (attempt > 8) break;
  }
  return candidate;
}

export interface CreateDraftInput {
  name: string;
  sku?: string | null;
  gtin?: string | null;
  category_id?: number | null;
  createdBy?: number;
}

export async function createDraftProduct(input: CreateDraftInput): Promise<number> {
  const slug = await generateUniqueSlug(input.name);
  const [result] = await db.query<ResultSetHeader>(
    `INSERT INTO products (category_id, name, slug, sku, gtin, status, created_by, updated_by)
     VALUES (?, ?, ?, ?, ?, 'draft', ?, ?)`,
    [
      input.category_id ?? null,
      input.name,
      slug,
      input.sku || null,
      input.gtin || null,
      input.createdBy || null,
      input.createdBy || null,
    ]
  );
  return result.insertId;
}

export interface UpdateBasicInput {
  name?: string;
  category_id?: number | null;
  brand_id?: number | null;
  sku?: string | null;
  gtin?: string | null;
  description?: string | null;
  updatedBy?: number;
}

export async function updateProductBasic(id: number, input: UpdateBasicInput): Promise<void> {
  const fields: string[] = [];
  const params: unknown[] = [];

  if (input.name !== undefined) {
    fields.push("name = ?");
    params.push(input.name);
    const newSlug = await generateUniqueSlug(input.name, id);
    fields.push("slug = ?");
    params.push(newSlug);
  }
  if (input.category_id !== undefined) {
    fields.push("category_id = ?");
    params.push(input.category_id);
  }
  if (input.brand_id !== undefined) {
    fields.push("brand_id = ?");
    params.push(input.brand_id);
  }
  if (input.sku !== undefined) {
    fields.push("sku = ?");
    params.push(input.sku);
  }
  if (input.gtin !== undefined) {
    fields.push("gtin = ?");
    params.push(input.gtin);
  }
  if (input.description !== undefined) {
    fields.push("description = ?");
    params.push(input.description);
  }
  if (input.updatedBy) {
    fields.push("updated_by = ?");
    params.push(input.updatedBy);
  }

  if (fields.length === 0) return;
  params.push(id);
  await db.query<ResultSetHeader>(
    `UPDATE products SET ${fields.join(", ")} WHERE id = ?`,
    params
  );
}

export interface SalesInputNoVariant {
  base_price: number;
  stock: number;
}

export async function setProductPriceAndStock(
  productId: number,
  input: SalesInputNoVariant
): Promise<void> {
  await db.query<ResultSetHeader>(
    `UPDATE products SET base_price = ?, stock = ?, has_variant = 0 WHERE id = ?`,
    [input.base_price, input.stock, productId]
  );
  await db.query<ResultSetHeader>(
    `DELETE FROM product_variants WHERE product_id = ?`,
    [productId]
  );
}

export interface VariantInput {
  sku: string | null;
  gtin: string | null;
  option_name_1: string | null;
  option_value_1: string | null;
  option_name_2: string | null;
  option_value_2: string | null;
  price: number;
  stock: number;
  weight_grams: number | null;
}

export async function replaceVariants(
  productId: number,
  variants: VariantInput[]
): Promise<void> {
  // Upsert strategy — preserve variant IDs (and thus image_url) across saves.
  // Natural key = (option_value_1, option_value_2).
  const [existingRows] = await db.query<RowDataPacket[]>(
    `SELECT id, option_value_1, option_value_2 FROM product_variants WHERE product_id = ?`,
    [productId]
  );
  const keyOf = (v1: string | null, v2: string | null) =>
    `${(v1 ?? "").trim()}__${(v2 ?? "").trim()}`;
  const existingByKey = new Map<string, number>();
  for (const r of existingRows) {
    existingByKey.set(keyOf(r.option_value_1, r.option_value_2), r.id);
  }

  const keepIds = new Set<number>();
  for (const v of variants) {
    const key = keyOf(v.option_value_1, v.option_value_2);
    const existingId = existingByKey.get(key);
    if (existingId) {
      keepIds.add(existingId);
      await db.query<ResultSetHeader>(
        `UPDATE product_variants
            SET sku = ?, gtin = ?, option_name_1 = ?, option_name_2 = ?,
                price = ?, stock = ?, weight_grams = ?, is_active = 1
          WHERE id = ? AND product_id = ?`,
        [
          v.sku,
          v.gtin,
          v.option_name_1,
          v.option_name_2,
          v.price,
          v.stock,
          v.weight_grams,
          existingId,
          productId,
        ]
      );
    } else {
      await db.query<ResultSetHeader>(
        `INSERT INTO product_variants
           (product_id, sku, gtin, option_name_1, option_value_1, option_name_2, option_value_2,
            price, stock, weight_grams, is_active)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1)`,
        [
          productId,
          v.sku,
          v.gtin,
          v.option_name_1,
          v.option_value_1,
          v.option_name_2,
          v.option_value_2,
          v.price,
          v.stock,
          v.weight_grams,
        ]
      );
    }
  }

  // Delete variants that no longer appear in the input.
  for (const [key, id] of existingByKey.entries()) {
    if (!keepIds.has(id)) {
      // Only delete variants we haven't kept.
      // key variable unused but kept for clarity.
      void key;
      await db.query<ResultSetHeader>(
        `DELETE FROM product_variants WHERE id = ? AND product_id = ?`,
        [id, productId]
      );
    }
  }

  if (variants.length === 0) {
    await db.query<ResultSetHeader>(
      `UPDATE products SET has_variant = 0 WHERE id = ?`,
      [productId]
    );
    return;
  }

  const totalStock = variants.reduce((sum, v) => sum + (v.stock || 0), 0);
  const minPrice = Math.min(...variants.map((v) => v.price));
  await db.query<ResultSetHeader>(
    `UPDATE products SET has_variant = 1, base_price = ?, stock = ? WHERE id = ?`,
    [minPrice, totalStock, productId]
  );
}

export interface ShippingInput {
  weight_grams: number;
  length_cm: number | null;
  width_cm: number | null;
  height_cm: number | null;
  min_purchase: number;
  max_purchase: number | null;
  is_free_shipping: boolean;
  notes: string | null;
}

export async function upsertShipping(
  productId: number,
  input: ShippingInput
): Promise<void> {
  await db.query<ResultSetHeader>(
    `UPDATE products
        SET weight_grams = ?, length_cm = ?, width_cm = ?, height_cm = ?,
            min_purchase = ?, max_purchase = ?
      WHERE id = ?`,
    [
      input.weight_grams,
      input.length_cm,
      input.width_cm,
      input.height_cm,
      input.min_purchase,
      input.max_purchase,
      productId,
    ]
  );
  await db.query<ResultSetHeader>(
    `INSERT INTO product_shipping_profiles
       (product_id, is_free_shipping, notes)
     VALUES (?, ?, ?)
     ON DUPLICATE KEY UPDATE is_free_shipping = VALUES(is_free_shipping), notes = VALUES(notes)`,
    [productId, input.is_free_shipping ? 1 : 0, input.notes]
  );
}

export async function setProductStatus(
  productId: number,
  status: "draft" | "live" | "archived"
): Promise<void> {
  if (status === "live") {
    await db.query<ResultSetHeader>(
      `UPDATE products SET status = 'live', published_at = COALESCE(published_at, NOW()) WHERE id = ?`,
      [productId]
    );
  } else {
    await db.query<ResultSetHeader>(
      `UPDATE products SET status = ? WHERE id = ?`,
      [status, productId]
    );
  }
}

export async function addProductImage(
  productId: number,
  imageUrl: string,
  altText: string | null
): Promise<number> {
  const [countRows] = await db.query<RowDataPacket[]>(
    `SELECT COUNT(*) AS n FROM product_images WHERE product_id = ?`,
    [productId]
  );
  const isFirst = Number(countRows[0]?.n || 0) === 0;
  const [order] = await db.query<RowDataPacket[]>(
    `SELECT COALESCE(MAX(sort_order), -1) + 1 AS next FROM product_images WHERE product_id = ?`,
    [productId]
  );
  const sortOrder = Number(order[0]?.next || 0);
  const [result] = await db.query<ResultSetHeader>(
    `INSERT INTO product_images (product_id, image_url, alt_text, sort_order, is_primary)
     VALUES (?, ?, ?, ?, ?)`,
    [productId, imageUrl, altText, sortOrder, isFirst ? 1 : 0]
  );
  return result.insertId;
}

export async function deleteProductImage(productId: number, imageId: number): Promise<void> {
  const [imgRows] = await db.query<RowDataPacket[]>(
    `SELECT id, is_primary FROM product_images WHERE id = ? AND product_id = ? LIMIT 1`,
    [imageId, productId]
  );
  const img = imgRows[0];
  if (!img) return;
  await db.query<ResultSetHeader>(`DELETE FROM product_images WHERE id = ?`, [imageId]);
  if (img.is_primary) {
    await db.query<ResultSetHeader>(
      `UPDATE product_images SET is_primary = 1
         WHERE product_id = ?
         ORDER BY sort_order ASC, id ASC LIMIT 1`,
      [productId]
    );
  }
}

export async function setPrimaryImage(productId: number, imageId: number): Promise<void> {
  await db.query<ResultSetHeader>(
    `UPDATE product_images SET is_primary = 0 WHERE product_id = ?`,
    [productId]
  );
  await db.query<ResultSetHeader>(
    `UPDATE product_images SET is_primary = 1 WHERE id = ? AND product_id = ?`,
    [imageId, productId]
  );
}

export async function productExists(id: number): Promise<boolean> {
  const [rows] = await db.query<RowDataPacket[]>(
    `SELECT id FROM products WHERE id = ? LIMIT 1`,
    [id]
  );
  return rows.length > 0;
}

export interface ProductPickerRow extends RowDataPacket {
  id: number;
  name: string;
  base_price: string;
  stock: number;
  category_name: string | null;
  primary_image: string | null;
}

export async function searchProductsForPicker(
  search: string,
  limit = 30
): Promise<ProductPickerRow[]> {
  const params: unknown[] = [];
  let where = `p.status = 'live'`;
  if (search && search.trim()) {
    where += ` AND (p.name LIKE ? OR p.sku LIKE ?)`;
    const term = `%${search.trim()}%`;
    params.push(term, term);
  }
  const [rows] = await db.query<ProductPickerRow[]>(
    `SELECT p.id, p.name, p.base_price, p.stock,
            c.name AS category_name,
            (SELECT pi.image_url FROM product_images pi
              WHERE pi.product_id = p.id
              ORDER BY pi.is_primary DESC, pi.sort_order ASC LIMIT 1) AS primary_image
       FROM products p
       LEFT JOIN product_categories c ON c.id = p.category_id
      WHERE ${where}
      ORDER BY p.total_sold DESC, p.created_at DESC
      LIMIT ?`,
    [...params, limit]
  );
  return rows;
}

export async function getProductsByIds(ids: number[]): Promise<{ id: number; name: string; base_price: string; stock: number }[]> {
  if (ids.length === 0) return [];
  const placeholders = ids.map(() => "?").join(",");
  const [rows] = await db.query<RowDataPacket[]>(
    `SELECT id, name, base_price, stock FROM products WHERE id IN (${placeholders})`,
    ids
  );
  return rows as { id: number; name: string; base_price: string; stock: number }[];
}
