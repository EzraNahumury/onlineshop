import { mkdir, writeFile } from "fs/promises";
import path from "path";
import crypto from "crypto";

const ALLOWED_MIME = new Set(["image/jpeg", "image/png", "image/webp"]);
const MAX_BYTES = 5 * 1024 * 1024;

const EXT_BY_MIME: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

export interface SavedImage {
  publicUrl: string;
  size: number;
  mime: string;
}

export async function saveProductImage(
  file: File,
  productId: number
): Promise<SavedImage> {
  if (!ALLOWED_MIME.has(file.type)) {
    throw new UploadError(`Tipe file tidak didukung (${file.type}). Gunakan JPG, PNG, atau WEBP.`);
  }
  if (file.size > MAX_BYTES) {
    throw new UploadError(`Ukuran file melebihi 5MB.`);
  }

  const ext = EXT_BY_MIME[file.type] || "bin";
  const filename = `${crypto.randomUUID()}.${ext}`;
  const dir = path.join(process.cwd(), "public", "uploads", "products", String(productId));
  await mkdir(dir, { recursive: true });

  const filepath = path.join(dir, filename);
  const bytes = Buffer.from(await file.arrayBuffer());
  await writeFile(filepath, bytes);

  return {
    publicUrl: `/uploads/products/${productId}/${filename}`,
    size: file.size,
    mime: file.type,
  };
}

export async function savePaymentProof(
  file: File,
  orderNumber: string
): Promise<SavedImage> {
  if (!ALLOWED_MIME.has(file.type)) {
    throw new UploadError(`Tipe file tidak didukung (${file.type}). Gunakan JPG, PNG, atau WEBP.`);
  }
  if (file.size > MAX_BYTES) {
    throw new UploadError(`Ukuran file melebihi 5MB.`);
  }

  const ext = EXT_BY_MIME[file.type] || "bin";
  const filename = `${crypto.randomUUID()}.${ext}`;
  const safeOrder = orderNumber.replace(/[^a-zA-Z0-9_-]/g, "");
  const dir = path.join(process.cwd(), "public", "uploads", "payments", safeOrder);
  await mkdir(dir, { recursive: true });

  const filepath = path.join(dir, filename);
  const bytes = Buffer.from(await file.arrayBuffer());
  await writeFile(filepath, bytes);

  return {
    publicUrl: `/uploads/payments/${safeOrder}/${filename}`,
    size: file.size,
    mime: file.type,
  };
}

export async function saveCategoryImage(
  file: File,
  categoryId: number
): Promise<SavedImage> {
  if (!ALLOWED_MIME.has(file.type)) {
    throw new UploadError(`Tipe file tidak didukung (${file.type}). Gunakan JPG, PNG, atau WEBP.`);
  }
  if (file.size > MAX_BYTES) {
    throw new UploadError(`Ukuran file melebihi 5MB.`);
  }

  const ext = EXT_BY_MIME[file.type] || "bin";
  const filename = `${crypto.randomUUID()}.${ext}`;
  const dir = path.join(process.cwd(), "public", "uploads", "categories", String(categoryId));
  await mkdir(dir, { recursive: true });

  const filepath = path.join(dir, filename);
  const bytes = Buffer.from(await file.arrayBuffer());
  await writeFile(filepath, bytes);

  return {
    publicUrl: `/uploads/categories/${categoryId}/${filename}`,
    size: file.size,
    mime: file.type,
  };
}

export class UploadError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "UploadError";
  }
}
