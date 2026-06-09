import { NextRequest, NextResponse } from "next/server";
import { getCurrentAdmin } from "@/lib/admin-auth";
import { writeAuditLog } from "@/lib/audit";
import {
  createCategory,
  getCategoryById,
  setCategoryImage,
} from "@/lib/queries/admin/categories";
import { saveCategoryImage, UploadError } from "@/lib/upload";

export async function POST(req: NextRequest) {
  const admin = await getCurrentAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const ct = req.headers.get("content-type") || "";
  if (!ct.includes("multipart/form-data")) {
    return NextResponse.json({ error: "Format tidak valid" }, { status: 415 });
  }

  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return NextResponse.json({ error: "Data form tidak valid" }, { status: 400 });
  }

  const name = String(form.get("name") || "").trim();
  const parentRaw = String(form.get("parent_id") || "").trim();
  const parentId = parentRaw ? Number(parentRaw) : null;
  const isActive = String(form.get("is_active") || "true") !== "false";

  if (!name) return NextResponse.json({ error: "Nama kategori wajib diisi" }, { status: 400 });
  if (name.length > 100) {
    return NextResponse.json({ error: "Nama kategori terlalu panjang" }, { status: 400 });
  }
  if (parentId !== null) {
    if (!Number.isInteger(parentId) || !(await getCategoryById(parentId))) {
      return NextResponse.json({ error: "Induk kategori tidak valid" }, { status: 400 });
    }
  }

  const id = await createCategory({ name, parentId, isActive });

  let imageUrl: string | null = null;
  const file = form.get("image");
  if (file instanceof File && file.size > 0) {
    try {
      const saved = await saveCategoryImage(file, id);
      imageUrl = saved.publicUrl;
      await setCategoryImage(id, imageUrl);
    } catch (err) {
      if (err instanceof UploadError) {
        return NextResponse.json({ error: err.message, id }, { status: 400 });
      }
      throw err;
    }
  }

  await writeAuditLog({
    adminId: admin.id,
    action: "create_category",
    entityType: "category",
    entityId: id,
    newValues: { name, parent_id: parentId, is_active: isActive, image: !!imageUrl },
    ipAddress: req.headers.get("x-forwarded-for"),
  });

  return NextResponse.json({ ok: true, id, image_url: imageUrl });
}
