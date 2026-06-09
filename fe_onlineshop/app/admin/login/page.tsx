"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, ShieldCheck, Mail, Lock } from "lucide-react";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [emailFocus, setEmailFocus] = useState(false);
  const [passwordFocus, setPasswordFocus] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Login failed");
        return;
      }
      router.push("/admin/dashboard");
      router.refresh();
    } catch {
      setError("Terjadi kesalahan jaringan. Coba lagi.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative min-h-screen flex flex-col bg-black text-white overflow-hidden">
      {/* Mesh background */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(circle at 20% 10%, rgba(100,100,100,0.22), transparent 40%), radial-gradient(circle at 85% 70%, rgba(200,169,110,0.15), transparent 45%), radial-gradient(circle at 50% 100%, rgba(80,80,80,0.2), transparent 50%)",
        }}
      />
      <div
        aria-hidden
        className="auth-bg-blob pointer-events-none absolute -top-40 -left-40 h-[28rem] w-[28rem] rounded-full bg-white/5 blur-3xl"
      />
      <div
        aria-hidden
        className="auth-bg-blob pointer-events-none absolute -bottom-48 -right-40 h-[34rem] w-[34rem] rounded-full bg-amber-500/10 blur-3xl"
        style={{ animationDelay: "-6s" }}
      />
      {/* Animated grid overlay */}
      <div
        aria-hidden
        className="admin-grid-bg pointer-events-none absolute inset-0"
      />
      {/* Diagonal scanline highlight */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 overflow-hidden"
      >
        <div
          className="admin-scanline absolute -inset-x-40 -inset-y-40 w-[140%] h-[140%]"
          style={{
            background:
              "linear-gradient(115deg, transparent 45%, rgba(255,255,255,0.04) 50%, transparent 55%)",
          }}
        />
      </div>

      <header className="relative flex flex-col items-center justify-center py-10 gap-3 z-10">
        <Image
          src="/logo/ayres-logo.png"
          alt="AYRES"
          width={220}
          height={56}
          priority
          className="h-12 w-auto"
        />
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/10 bg-white/5 backdrop-blur">
          <ShieldCheck className="h-3.5 w-3.5 text-amber-300" />
          <span className="text-[10px] tracking-[0.3em] uppercase text-neutral-300">
            Admin Panel
          </span>
        </div>
      </header>

      <main className="relative flex-1 flex items-start justify-center px-4 pb-16 z-10">
        <div className="w-full max-w-md animate-auth-card">
          <div className="relative bg-white/[0.04] backdrop-blur-2xl rounded-3xl border border-white/10 p-8 sm:p-10 shadow-[0_30px_80px_-20px_rgba(0,0,0,0.8)]">
            {/* Top highlight line */}
            <div
              aria-hidden
              className="absolute inset-x-10 top-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent"
            />

            <div className="text-center mb-8">
              <h1 className="font-display text-3xl font-medium tracking-tight mb-2">
                Admin Sign In
              </h1>
              <p className="text-sm text-neutral-400">
                Area terbatas. Hanya untuk personel resmi.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 animate-auth-stagger">
              {error && (
                <div className="bg-red-500/10 border border-red-500/30 text-red-300 text-sm px-4 py-3 rounded-2xl flex items-start gap-2 animate-auth-card">
                  <span className="block flex-shrink-0 w-1 h-1 rounded-full bg-red-400 mt-1.5" />
                  <span>{error}</span>
                </div>
              )}

              {/* Email input (dark themed floating) */}
              <div
                className={[
                  "relative rounded-2xl border bg-white/[0.03] transition-all duration-200",
                  emailFocus
                    ? "border-white/40 ring-4 ring-white/5"
                    : "border-white/10 hover:border-white/20",
                ].join(" ")}
              >
                <label
                  htmlFor="admin-email"
                  className={[
                    "pointer-events-none absolute left-11 transition-all duration-200 ease-out font-medium",
                    email || emailFocus
                      ? "top-2 text-[10px] uppercase tracking-wider text-neutral-400"
                      : "top-1/2 -translate-y-1/2 text-sm text-neutral-500",
                  ].join(" ")}
                >
                  Email
                </label>
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-500 pointer-events-none" />
                <input
                  id="admin-email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onFocus={() => setEmailFocus(true)}
                  onBlur={() => setEmailFocus(false)}
                  required
                  className="w-full bg-transparent pl-11 pr-4 pt-6 pb-2 text-sm text-white focus:outline-none placeholder:text-neutral-600"
                />
              </div>

              {/* Password input */}
              <div
                className={[
                  "relative rounded-2xl border bg-white/[0.03] transition-all duration-200",
                  passwordFocus
                    ? "border-white/40 ring-4 ring-white/5"
                    : "border-white/10 hover:border-white/20",
                ].join(" ")}
              >
                <label
                  htmlFor="admin-password"
                  className={[
                    "pointer-events-none absolute left-11 transition-all duration-200 ease-out font-medium",
                    password || passwordFocus
                      ? "top-2 text-[10px] uppercase tracking-wider text-neutral-400"
                      : "top-1/2 -translate-y-1/2 text-sm text-neutral-500",
                  ].join(" ")}
                >
                  Password
                </label>
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-500 pointer-events-none" />
                <input
                  id="admin-password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onFocus={() => setPasswordFocus(true)}
                  onBlur={() => setPasswordFocus(false)}
                  required
                  className="w-full bg-transparent pl-11 pr-12 pt-6 pb-2 text-sm text-white focus:outline-none placeholder:text-neutral-600"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  tabIndex={-1}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-neutral-500 hover:text-white transition-colors"
                  aria-label={showPassword ? "Sembunyikan password" : "Tampilkan password"}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="group relative w-full h-12 mt-2 rounded-2xl bg-gradient-to-b from-white to-neutral-200 text-black text-sm font-semibold shadow-[0_8px_24px_-6px_rgba(255,255,255,0.15)] hover:shadow-[0_10px_30px_-6px_rgba(255,255,255,0.25)] hover:from-white hover:to-white transition-all duration-200 active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <svg
                      className="h-4 w-4 animate-spin"
                      viewBox="0 0 24 24"
                      fill="none"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                      />
                    </svg>
                    Memverifikasi…
                  </>
                ) : (
                  <>
                    Sign In
                    <svg
                      className="h-4 w-4 transition-transform group-hover:translate-x-0.5"
                      viewBox="0 0 24 24"
                      fill="none"
                    >
                      <path
                        d="M5 12h14m0 0-6-6m6 6-6 6"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </>
                )}
              </button>
            </form>

            <p className="mt-8 text-center text-xs text-neutral-500">
              Akses panel ini dibatasi. Aktivitas Anda direkam di audit log.
            </p>
          </div>

          <p className="mt-6 text-center text-[11px] text-neutral-600">
            &copy; {new Date().getFullYear()} AYRES Admin Panel · Secure session
          </p>
        </div>
      </main>
    </div>
  );
}
