"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import {
  User,
  UserCircle2,
  Clock,
  Receipt,
  MapPin,
  LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils";

type MeUser = { id: number; name: string; email: string } | null;

const menuItems = [
  { href: "/account/profile", label: "Profil", icon: UserCircle2 },
  { href: "/account/orders/pending", label: "Pesanan Tertunda", icon: Clock },
  { href: "/account/orders/history", label: "Riwayat Pesanan", icon: Receipt },
  { href: "/account/addresses", label: "Buku Alamat", icon: MapPin },
];

export function UserMenu({
  className,
  initialUser,
}: {
  className?: string;
  initialUser?: MeUser;
}) {
  const router = useRouter();
  // User state is known from the server (via the layout) — no fetch delay,
  // no race condition when navigating back from other pages.
  const [user, setUser] = useState<MeUser>(initialUser ?? null);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Keep client state in sync when the server prop changes (e.g. after login).
  useEffect(() => {
    setUser(initialUser ?? null);
  }, [initialUser]);

  useEffect(() => {
    if (!open) return;
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    setUser(null);
    setOpen(false);
    router.push("/");
    router.refresh();
  }

  if (!user) {
    return (
      <Link
        href="/login"
        className={cn(
          "p-2.5 text-neutral-700 hover:text-black transition-colors",
          className
        )}
        aria-label="Login"
      >
        <User className="h-5 w-5" />
      </Link>
    );
  }

  return (
    <div ref={ref} className={cn("relative", className)}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="p-2.5 text-neutral-700 hover:text-black transition-colors flex items-center justify-center"
        aria-label="Account menu"
        aria-expanded={open}
      >
        <User className="h-5 w-5" />
      </button>

      {open && user && (
        <div className="absolute right-0 top-full mt-2 w-72 bg-white rounded-xl shadow-xl border border-neutral-100 overflow-hidden ui-dialog-in z-50">
          <div className="px-5 py-4 border-b border-neutral-100">
            <div className="text-sm font-semibold text-black tracking-wide uppercase truncate">
              {user.name}
            </div>
            <div className="text-xs text-neutral-500 truncate mt-0.5">
              {user.email}
            </div>
          </div>

          <nav className="py-2">
            {menuItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-3 px-5 py-2.5 text-sm text-neutral-700 hover:bg-neutral-50 hover:text-black transition-colors"
                >
                  <Icon className="h-4 w-4 text-neutral-500" />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <button
            type="button"
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-5 py-3 text-sm text-neutral-700 hover:bg-neutral-50 hover:text-red-600 border-t border-neutral-100 transition-colors"
          >
            <LogOut className="h-4 w-4" />
            Keluar
          </button>
        </div>
      )}
    </div>
  );
}
