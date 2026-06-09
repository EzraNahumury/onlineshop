import { db } from "@/lib/db";
import { RowDataPacket, ResultSetHeader } from "mysql2";

export type AdminPromoTab = "all" | "active" | "scheduled" | "ended" | "draft";
export type PromoType = "store_promo" | "package_discount" | "combo_deal";

export interface AdminPromoRow extends RowDataPacket {
  id: number;
  type: PromoType;
  name: string;
  status: string;
  start_at: Date;
  end_at: Date;
  item_count: number;
  created_at: Date;
}

export interface AdminPromoListResult {
  rows: AdminPromoRow[];
  total: number;
}

export interface AdminPromoFilters {
  tab?: AdminPromoTab;
  type?: PromoType;
  page?: number;
  limit?: number;
}

function tabClause(tab: AdminPromoTab): string {
  switch (tab) {
    case "active":
      return `p.status = 'active'`;
    case "scheduled":
      return `p.status = 'scheduled'`;
    case "ended":
      return `p.status IN ('ended','cancelled')`;
    case "draft":
      return `p.status IN ('draft','paused')`;
    case "all":
    default:
      return `1 = 1`;
  }
}

export async function getAdminPromotions(
  filters: AdminPromoFilters = {}
): Promise<AdminPromoListResult> {
  const tab = filters.tab || "all";
  const page = Math.max(1, filters.page || 1);
  const limit = Math.max(1, Math.min(100, filters.limit || 20));
  const offset = (page - 1) * limit;

  const params: unknown[] = [];
  let typeSql = "";
  if (filters.type) {
    typeSql = ` AND p.type = ?`;
    params.push(filters.type);
  }

  const baseFrom = `FROM promotions p WHERE ${tabClause(tab)}${typeSql}`;

  const [countRows] = await db.query<RowDataPacket[]>(
    `SELECT COUNT(*) AS n ${baseFrom}`,
    params
  );
  const total = Number(countRows[0]?.n) || 0;

  const [rows] = await db.query<AdminPromoRow[]>(
    `SELECT p.id, p.type, p.name, p.status, p.start_at, p.end_at, p.created_at,
            CASE p.type
              WHEN 'store_promo' THEN
                (SELECT COUNT(*) FROM promotion_store_items WHERE promotion_id = p.id)
              WHEN 'package_discount' THEN
                (SELECT COUNT(*) FROM promotion_package_items WHERE promotion_id = p.id)
              WHEN 'combo_deal' THEN
                ((SELECT COUNT(*) FROM promotion_combo_main_items WHERE promotion_id = p.id) +
                 (SELECT COUNT(*) FROM promotion_combo_addon_items WHERE promotion_id = p.id))
              ELSE 0
            END AS item_count
     ${baseFrom}
     ORDER BY p.created_at DESC
     LIMIT ? OFFSET ?`,
    [...params, limit, offset]
  );

  return { rows, total };
}

export type PromoStatus = "draft" | "scheduled" | "active" | "paused" | "ended" | "cancelled";

export function computeInitialStatus(startAt: Date, endAt: Date): PromoStatus {
  const now = new Date();
  if (endAt <= now) return "ended";
  if (startAt > now) return "scheduled";
  return "active";
}

export interface CreatePromoBase {
  type: PromoType;
  name: string;
  description: string | null;
  start_at: Date;
  end_at: Date;
  max_purchase_per_user: number | null;
  created_by: number;
}

