import { NextRequest, NextResponse } from "next/server";
import { getCurrentAdmin } from "@/lib/admin-auth";
import { db } from "@/lib/db";
import { saveProductImage, UploadError } from "@/lib/upload";
import { ResultSetHeader, RowDataPacket } from "mysql2";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; variantId: string }> }
) {
  const admin = await getCurrentAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id, variantId } = await params;
  const productId = Number(id);
  const vId = Number(variantId);
  if (!Number.isInteger(productId) || !Number.isInteger(vId)) {
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  }

  // Validate ownership
  const [rows] = await db.query<RowDataPacket[]>(
    `SELECT id FROM product_variants WHERE id = ? AND product_id = ? LIMIT 1`,
    [vId, productId]
  );
  if (rows.length === 0) {
    return NextResponse.json({ error: "Variant tidak ditemukan" }, { status: 404 });
  }

  const formData = await req.formData();
  const file = formData.get("image");
  if (!(file instanceof File) || file.size === 0) {
    return NextResponse.json({ error: "File tidak valid" }, { status: 400 });
  }

  try {
    const saved = await saveProductImage(file, productId);
    await db.query<ResultSetHeader>(
      `UPDATE product_variants SET image_url = ? WHERE id = ? AND product_id = ?`,
      [saved.publicUrl, vId, productId]
    );
    return NextResponse.json({ ok: true, image_url: saved.publicUrl });
  } catch (err) {
    if (err instanceof UploadError) {
      return NextResponse.json({ error: err.message }, { status: 400 });
    }
    throw err;
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string; variantId: string }> }
) {
  const admin = await getCurrentAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id, variantId } = await params;
  const productId = Number(id);
  const vId = Number(variantId);
  if (!Number.isInteger(productId) || !Number.isInteger(vId)) {
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  }

  await db.query<ResultSetHeader>(
    `UPDATE product_variants SET image_url = NULL WHERE id = ? AND product_id = ?`,
    [vId, productId]
  );
  return NextResponse.json({ ok: true });
}
