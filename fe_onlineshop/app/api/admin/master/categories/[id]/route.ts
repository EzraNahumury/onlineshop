import { NextRequest, NextResponse } from "next/server";
import { getCurrentAdmin } from "@/lib/admin-auth";
import { writeAuditLog } from "@/lib/audit";
import {
  updateCategory,
  deleteCategory,
  getCategoryById,
  setCategoryImage,
} from "@/lib/queries/admin/categories";
import { saveCategoryImage, UploadError } from "@/lib/upload";

export async function PUT(
  req: NextRequest,
  ctx: { params: Promise<{ id: string }> }
) {
  const admin = await getCurrentAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await ctx.params;
  const categoryId = Number(id);
  if (!Number.isInteger(categoryId) || categoryId <= 0) {
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  }

  const existing = await getCategoryById(categoryId);
  if (!existing) return NextResponse.json({ error: "Kategori tidak ditemukan" }, { status: 404 });

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
  if (parentId !== null) {
    if (parentId === categoryId) {
      return NextResponse.json({ error: "Kategori tidak bisa menjadi induk dirinya sendiri" }, { status: 400 });
    }
    const parent = await getCategoryById(parentId);
    if (!parent) {
      return NextResponse.json({ error: "Induk kategori tidak valid" }, { status: 400 });
    }
    if (parent.parent_id === categoryId) {
      return NextResponse.json({ error: "Hierarki kategori tidak valid (memutar)" }, { status: 400 });
    }
  }

  await updateCategory(categoryId, { name, parentId, isActive });

  let newImageUrl: string | null = null;
  const file = form.get("image");
  if (file instanceof File && file.size > 0) {
    try {
      const saved = await saveCategoryImage(file, categoryId);
      newImageUrl = saved.publicUrl;
      await setCategoryImage(categoryId, newImageUrl);
    } catch (err) {
      if (err instanceof UploadError) {
        return NextResponse.json({ error: err.message }, { status: 400 });
      }
      throw err;
    }
  } else if (String(form.get("remove_image") || "") === "true") {
    await setCategoryImage(categoryId, null);
  }

  await writeAuditLog({
    adminId: admin.id,
    action: "update_category",
    entityType: "category",
    entityId: categoryId,
    oldValues: { name: existing.name, parent_id: existing.parent_id, is_active: existing.is_active },
    newValues: { name, parent_id: parentId, is_active: isActive, image_changed: !!newImageUrl },
    ipAddress: req.headers.get("x-forwarded-for"),
  });

  return NextResponse.json({ ok: true });
}

export async function DELETE(
  req: NextRequest,
  ctx: { params: Promise<{ id: string }> }
) {
  const admin = await getCurrentAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await ctx.params;
  const categoryId = Number(id);
  if (!Number.isInteger(categoryId) || categoryId <= 0) {
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  }

  const existing = await getCategoryById(categoryId);
  if (!existing) return NextResponse.json({ error: "Kategori tidak ditemukan" }, { status: 404 });

  if (existing.slug === "lainnya") {
    return NextResponse.json(
      { error: 'Kategori "Lainnya" tidak bisa dihapus.' },
      { status: 409 }
    );
  }

  await deleteCategory(categoryId);

  await writeAuditLog({
    adminId: admin.id,
    action: "delete_category",
    entityType: "category",
    entityId: categoryId,
    oldValues: { name: existing.name, slug: existing.slug },
    ipAddress: req.headers.get("x-forwarded-for"),
  });

  return NextResponse.json({ ok: true });
}
