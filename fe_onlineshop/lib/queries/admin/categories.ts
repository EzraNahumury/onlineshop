import { db } from "@/lib/db";
import { RowDataPacket, ResultSetHeader } from "mysql2";
import { slugify } from "@/lib/utils";

export interface CategoryRow extends RowDataPacket {
  id: number;
  name: string;
  slug: string;
  parent_id: number | null;
}

export async function getActiveCategories(): Promise<CategoryRow[]> {
  const [rows] = await db.query<CategoryRow[]>(
    `SELECT id, name, slug, parent_id FROM product_categories
      WHERE is_active = 1
      ORDER BY sort_order ASC, name ASC`
  );
  return rows;
}

// ---------------------------------------------------------------------------
// Master > Kategori: category management (CRUD)
// ---------------------------------------------------------------------------

export interface AdminCategoryRow extends RowDataPacket {
  id: number;
  name: string;
  slug: string;
  parent_id: number | null;
  parent_name: string | null;
  image_url: string | null;
  sort_order: number;
  is_active: number;
  product_count: number;
}

export async function listAllCategories(): Promise<AdminCategoryRow[]> {
  const [rows] = await db.query<AdminCategoryRow[]>(
    `SELECT c.id, c.name, c.slug, c.parent_id, p.name AS parent_name,
            c.image_url, c.sort_order, c.is_active,
            (SELECT COUNT(*) FROM products pr WHERE pr.category_id = c.id) AS product_count
       FROM product_categories c
       LEFT JOIN product_categories p ON p.id = c.parent_id
      ORDER BY c.sort_order ASC, c.name ASC`
  );
  return rows;
}

async function uniqueSlug(base: string, exceptId?: number): Promise<string> {
  const root = slugify(base) || "kategori";
  let slug = root;
  let n = 1;
  // eslint-disable-next-line no-constant-condition
  while (true) {
    const [rows] = await db.query<RowDataPacket[]>(
      `SELECT id FROM product_categories WHERE slug = ?${exceptId ? " AND id <> ?" : ""} LIMIT 1`,
      exceptId ? [slug, exceptId] : [slug]
    );
    if (rows.length === 0) return slug;
    n += 1;
    slug = `${root}-${n}`;
  }
}

// New category gets the next sort order among its siblings, kept below 90 so
// the pinned "Lainnya" (sort_order 99) always stays rightmost.
async function nextSortOrder(parentId: number | null): Promise<number> {
  const [rows] = await db.query<RowDataPacket[]>(
    `SELECT COALESCE(MAX(sort_order), 0) + 1 AS next
       FROM product_categories
      WHERE parent_id <=> ? AND sort_order < 90`,
    [parentId]
  );
  return Number(rows[0]?.next) || 1;
}

export async function createCategory(input: {
  name: string;
  parentId: number | null;
  isActive: boolean;
}): Promise<number> {
  const slug = await uniqueSlug(input.name);
  const sortOrder = await nextSortOrder(input.parentId);
  const [res] = await db.query<ResultSetHeader>(
    `INSERT INTO product_categories (parent_id, name, slug, sort_order, is_active)
     VALUES (?, ?, ?, ?, ?)`,
    [input.parentId, input.name, slug, sortOrder, input.isActive ? 1 : 0]
  );
  return res.insertId;
}

export async function updateCategory(
  id: number,
  input: { name: string; parentId: number | null; isActive: boolean }
): Promise<void> {
  // Slug stays stable across renames so storefront URLs / icon mapping don't break.
  await db.query<ResultSetHeader>(
    `UPDATE product_categories SET name = ?, parent_id = ?, is_active = ? WHERE id = ?`,
    [input.name, input.parentId, input.isActive ? 1 : 0, id]
  );
}

export async function setCategoryImage(
  id: number,
  imageUrl: string | null
): Promise<void> {
  await db.query<ResultSetHeader>(
    `UPDATE product_categories SET image_url = ? WHERE id = ?`,
    [imageUrl, id]
  );
}

export async function deleteCategory(id: number): Promise<void> {
  // FKs: children.parent_id and products.category_id are ON DELETE SET NULL.
  await db.query<ResultSetHeader>(`DELETE FROM product_categories WHERE id = ?`, [id]);
}

export async function getCategoryById(id: number): Promise<AdminCategoryRow | null> {
  const [rows] = await db.query<AdminCategoryRow[]>(
    `SELECT id, name, slug, parent_id, NULL AS parent_name, image_url, sort_order, is_active, 0 AS product_count
       FROM product_categories WHERE id = ? LIMIT 1`,
    [id]
  );
  return rows[0] || null;
}
