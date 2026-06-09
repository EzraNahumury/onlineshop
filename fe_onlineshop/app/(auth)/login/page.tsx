"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";
import { FloatingInput } from "@/components/ui/floating-input";
import { GoogleButton } from "@/components/shop/google-button";

function LoginInner() {
  const router = useRouter();
  const search = useSearchParams();
  const oauthError = search.get("error");
  const nextParam = search.get("next");
  // Only allow same-origin relative paths to prevent open-redirect.
  const safeNext =
    nextParam && nextParam.startsWith("/") && !nextParam.startsWith("//")
      ? nextParam
      : "/";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [emailError, setEmailError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (oauthError) setError(oauthError);
  }, [oauthError]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setEmailError(null);
    setPasswordError(null);

    let valid = true;
    if (!email.trim()) {
      setEmailError("Email wajib diisi");
      valid = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setEmailError("Format email tidak valid");
      valid = false;
    }
    if (!password) {
      setPasswordError("Password wajib diisi");
      valid = false;
    }
    if (!valid) return;

    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Login gagal");
        return;
      }
      router.push(safeNext);
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
            Selamat Datang
          </h1>
          <p className="text-sm text-neutral-500 mt-2">
            Masuk untuk melanjutkan ke akun AYRES Anda
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
            id="email"
            type="email"
            label="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            error={emailError}
            autoComplete="email"
            required
          />

          <FloatingInput
            id="password"
            type={showPassword ? "text" : "password"}
            label="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            error={passwordError}
            autoComplete="current-password"
            required
            rightSlot={
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                tabIndex={-1}
                className="text-neutral-400 hover:text-neutral-700 transition-colors p-1"
                aria-label={showPassword ? "Sembunyikan password" : "Tampilkan password"}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            }
          />

          <div className="flex justify-end">
            <Link
              href="/forgot-password"
              className="text-xs text-neutral-500 hover:text-black transition-colors"
            >
              Lupa password?
            </Link>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="relative w-full h-12 mt-2 rounded-2xl bg-gradient-to-b from-neutral-800 to-black text-white text-sm font-medium shadow-[0_4px_20px_-4px_rgba(0,0,0,0.3)] hover:shadow-[0_6px_24px_-4px_rgba(0,0,0,0.4)] hover:from-black hover:to-black transition-all duration-200 active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Memverifikasi…
              </>
            ) : (
              "Masuk"
            )}
          </button>
        </form>

        <div className="my-6 flex items-center gap-3">
          <div className="flex-1 h-px bg-neutral-200" />
          <span className="text-[10px] uppercase tracking-[0.25em] text-neutral-400 font-medium">
            Atau
          </span>
          <div className="flex-1 h-px bg-neutral-200" />
        </div>

        <GoogleButton label="Lanjutkan dengan Google" />

        <p className="mt-8 text-center text-sm text-neutral-500">
          Belum punya akun?{" "}
          <Link
            href="/register"
            className="font-semibold text-black hover:underline underline-offset-4"
          >
            Daftar gratis
          </Link>
        </p>
      </div>

      <p className="mt-6 text-center text-xs text-neutral-400 px-8 leading-relaxed">
        Dengan masuk, Anda menyetujui{" "}
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

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginInner />
    </Suspense>
  );
}
