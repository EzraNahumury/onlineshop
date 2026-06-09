"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  UserCircle2,
  Clock,
  Receipt,
  MapPin,
  LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils";

const menuItems = [
  { href: "/account/profile", label: "Profil", icon: UserCircle2 },
  { href: "/account/orders/pending", label: "Pesanan Tertunda", icon: Clock },
  { href: "/account/orders/history", label: "Riwayat Pesanan", icon: Receipt },
  { href: "/account/addresses", label: "Buku Alamat", icon: MapPin },
];

export function AccountSidebar({
  userName,
  userEmail,
}: {
  userName: string;
  userEmail: string;
}) {
  const pathname = usePathname();
  const router = useRouter();

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/");
    router.refresh();
  }

  return (
    <aside className="bg-white rounded-2xl border border-neutral-100 overflow-hidden h-fit lg:sticky lg:top-28">
      <div className="px-5 py-5 border-b border-neutral-100">
        <div className="text-sm font-semibold text-black uppercase tracking-wide truncate">
          {userName}
        </div>
        <div className="text-xs text-neutral-500 truncate mt-0.5">
          {userEmail}
        </div>
      </div>

      <nav className="py-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-5 py-2.5 text-sm transition-colors",
                isActive
                  ? "bg-neutral-50 text-black font-medium"
                  : "text-neutral-700 hover:bg-neutral-50 hover:text-black"
              )}
            >
              <Icon className="h-4 w-4" />
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
    </aside>
  );
}
