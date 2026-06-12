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

// Where uploaded files live on disk. Set UPLOAD_DIR to a PERSISTENT path OUTSIDE
// the deploy folder (e.g. /home/USER/onlineshop_uploads) so user uploads survive
// re-deploys. Defaults to public/uploads (served statically by Next when present).
export function uploadRoot(): string {
  return process.env.UPLOAD_DIR || path.join(process.cwd(), "public", "uploads");
}

export interface SavedImage {
  publicUrl: string;
  size: number;
  mime: string;
}

async function saveImage(file: File, segments: string[]): Promise<SavedImage> {
  if (!ALLOWED_MIME.has(file.type)) {
    throw new UploadError(`Tipe file tidak didukung (${file.type}). Gunakan JPG, PNG, atau WEBP.`);
  }
  if (file.size > MAX_BYTES) {
    throw new UploadError(`Ukuran file melebihi 5MB.`);
  }

  const ext = EXT_BY_MIME[file.type] || "bin";
  const filename = `${crypto.randomUUID()}.${ext}`;
  const dir = path.join(uploadRoot(), ...segments);
  await mkdir(dir, { recursive: true });
  await writeFile(path.join(dir, filename), Buffer.from(await file.arrayBuffer()));

  return {
    publicUrl: `/uploads/${[...segments, filename].join("/")}`,
    size: file.size,
    mime: file.type,
  };
}

export function saveProductImage(file: File, productId: number): Promise<SavedImage> {
  return saveImage(file, ["products", String(productId)]);
}

export function savePaymentProof(file: File, orderNumber: string): Promise<SavedImage> {
  const safeOrder = orderNumber.replace(/[^a-zA-Z0-9_-]/g, "");
  return saveImage(file, ["payments", safeOrder]);
}

export function saveCategoryImage(file: File, categoryId: number): Promise<SavedImage> {
  return saveImage(file, ["categories", String(categoryId)]);
}

export class UploadError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "UploadError";
  }
}
