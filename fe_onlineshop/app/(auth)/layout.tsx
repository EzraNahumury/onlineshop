import Link from "next/link";
import Image from "next/image";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative min-h-screen flex flex-col bg-gradient-to-br from-neutral-50 via-white to-neutral-100 overflow-hidden">
      {/* Decorative background blobs */}
      <div
        aria-hidden
        className="auth-bg-blob pointer-events-none absolute -top-32 -left-32 h-[28rem] w-[28rem] rounded-full bg-gradient-to-br from-neutral-300/40 to-transparent blur-3xl"
      />
      <div
        aria-hidden
        className="auth-bg-blob pointer-events-none absolute -bottom-40 -right-32 h-[32rem] w-[32rem] rounded-full bg-gradient-to-tr from-red-200/40 to-transparent blur-3xl"
        style={{ animationDelay: "-6s" }}
      />

      <header className="relative flex items-center justify-center py-8 z-10">
        <Link href="/" aria-label="AYRES home">
          <Image
            src="/logo/ayres-logo.png"
            alt="AYRES"
            width={220}
            height={56}
            priority
            className="h-12 w-auto invert"
          />
        </Link>
      </header>

      <main className="relative flex-1 flex items-start justify-center px-4 pb-16 z-10">
        {children}
      </main>

      <footer className="relative py-6 text-center z-10">
        <p className="text-xs text-neutral-400">
          &copy; {new Date().getFullYear()} AYRES. All rights reserved.
        </p>
      </footer>
    </div>
  );
}
