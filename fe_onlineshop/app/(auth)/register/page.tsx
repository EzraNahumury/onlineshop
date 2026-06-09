"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FloatingInput } from "@/components/ui/floating-input";
import { Eye, EyeOff } from "lucide-react";
import { GoogleButton } from "@/components/shop/google-button";

export default function RegisterPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string | null>>({});

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function validateForm(): boolean {
    const errs: Record<string, string | null> = {};
    if (!name.trim()) errs.name = "Nama wajib diisi";
    if (!email.trim()) errs.email = "Email wajib diisi";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      errs.email = "Format email tidak valid";
    const phoneClean = phone.replace(/\s|-/g, "");
    if (!phoneClean) errs.phone = "No. HP wajib diisi";
    else if (!/^(\+62|62|0)8\d{7,13}$/.test(phoneClean))
      errs.phone = "Format tidak valid (contoh: 08xxxxxxxxxx)";
    if (!password) errs.password = "Password wajib diisi";
    else if (password.length < 6) errs.password = "Minimal 6 karakter";
    if (password !== confirmPassword)
      errs.confirmPassword = "Password tidak cocok";
    setFieldErrors(errs);
    return Object.keys(errs).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!validateForm()) return;

    setLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, phone, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Pendaftaran gagal");
        return;
      }
      // Akun dibuat & otomatis login (cookie token sudah di-set server).
      router.push("/");
      router.refresh();
    } catch {
      setError("Terjadi kesalahan jaringan. Coba lagi.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="w-full max-w-md animate-auth-card">
      <div className="bg-white/70 backdrop-blur-2xl rounded-3xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.12)] border border-white/80 p-8 sm:p-10">
        <div className="mb-8 text-center">
          <h1 className="font-display text-3xl sm:text-[2rem] font-medium text-black tracking-tight">
            Buat Akun
          </h1>
          <p className="text-sm text-neutral-500 mt-2">
            Bergabung dengan AYRES untuk akses eksklusif & checkout cepat
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 animate-auth-stagger">
          {error && (
            <div className="bg-red-50 border border-red-100 text-red-700 text-sm px-4 py-3 rounded-2xl flex items-start gap-2 animate-auth-card">
              <span className="block flex-shrink-0 w-1 h-1 rounded-full bg-red-500 mt-1.5" />
              <span>{error}</span>
            </div>
          )}

          <FloatingInput
            id="name"
            label="Nama Lengkap"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            error={fieldErrors.name}
            autoComplete="name"
            required
          />

          <FloatingInput
            id="email"
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            error={fieldErrors.email}
            autoComplete="email"
            required
          />

          <FloatingInput
            id="phone"
            label="No. HP"
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            error={fieldErrors.phone}
            autoComplete="tel"
            required
          />

          <FloatingInput
            id="password"
            label="Password"
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            error={fieldErrors.password}
            autoComplete="new-password"
            required
            rightSlot={
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                tabIndex={-1}
                className="text-neutral-400 hover:text-neutral-700 transition-colors p-1"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            }
          />

          <FloatingInput
            id="confirmPassword"
            label="Konfirmasi Password"
            type={showPassword ? "text" : "password"}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            error={fieldErrors.confirmPassword}
            autoComplete="new-password"
            required
          />

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="relative w-full h-12 rounded-2xl bg-gradient-to-b from-neutral-800 to-black text-white text-sm font-medium shadow-[0_4px_20px_-4px_rgba(0,0,0,0.3)] hover:shadow-[0_6px_24px_-4px_rgba(0,0,0,0.4)] hover:from-black hover:to-black transition-all duration-200 active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading && (
                <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
              )}
              {loading ? "Memproses…" : "Buat Akun"}
            </button>
          </div>
        </form>

        <div className="my-6 flex items-center gap-3">
          <div className="flex-1 h-px bg-neutral-200" />
          <span className="text-[10px] uppercase tracking-[0.25em] text-neutral-400 font-medium">
            Atau
          </span>
          <div className="flex-1 h-px bg-neutral-200" />
        </div>

        <GoogleButton label="Daftar dengan Google" />

        <p className="mt-8 text-center text-sm text-neutral-500">
          Sudah punya akun?{" "}
          <Link
            href="/login"
            className="font-semibold text-black hover:underline underline-offset-4"
          >
            Masuk
          </Link>
        </p>
      </div>

      <p className="mt-6 text-center text-xs text-neutral-400 px-8 leading-relaxed">
        Dengan mendaftar, Anda menyetujui{" "}
        <Link href="/terms" className="text-neutral-600 hover:text-black underline">
          Syarat & Ketentuan
        </Link>{" "}
        dan{" "}
        <Link href="/privacy" className="text-neutral-600 hover:text-black underline">
          Kebijakan Privasi
        </Link>{" "}
        AYRES.
      </p>
    </div>
  );
}
