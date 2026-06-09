"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Plus, Pencil, Trash2, FolderTree, CornerDownRight, ImagePlus } from "lucide-react";
import { Modal } from "@/components/admin/modal";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { confirm } from "@/components/ui/confirm";
import { toast } from "@/components/ui/toast";

export interface CategoryItem {
  id: number;
  name: string;
  slug: string;
  parent_id: number | null;
  image_url: string | null;
  sort_order: number;
  is_active: boolean;
  product_count: number;
}

function CatThumb({ url, name }: { url: string | null; name: string }) {
  if (!url) {
    return (
      <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-neutral-100 text-xs font-semibold text-neutral-400">
        {name.charAt(0).toUpperCase()}
      </span>
    );
  }
  return (
    <span className="relative h-9 w-9 flex-shrink-0 overflow-hidden rounded-lg bg-neutral-100 border border-neutral-200">
      <Image src={url} alt={name} fill sizes="36px" className="object-contain p-1" />
    </span>
  );
}

export function CategoriesView({ categories }: { categories: CategoryItem[] }) {
  const router = useRouter();
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<CategoryItem | null>(null);

  const [name, setName] = useState("");
  const [parentId, setParentId] = useState<string>("");
  const [isActive, setIsActive] = useState(true);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [removeImage, setRemoveImage] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<number | null>(null);

  function pickImage(f: File | null) {
    setImageFile(f);
    setImagePreview(f ? URL.createObjectURL(f) : null);
    setRemoveImage(f === null);
  }

  const topLevel = useMemo(
    () => categories.filter((c) => c.parent_id === null),
    [categories]
  );
  const childrenByParent = useMemo(() => {
    const map = new Map<number, CategoryItem[]>();
    for (const c of categories) {
      if (c.parent_id !== null) {
        const arr = map.get(c.parent_id) || [];
        arr.push(c);
        map.set(c.parent_id, arr);
      }
    }
    return map;
  }, [categories]);

  // Parent options = top-level categories (keep a 2-level tree). Exclude self when editing.
  const parentOptions = useMemo(
    () => topLevel.filter((c) => c.id !== editing?.id),
    [topLevel, editing]
  );

  function openCreate(presetParent?: number) {
    setEditing(null);
    setName("");
    setParentId(presetParent ? String(presetParent) : "");
    setIsActive(true);
    setImageFile(null);
    setImagePreview(null);
    setRemoveImage(false);
    setError(null);
    setModalOpen(true);
  }

  function openEdit(c: CategoryItem) {
    setEditing(c);
    setName(c.name);
    setParentId(c.parent_id ? String(c.parent_id) : "");
    setIsActive(c.is_active);
    setImageFile(null);
    setImagePreview(c.image_url);
    setRemoveImage(false);
    setError(null);
    setModalOpen(true);
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSaving(true);
    try {
      const fd = new FormData();
      fd.append("name", name);
      fd.append("parent_id", parentId);
      fd.append("is_active", String(isActive));
      if (imageFile) fd.append("image", imageFile);
      else if (removeImage) fd.append("remove_image", "true");

      const url = editing
        ? `/api/admin/master/categories/${editing.id}`
        : `/api/admin/master/categories`;
      const res = await fetch(url, {
        method: editing ? "PUT" : "POST",
        body: fd,
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Gagal menyimpan");
        return;
      }
      toast.success(editing ? "Kategori diperbarui" : "Kategori ditambahkan");
      setModalOpen(false);
      router.refresh();
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(c: CategoryItem) {
    const kids = childrenByParent.get(c.id)?.length || 0;
    const ok = await confirm({
      title: `Hapus kategori "${c.name}"?`,
      description:
        (kids > 0 ? `${kids} sub-kategori akan menjadi kategori utama. ` : "") +
        (c.product_count > 0
          ? `${c.product_count} produk akan kehilangan kategori ini.`
          : "Tindakan ini permanen."),
      confirmText: "Hapus",
      variant: "danger",
    });
    if (!ok) return;
    setBusyId(c.id);
    try {
      const res = await fetch(`/api/admin/master/categories/${c.id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Gagal menghapus");
        return;
      }
      toast.success("Kategori dihapus");
      router.refresh();
    } finally {
      setBusyId(null);
    }
  }

  function RowActions({ c }: { c: CategoryItem }) {
    const locked = c.slug === "lainnya";
    return (
      <div className="flex items-center gap-1">
        <button
          onClick={() => openEdit(c)}
          className="p-2 rounded-md text-neutral-500 hover:bg-neutral-100 hover:text-black"
          title="Edit"
        >
          <Pencil className="h-4 w-4" />
        </button>
        <button
          onClick={() => handleDelete(c)}
          disabled={busyId === c.id || locked}
          className="p-2 rounded-md text-neutral-500 hover:bg-red-50 hover:text-red-600 disabled:opacity-30 disabled:cursor-not-allowed"
          title={locked ? 'Kategori "Lainnya" tidak bisa dihapus' : "Hapus"}
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
    );
  }

  function StatusBadge({ active }: { active: boolean }) {
    return (
      <span
        className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium ${
          active ? "bg-emerald-50 text-emerald-700" : "bg-neutral-100 text-neutral-500"
        }`}
      >
        {active ? "Aktif" : "Nonaktif"}
      </span>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2 text-sm text-neutral-500">
          <FolderTree className="h-4 w-4" />
          {categories.length} kategori
        </div>
        <Button size="sm" onClick={() => openCreate()}>
          <Plus className="h-4 w-4" />
          Tambah Kategori
        </Button>
      </div>

      <div className="space-y-4">
        {topLevel.map((parent) => {
          const kids = childrenByParent.get(parent.id) || [];
          return (
            <div
              key={parent.id}
              className="bg-white rounded-xl border border-neutral-200 overflow-hidden"
            >
              <div className="flex items-center justify-between px-5 py-3 bg-neutral-50/60 border-b border-neutral-100">
                <div className="flex items-center gap-2 min-w-0">
                  <CatThumb url={parent.image_url} name={parent.name} />
                  <span className="font-semibold text-black truncate">{parent.name}</span>
                  <span className="text-xs text-neutral-400">/{parent.slug}</span>
                  <StatusBadge active={parent.is_active} />
                  {parent.product_count > 0 && (
                    <span className="text-xs text-neutral-400">
                      {parent.product_count} produk
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => openCreate(parent.id)}
                    className="p-2 rounded-md text-neutral-500 hover:bg-neutral-100 hover:text-black"
                    title="Tambah sub-kategori"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                  <RowActions c={parent} />
                </div>
              </div>

              {kids.length > 0 ? (
                <ul className="divide-y divide-neutral-100">
                  {kids.map((child) => (
                    <li
                      key={child.id}
                      className="flex items-center justify-between px-5 py-2.5 hover:bg-neutral-50"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <CornerDownRight className="h-3.5 w-3.5 text-neutral-300 flex-shrink-0" />
                        <CatThumb url={child.image_url} name={child.name} />
                        <span className="text-sm text-neutral-800 truncate">{child.name}</span>
                        <span className="text-xs text-neutral-400">/{child.slug}</span>
                        <StatusBadge active={child.is_active} />
                        {child.product_count > 0 && (
                          <span className="text-xs text-neutral-400">
                            {child.product_count} produk
                          </span>
                        )}
                      </div>
                      <RowActions c={child} />
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="px-5 py-3 text-xs text-neutral-400">Belum ada sub-kategori.</div>
              )}
            </div>
          );
        })}
      </div>

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? "Edit Kategori" : "Tambah Kategori"}
      >
        <form onSubmit={handleSave} className="space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-100 text-red-700 text-sm px-3 py-2 rounded-lg">
              {error}
            </div>
          )}
          <Input
            id="cat-name"
            label="Nama Kategori"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
          <div className="flex flex-col gap-1.5">
            <label htmlFor="cat-parent" className="text-sm font-medium text-neutral-700">
              Induk Kategori
            </label>
            <select
              id="cat-parent"
              value={parentId}
              onChange={(e) => setParentId(e.target.value)}
              className="h-11 w-full rounded-lg border border-neutral-300 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-black"
            >
              <option value="">(Tanpa induk — kategori utama)</option>
              {parentOptions.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
            <p className="text-xs text-neutral-400">
              Kosongkan untuk kategori utama (tampil di carousel etalase).
            </p>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-neutral-700">
              Gambar Kategori
            </label>
            <div className="flex items-center gap-3">
              <label className="relative flex h-16 w-16 flex-shrink-0 cursor-pointer items-center justify-center overflow-hidden rounded-xl border-2 border-dashed border-neutral-300 bg-neutral-50 hover:border-black transition-colors">
                {imagePreview ? (
                  <Image
                    src={imagePreview}
                    alt="Preview"
                    fill
                    sizes="64px"
                    className="object-contain p-1"
                  />
                ) : (
                  <ImagePlus className="h-5 w-5 text-neutral-400" />
                )}
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="hidden"
                  onChange={(e) => pickImage(e.target.files?.[0] ?? null)}
                />
              </label>
              <div className="text-xs text-neutral-400">
                JPG, PNG, atau WEBP (maks 5MB).
                <br />
                Tampil sebagai ikon di carousel etalase.
                {imagePreview && (
                  <button
                    type="button"
                    onClick={() => pickImage(null)}
                    className="block mt-1 text-red-500 hover:underline"
                  >
                    Hapus gambar
                  </button>
                )}
              </div>
            </div>
          </div>

          <label className="flex items-center gap-2 text-sm text-neutral-700">
            <input
              type="checkbox"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
              className="rounded border-neutral-300"
            />
            Aktif (tampil di etalase)
          </label>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => setModalOpen(false)}>
              Batal
            </Button>
            <Button type="submit" loading={saving}>
              {editing ? "Simpan" : "Tambah"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
