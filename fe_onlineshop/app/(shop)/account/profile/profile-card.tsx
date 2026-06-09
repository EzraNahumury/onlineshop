"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, Pencil, Trash2, X } from "lucide-react";
import { confirm } from "@/components/ui/confirm";
import { toast } from "@/components/ui/toast";

export function ProfileCard({
  name,
  email,
  phone,
  emailVerified,
  address,
}: {
  name: string;
  email: string;
  phone: string | null;
  emailVerified: boolean;
  address: string | null;
}) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [deleting, setDeleting] = useState(false);

  async function handleDelete() {
    const ok = await confirm({
      title: "Hapus akun Anda?",
      description:
        "Akun akan dinonaktifkan permanen. Pesanan & riwayat transaksi tetap tersimpan. Anda tidak bisa login lagi dengan email ini.",
      confirmText: "Hapus Akun",
      variant: "danger",
    });
    if (!ok) return;

    setDeleting(true);
    try {
      const res = await fetch("/api/account/profile", { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        toast.error(data.error || "Gagal menghapus akun");
        return;
      }
      toast.success("Akun berhasil dihapus");
      router.push("/");
      router.refresh();
    } finally {
      setDeleting(false);
    }
  }

  return (
    <>
      <div className="bg-white rounded-2xl border border-neutral-100 p-5 sm:p-6 space-y-5">
        <Field label="Nama Lengkap">
          <span className="uppercase tracking-wide">{name}</span>
        </Field>

        <Field
          label={
            <span className="inline-flex items-center gap-1.5">
              Email
              {emailVerified && (
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
              )}
            </span>
          }
        >
          {email}
        </Field>

        <Field
          label="Nomor Telepon"
          action={<EditIconButton onClick={() => setEditing(true)} />}
        >
          {phone || <span className="text-neutral-400">Belum diatur</span>}
        </Field>

        <Field label="Alamat">
          {address ? (
            address
          ) : (
            <span className="text-neutral-400">Belum diatur</span>
          )}
        </Field>

        <div className="pt-4 border-t border-neutral-100 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={handleDelete}
            disabled={deleting}
            className="inline-flex items-center gap-1.5 h-10 px-4 rounded-lg border border-red-200 text-red-600 text-sm font-medium hover:bg-red-50 transition-colors disabled:opacity-50"
          >
            <Trash2 className="h-4 w-4" />
            {deleting ? "Menghapus..." : "Hapus Akun"}
          </button>
          <button
            type="button"
            onClick={() => setEditing(true)}
            className="inline-flex items-center gap-1.5 h-10 px-4 rounded-lg border border-neutral-200 text-neutral-800 text-sm font-medium hover:bg-neutral-50 transition-colors"
          >
            <Pencil className="h-4 w-4" />
            Ubah Info
          </button>
        </div>
      </div>

      {editing && (
        <EditModal
          initialName={name}
          initialPhone={phone || ""}
          email={email}
          onClose={() => setEditing(false)}
          onSaved={() => {
            setEditing(false);
            router.refresh();
          }}
        />
      )}
    </>
  );
}

function Field({
  label,
  action,
  children,
}: {
  label: React.ReactNode;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="text-xs text-neutral-500 mb-1">{label}</div>
      <div className="flex items-center gap-2 text-sm font-medium text-black">
        {children}
        {action}
      </div>
    </div>
  );
}

function EditIconButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-6 h-6 rounded-md text-neutral-400 hover:text-black hover:bg-neutral-100 flex items-center justify-center transition-colors"
      aria-label="Edit"
    >
      <Pencil className="h-3.5 w-3.5" />
    </button>
  );
}

function EditModal({
  initialName,
  initialPhone,
  email,
  onClose,
  onSaved,
}: {
  initialName: string;
  initialPhone: string;
  email: string;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [name, setName] = useState(initialName);
  const [phone, setPhone] = useState(initialPhone);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSaving(true);
    try {
      const res = await fetch("/api/account/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, phone }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Gagal menyimpan");
        return;
      }
      toast.success("Profil diperbarui");
      onSaved();
    } finally {
      setSaving(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
    >
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm ui-fade-in"
        onClick={onClose}
      />
      <form
        onSubmit={handleSubmit}
        className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden ui-dialog-in"
      >
        <div className="px-6 py-4 border-b border-neutral-100 flex items-center justify-between">
          <h2 className="text-base font-semibold text-black">Ubah Info</h2>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-lg text-neutral-500 hover:bg-neutral-100 flex items-center justify-center"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          {error && (
            <div className="bg-red-50 text-red-700 border border-red-100 text-sm px-3 py-2 rounded-lg">
              {error}
            </div>
          )}

          <div>
            <label className="text-sm font-medium text-neutral-700 block mb-1.5">
              Nama Lengkap
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full h-10 rounded-lg border border-neutral-300 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-neutral-700 block mb-1.5">
              Nomor Telepon
            </label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="08xxxxxxxxxx"
              className="w-full h-10 rounded-lg border border-neutral-300 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-neutral-500 block mb-1.5">
              Email (tidak bisa diubah)
            </label>
            <input
              type="email"
              value={email}
              readOnly
              disabled
              className="w-full h-10 rounded-lg border border-neutral-200 bg-neutral-50 px-3 text-sm text-neutral-500"
            />
          </div>
        </div>

        <div className="px-6 py-4 bg-neutral-50 border-t border-neutral-100 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="h-10 px-4 rounded-lg border border-neutral-200 bg-white text-sm font-medium text-neutral-700 hover:bg-neutral-50"
          >
            Batal
          </button>
          <button
            type="submit"
            disabled={saving}
            className="h-10 px-5 rounded-lg bg-black text-white text-sm font-medium hover:bg-neutral-800 disabled:opacity-60"
          >
            {saving ? "Menyimpan..." : "Simpan"}
          </button>
        </div>
      </form>
    </div>
  );
}