export async function insertPromotionBase(input: CreatePromoBase): Promise<number> {
  const status = computeInitialStatus(input.start_at, input.end_at);
  const [result] = await db.query<ResultSetHeader>(
    `INSERT INTO promotions
       (type, name, description, start_at, end_at, status, max_purchase_per_user, created_by)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      input.type,
      input.name,
      input.description,
      input.start_at,
      input.end_at,
      status,
      input.max_purchase_per_user,
      input.created_by,
    ]
  );
  return result.insertId;
}

export interface StoreItemInput {
  product_id: number;
  variant_id: number | null;
  original_price: number;
  discount_price: number;
  discount_percent: number;
  promo_stock: number;
  purchase_limit: number | null;
  is_active: boolean;
}

export async function insertStoreItems(promotionId: number, items: StoreItemInput[]): Promise<void> {
  if (items.length === 0) return;
  const values = items.map(() => `(?, ?, ?, ?, ?, ?, ?, ?, ?)`).join(", ");
  const params: unknown[] = [];
  for (const it of items) {
    params.push(
      promotionId,
      it.product_id,
      it.variant_id,
      it.original_price,
      it.discount_price,
      it.discount_percent,
      it.promo_stock,
      it.purchase_limit,
      it.is_active ? 1 : 0
    );
  }
  await db.query<ResultSetHeader>(
    `INSERT INTO promotion_store_items
       (promotion_id, product_id, variant_id, original_price, discount_price, discount_percent,
        promo_stock, purchase_limit, is_active)
     VALUES ${values}`,
    params
  );
}

export interface PackageTierInput {
  min_quantity: number;
  discount_type: "percentage" | "fixed_amount" | "fixed_price";
  discount_value: number;
  sort_order: number;
}

export async function insertPackageTiers(promotionId: number, tiers: PackageTierInput[]): Promise<void> {
  if (tiers.length === 0) return;
  const values = tiers.map(() => `(?, ?, ?, ?, ?)`).join(", ");
  const params: unknown[] = [];
  for (const t of tiers) {
    params.push(promotionId, t.min_quantity, t.discount_type, t.discount_value, t.sort_order);
  }
  await db.query<ResultSetHeader>(
    `INSERT INTO promotion_package_tiers
       (promotion_id, min_quantity, discount_type, discount_value, sort_order)
     VALUES ${values}`,
    params
  );
}

export async function insertPackageItems(
  promotionId: number,
  productIds: number[]
): Promise<void> {
  if (productIds.length === 0) return;
  const values = productIds.map(() => `(?, ?, NULL, 1)`).join(", ");
  const params: unknown[] = [];
  for (const pid of productIds) params.push(promotionId, pid);
  await db.query<ResultSetHeader>(
    `INSERT INTO promotion_package_items (promotion_id, product_id, variant_id, is_active)
     VALUES ${values}`,
    params
  );
}

export async function insertComboMain(promotionId: number, productIds: number[]): Promise<void> {
  if (productIds.length === 0) return;
  const values = productIds.map(() => `(?, ?, NULL, 1)`).join(", ");
  const params: unknown[] = [];
  for (const pid of productIds) params.push(promotionId, pid);
  await db.query<ResultSetHeader>(
    `INSERT INTO promotion_combo_main_items (promotion_id, product_id, variant_id, is_active)
     VALUES ${values}`,
    params
  );
}

export interface ComboAddonInput {
  product_id: number;
  variant_id: number | null;
  original_price: number;
  combo_price: number;
  combo_discount_percent: number;
  stock: number;
  purchase_limit: number | null;
  is_active: boolean;
}

export async function insertComboAddons(promotionId: number, addons: ComboAddonInput[]): Promise<void> {
  if (addons.length === 0) return;
  const values = addons.map(() => `(?, ?, ?, ?, ?, ?, ?, ?, ?)`).join(", ");
  const params: unknown[] = [];
  for (const a of addons) {
    params.push(
      promotionId,
      a.product_id,
      a.variant_id,
      a.original_price,
      a.combo_price,
      a.combo_discount_percent,
      a.stock,
      a.purchase_limit,
      a.is_active ? 1 : 0
    );
  }
  await db.query<ResultSetHeader>(
    `INSERT INTO promotion_combo_addon_items
       (promotion_id, product_id, variant_id, original_price, combo_price, combo_discount_percent,
        stock, purchase_limit, is_active)
     VALUES ${values}`,
    params
  );
}

export interface PromotionDetailRow {
  id: number;
  type: PromoType;
  name: string;
  description: string | null;
  start_at: Date;
  end_at: Date;
  status: PromoStatus;
  max_purchase_per_user: number | null;
  created_at: Date;
}

export async function getPromotionDetail(id: number): Promise<PromotionDetailRow | null> {
  const [rows] = await db.query<RowDataPacket[]>(
    `SELECT id, type, name, description, start_at, end_at, status,
            max_purchase_per_user, created_at
       FROM promotions WHERE id = ? LIMIT 1`,
    [id]
  );
  return (rows[0] as PromotionDetailRow) || null;
}

export interface StoreItemDetailRow {
  id: number;
  product_id: number;
  product_name: string;
  primary_image: string | null;
  original_price: string;
  discount_price: string;
  discount_percent: string | null;
  promo_stock: number;
  promo_sold: number;
  purchase_limit: number | null;
  is_active: number;
}

export async function getStoreItems(promotionId: number): Promise<StoreItemDetailRow[]> {
  const [rows] = await db.query<RowDataPacket[]>(
    `SELECT psi.id, psi.product_id, p.name AS product_name,
            (SELECT pi.image_url FROM product_images pi
              WHERE pi.product_id = p.id
              ORDER BY pi.is_primary DESC LIMIT 1) AS primary_image,
            psi.original_price, psi.discount_price, psi.discount_percent,
            psi.promo_stock, psi.promo_sold, psi.purchase_limit, psi.is_active
       FROM promotion_store_items psi
       JOIN products p ON p.id = psi.product_id
      WHERE psi.promotion_id = ?
      ORDER BY psi.id ASC`,
    [promotionId]
  );
  return rows as StoreItemDetailRow[];
}

export interface PackageTierDetailRow {
  id: number;
  min_quantity: number;
  discount_type: "percentage" | "fixed_amount" | "fixed_price";
  discount_value: string;
  sort_order: number;
}

export async function getPackageTiers(promotionId: number): Promise<PackageTierDetailRow[]> {
  const [rows] = await db.query<RowDataPacket[]>(
    `SELECT id, min_quantity, discount_type, discount_value, sort_order
       FROM promotion_package_tiers
      WHERE promotion_id = ?
      ORDER BY sort_order ASC, min_quantity ASC`,
    [promotionId]
  );
  return rows as PackageTierDetailRow[];
}

export interface PackageItemDetailRow {
  id: number;
  product_id: number;
  product_name: string;
  primary_image: string | null;
  base_price: string;
  is_active: number;
}

export async function getPackageItems(promotionId: number): Promise<PackageItemDetailRow[]> {
  const [rows] = await db.query<RowDataPacket[]>(
    `SELECT ppi.id, ppi.product_id, p.name AS product_name,
            (SELECT pi.image_url FROM product_images pi
              WHERE pi.product_id = p.id
              ORDER BY pi.is_primary DESC LIMIT 1) AS primary_image,
            p.base_price, ppi.is_active
       FROM promotion_package_items ppi
       JOIN products p ON p.id = ppi.product_id
      WHERE ppi.promotion_id = ?
      ORDER BY ppi.id ASC`,
    [promotionId]
  );
  return rows as PackageItemDetailRow[];
}

export interface ComboMainDetailRow {
  id: number;
  product_id: number;
  product_name: string;
  primary_image: string | null;
  base_price: string;
  is_active: number;
}

export async function getComboMain(promotionId: number): Promise<ComboMainDetailRow[]> {
  const [rows] = await db.query<RowDataPacket[]>(
    `SELECT pcmi.id, pcmi.product_id, p.name AS product_name,
            (SELECT pi.image_url FROM product_images pi
              WHERE pi.product_id = p.id
              ORDER BY pi.is_primary DESC LIMIT 1) AS primary_image,
            p.base_price, pcmi.is_active
       FROM promotion_combo_main_items pcmi
       JOIN products p ON p.id = pcmi.product_id
      WHERE pcmi.promotion_id = ?
      ORDER BY pcmi.id ASC`,
    [promotionId]
  );
  return rows as ComboMainDetailRow[];
}

export interface ComboAddonDetailRow {
  id: number;
  product_id: number;
  product_name: string;
  primary_image: string | null;
  original_price: string;
  combo_price: string;
  combo_discount_percent: string | null;
  stock: number;
  purchase_limit: number | null;
  is_active: number;
}

export async function getComboAddons(promotionId: number): Promise<ComboAddonDetailRow[]> {
  const [rows] = await db.query<RowDataPacket[]>(
    `SELECT pcai.id, pcai.product_id, p.name AS product_name,
            (SELECT pi.image_url FROM product_images pi
              WHERE pi.product_id = p.id
              ORDER BY pi.is_primary DESC LIMIT 1) AS primary_image,
            pcai.original_price, pcai.combo_price, pcai.combo_discount_percent,
            pcai.stock, pcai.purchase_limit, pcai.is_active
       FROM promotion_combo_addon_items pcai
       JOIN products p ON p.id = pcai.product_id
      WHERE pcai.promotion_id = ?
      ORDER BY pcai.id ASC`,
    [promotionId]
  );
  return rows as ComboAddonDetailRow[];
}

export async function setPromotionStatus(id: number, status: PromoStatus): Promise<void> {
  await db.query<ResultSetHeader>(
    `UPDATE promotions SET status = ? WHERE id = ?`,
    [status, id]
  );
}

export async function deletePromotion(id: number): Promise<void> {
  await db.query<ResultSetHeader>(`DELETE FROM promotions WHERE id = ?`, [id]);
}

export async function setStoreItemActive(itemId: number, active: boolean): Promise<void> {
  await db.query<ResultSetHeader>(
    `UPDATE promotion_store_items SET is_active = ? WHERE id = ?`,
    [active ? 1 : 0, itemId]
  );
}

export async function setComboAddonActive(itemId: number, active: boolean): Promise<void> {
  await db.query<ResultSetHeader>(
    `UPDATE promotion_combo_addon_items SET is_active = ? WHERE id = ?`,
    [active ? 1 : 0, itemId]
  );
}

export async function setPackageItemActive(itemId: number, active: boolean): Promise<void> {
  await db.query<ResultSetHeader>(
    `UPDATE promotion_package_items SET is_active = ? WHERE id = ?`,
    [active ? 1 : 0, itemId]
  );
}

export interface UpdatePromotionBasicInput {
  name?: string;
  description?: string | null;
  start_at?: Date;
  end_at?: Date;
  max_purchase_per_user?: number | null;
}

export async function updatePromotionBasic(
  id: number,
  input: UpdatePromotionBasicInput
): Promise<void> {
  const fields: string[] = [];
  const params: unknown[] = [];

  if (input.name !== undefined) {
    fields.push("name = ?");
    params.push(input.name);
  }
  if (input.description !== undefined) {
    fields.push("description = ?");
    params.push(input.description);
  }
  if (input.start_at !== undefined) {
    fields.push("start_at = ?");
    params.push(input.start_at);
  }
  if (input.end_at !== undefined) {
    fields.push("end_at = ?");
    params.push(input.end_at);
  }
  if (input.max_purchase_per_user !== undefined) {
    fields.push("max_purchase_per_user = ?");
    params.push(input.max_purchase_per_user);
  }
  if (input.start_at !== undefined && input.end_at !== undefined) {
    const newStatus = computeInitialStatus(input.start_at, input.end_at);
    fields.push(
      `status = CASE WHEN status IN ('paused','cancelled') THEN status ELSE ? END`
    );
    params.push(newStatus);
  }

  if (fields.length === 0) return;
  params.push(id);
  await db.query<ResultSetHeader>(
    `UPDATE promotions SET ${fields.join(", ")} WHERE id = ?`,
    params
  );
}

export async function removeStoreItemRow(itemId: number, promotionId: number): Promise<void> {
  await db.query<ResultSetHeader>(
    `DELETE FROM promotion_store_items WHERE id = ? AND promotion_id = ?`,
    [itemId, promotionId]
  );
}
export async function removeComboMainRow(itemId: number, promotionId: number): Promise<void> {
  await db.query<ResultSetHeader>(
    `DELETE FROM promotion_combo_main_items WHERE id = ? AND promotion_id = ?`,
    [itemId, promotionId]
  );
}
export async function removeComboAddonRow(itemId: number, promotionId: number): Promise<void> {
  await db.query<ResultSetHeader>(
    `DELETE FROM promotion_combo_addon_items WHERE id = ? AND promotion_id = ?`,
    [itemId, promotionId]
  );
}
export async function removePackageItemRow(itemId: number, promotionId: number): Promise<void> {
  await db.query<ResultSetHeader>(
    `DELETE FROM promotion_package_items WHERE id = ? AND promotion_id = ?`,
    [itemId, promotionId]
  );
}

export interface UpdateStoreItemInput {
  discount_price: number;
  discount_percent: number;
  promo_stock: number;
  purchase_limit: number | null;
}

export async function updateStoreItemRow(
  itemId: number,
  promotionId: number,
  input: UpdateStoreItemInput
): Promise<void> {
  await db.query<ResultSetHeader>(
    `UPDATE promotion_store_items
        SET discount_price = ?, discount_percent = ?, promo_stock = ?, purchase_limit = ?
      WHERE id = ? AND promotion_id = ?`,
    [
      input.discount_price,
      input.discount_percent,
      input.promo_stock,
      input.purchase_limit,
      itemId,
      promotionId,
    ]
  );
}

export interface UpdateComboAddonInput {
  combo_price: number;
  combo_discount_percent: number;
  stock: number;
  purchase_limit: number | null;
}

export async function updateComboAddonRow(
  itemId: number,
  promotionId: number,
  input: UpdateComboAddonInput
): Promise<void> {
  await db.query<ResultSetHeader>(
    `UPDATE promotion_combo_addon_items
        SET combo_price = ?, combo_discount_percent = ?, stock = ?, purchase_limit = ?
      WHERE id = ? AND promotion_id = ?`,
    [
      input.combo_price,
      input.combo_discount_percent,
      input.stock,
      input.purchase_limit,
      itemId,
      promotionId,
    ]
  );
}

export async function replacePackageTiers(
  promotionId: number,
  tiers: PackageTierInput[]
): Promise<void> {
  await db.query<ResultSetHeader>(
    `DELETE FROM promotion_package_tiers WHERE promotion_id = ?`,
    [promotionId]
  );
  if (tiers.length === 0) return;
  await insertPackageTiers(promotionId, tiers);
}

export async function getExistingStoreProductIds(promotionId: number): Promise<number[]> {
  const [rows] = await db.query<RowDataPacket[]>(
    `SELECT product_id FROM promotion_store_items WHERE promotion_id = ?`,
    [promotionId]
  );
  return rows.map((r) => Number(r.product_id));
}
export async function getExistingComboMainProductIds(promotionId: number): Promise<number[]> {
  const [rows] = await db.query<RowDataPacket[]>(
    `SELECT product_id FROM promotion_combo_main_items WHERE promotion_id = ?`,
    [promotionId]
  );
  return rows.map((r) => Number(r.product_id));
}
export async function getExistingComboAddonProductIds(promotionId: number): Promise<number[]> {
  const [rows] = await db.query<RowDataPacket[]>(
    `SELECT product_id FROM promotion_combo_addon_items WHERE promotion_id = ?`,
    [promotionId]
  );
  return rows.map((r) => Number(r.product_id));
}
export async function getExistingPackageProductIds(promotionId: number): Promise<number[]> {
  const [rows] = await db.query<RowDataPacket[]>(
    `SELECT product_id FROM promotion_package_items WHERE promotion_id = ?`,
    [promotionId]
  );
  return rows.map((r) => Number(r.product_id));
}

export async function getPromoTabCounts(): Promise<Record<AdminPromoTab, number>> {
  const [rows] = await db.query<RowDataPacket[]>(
    `SELECT
       COUNT(*) AS all_count,
       SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) AS active_count,
       SUM(CASE WHEN status = 'scheduled' THEN 1 ELSE 0 END) AS scheduled_count,
       SUM(CASE WHEN status IN ('ended','cancelled') THEN 1 ELSE 0 END) AS ended_count,
       SUM(CASE WHEN status IN ('draft','paused') THEN 1 ELSE 0 END) AS draft_count
       FROM promotions`
  );
  const r = rows[0] || {};
  return {
    all: Number(r.all_count) || 0,
    active: Number(r.active_count) || 0,
    scheduled: Number(r.scheduled_count) || 0,
    ended: Number(r.ended_count) || 0,
    draft: Number(r.draft_count) || 0,
  };
}
