"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Pencil, Trash2, ShieldCheck } from "lucide-react";
import { Modal } from "@/components/admin/modal";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { confirm } from "@/components/ui/confirm";
import { toast } from "@/components/ui/toast";

export interface AdminItem {
  id: number;
  name: string;
  email: string;
  role_id: number;
  role_name: string | null;
  is_active: boolean;
  last_login_at: string | null;
}

export interface RoleItem {
  id: number;
  name: string;
  description: string | null;
}

const ROLE_LABEL: Record<string, string> = {
  super_admin: "Super Admin",
  admin: "Admin",
  operator: "Operator",
};

function roleLabel(name: string | null) {
  if (!name) return "—";
  return ROLE_LABEL[name] || name;
}

export function RolesView({
  admins,
  roles,
  currentAdminId,
}: {
  admins: AdminItem[];
  roles: RoleItem[];
  currentAdminId: number;
}) {
  const router = useRouter();
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<AdminItem | null>(null);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [roleId, setRoleId] = useState<number>(roles[0]?.id ?? 1);
  const [isActive, setIsActive] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<number | null>(null);

  function openCreate() {
    setEditing(null);
    setName("");
    setEmail("");
    setPassword("");
    setRoleId(roles[0]?.id ?? 1);
    setIsActive(true);
    setError(null);
    setModalOpen(true);
  }

  function openEdit(a: AdminItem) {
    setEditing(a);
    setName(a.name);
    setEmail(a.email);
    setPassword("");
    setRoleId(a.role_id);
    setIsActive(a.is_active);
    setError(null);
    setModalOpen(true);
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSaving(true);
    try {
      const payload = {
        name,
        email,
        role_id: roleId,
        is_active: isActive,
        ...(password ? { password } : {}),
      };
      const url = editing
        ? `/api/admin/master/admins/${editing.id}`
        : `/api/admin/master/admins`;
      const res = await fetch(url, {
        method: editing ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Gagal menyimpan");
        return;
      }
      toast.success(editing ? "Akun diperbarui" : "Akun admin ditambahkan");
      setModalOpen(false);
      router.refresh();
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(a: AdminItem) {
    const ok = await confirm({
      title: `Hapus akun "${a.name}"?`,
      description: "Akun ini tidak akan bisa login lagi. Tindakan permanen.",
      confirmText: "Hapus",
      variant: "danger",
    });
    if (!ok) return;
    setBusyId(a.id);
    try {
      const res = await fetch(`/api/admin/master/admins/${a.id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Gagal menghapus");
        return;
      }
      toast.success("Akun dihapus");
      router.refresh();
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden">
      <div className="px-5 py-4 border-b border-neutral-200 flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm text-neutral-500">
          <ShieldCheck className="h-4 w-4" />
          {admins.length} akun admin
        </div>
        <Button size="sm" onClick={openCreate}>
          <Plus className="h-4 w-4" />
          Tambah Admin
        </Button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-neutral-50 text-xs uppercase tracking-wider text-neutral-500">
            <tr>
              <th className="text-left px-5 py-3 font-medium">Nama</th>
              <th className="text-left px-5 py-3 font-medium">Email</th>
              <th className="text-left px-5 py-3 font-medium">Role</th>
              <th className="text-left px-5 py-3 font-medium">Status</th>
              <th className="text-left px-5 py-3 font-medium">Login Terakhir</th>
              <th className="text-right px-5 py-3 font-medium">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100">
            {admins.map((a) => (
              <tr key={a.id} className="hover:bg-neutral-50">
                <td className="px-5 py-3 font-medium text-black">
                  {a.name}
                  {a.id === currentAdminId && (
                    <span className="ml-2 text-[10px] bg-neutral-200 text-neutral-600 px-1.5 py-0.5 rounded">
                      Anda
                    </span>
                  )}
                </td>
                <td className="px-5 py-3 text-neutral-600">{a.email}</td>
                <td className="px-5 py-3">
                  <span className="inline-flex items-center rounded-full bg-neutral-100 px-2.5 py-1 text-xs font-medium text-neutral-700">
                    {roleLabel(a.role_name)}
                  </span>
                </td>
                <td className="px-5 py-3">
                  <span
                    className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${
                      a.is_active
                        ? "bg-emerald-50 text-emerald-700"
                        : "bg-neutral-100 text-neutral-500"
                    }`}
                  >
                    {a.is_active ? "Aktif" : "Nonaktif"}
                  </span>
                </td>
                <td className="px-5 py-3 text-xs text-neutral-500">
                  {a.last_login_at
                    ? new Date(a.last_login_at).toLocaleString("id-ID")
                    : "Belum pernah"}
                </td>
                <td className="px-5 py-3">
                  <div className="flex items-center justify-end gap-1">
                    <button
                      onClick={() => openEdit(a)}
                      className="p-2 rounded-md text-neutral-500 hover:bg-neutral-100 hover:text-black"
                      title="Edit"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(a)}
                      disabled={busyId === a.id || a.id === currentAdminId}
                      className="p-2 rounded-md text-neutral-500 hover:bg-red-50 hover:text-red-600 disabled:opacity-30 disabled:cursor-not-allowed"
                      title={a.id === currentAdminId ? "Tidak bisa hapus diri sendiri" : "Hapus"}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? "Edit Akun Admin" : "Tambah Akun Admin"}
      >
        <form onSubmit={handleSave} className="space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-100 text-red-700 text-sm px-3 py-2 rounded-lg">
              {error}
            </div>
          )}
          <Input
            id="admin-name"
            label="Nama"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
          <Input
            id="admin-email"
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <Input
            id="admin-password"
            label={editing ? "Password (kosongkan jika tidak diubah)" : "Password"}
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required={!editing}
            placeholder={editing ? "••••••" : ""}
          />
          <div className="flex flex-col gap-1.5">
            <label htmlFor="admin-role" className="text-sm font-medium text-neutral-700">
              Role
            </label>
            <select
              id="admin-role"
              value={roleId}
              onChange={(e) => setRoleId(Number(e.target.value))}
              className="h-11 w-full rounded-lg border border-neutral-300 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-black"
            >
              {roles.map((r) => (
                <option key={r.id} value={r.id}>
                  {roleLabel(r.name)}
                  {r.description ? ` — ${r.description}` : ""}
                </option>
              ))}
            </select>
          </div>
          <label className="flex items-center gap-2 text-sm text-neutral-700">
            <input
              type="checkbox"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
              className="rounded border-neutral-300"
            />
            Akun aktif (bisa login)
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
