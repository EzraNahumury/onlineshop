"use client";

import { useState } from "react";
import { X, Eye, EyeOff } from "lucide-react";
import { toast } from "@/components/ui/toast";

export function PasswordCard() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <div className="bg-white rounded-2xl border border-neutral-100 p-5 flex items-center justify-between gap-4">
        <div>
          <div className="text-base font-medium text-black">Kata Sandi</div>
          <div className="text-sm text-neutral-500 mt-0.5">
            Apakah kamu ingin mengubah kata sandi?
          </div>
        </div>
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="h-10 px-5 rounded-lg bg-black text-white text-sm font-medium hover:bg-neutral-800 transition-colors"
        >
          Ganti Sandi
        </button>
      </div>

      {open && <PasswordModal onClose={() => setOpen(false)} />}
    </>
  );
}

function PasswordModal({ onClose }: { onClose: () => void }) {
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNext, setShowNext] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!current || !next) {
      setError("Semua field wajib diisi.");
      return;
    }
    if (next.length < 8) {
      setError("Kata sandi baru minimal 8 karakter.");
      return;
    }
    if (next !== confirm) {
      setError("Konfirmasi kata sandi tidak cocok.");
      return;
    }
    if (current === next) {
      setError("Kata sandi baru tidak boleh sama dengan yang lama.");
      return;
    }

    setSaving(true);
    try {
      const res = await fetch("/api/account/password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword: current, newPassword: next }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Gagal mengubah kata sandi");
        return;
      }
      toast.success("Kata sandi berhasil diubah");
      onClose();
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
          <h2 className="text-base font-semibold text-black">Ganti Kata Sandi</h2>
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

          <PasswordField
            label="Kata Sandi Saat Ini"
            value={current}
            onChange={setCurrent}
            show={showCurrent}
            onToggle={() => setShowCurrent((v) => !v)}
            autoFocus
          />

          <PasswordField
            label="Kata Sandi Baru"
            value={next}
            onChange={setNext}
            show={showNext}
            onToggle={() => setShowNext((v) => !v)}
            hint="Minimal 8 karakter"
          />

          <PasswordField
            label="Konfirmasi Kata Sandi Baru"
            value={confirm}
            onChange={setConfirm}
            show={showNext}
            onToggle={() => setShowNext((v) => !v)}
          />
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

function PasswordField({
  label,
  value,
  onChange,
  show,
  onToggle,
  hint,
  autoFocus,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  show: boolean;
  onToggle: () => void;
  hint?: string;
  autoFocus?: boolean;
}) {
  return (
    <div>
      <label className="text-sm font-medium text-neutral-700 block mb-1.5">
        {label}
      </label>
      <div className="relative">
        <input
          type={show ? "text" : "password"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          autoFocus={autoFocus}
          className="w-full h-10 rounded-lg border border-neutral-300 bg-white pl-3 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
        />
        <button
          type="button"
          onClick={onToggle}
          className="absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-md text-neutral-400 hover:text-black hover:bg-neutral-100 flex items-center justify-center"
          aria-label={show ? "Sembunyikan" : "Tampilkan"}
        >
          {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      </div>
      {hint && <p className="text-xs text-neutral-400 mt-1">{hint}</p>}
    </div>
  );
}
