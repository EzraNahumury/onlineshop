"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  Megaphone,
  Sparkles,
  Database,
  ChevronDown,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

type NavChild = { href: string; label: string; matchTab?: string };
type NavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
  children?: NavChild[];
};

const navItems: NavItem[] = [
  { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  {
    href: "/admin/orders",
    label: "Pesanan",
    icon: ShoppingBag,
    children: [
      { href: "/admin/orders", label: "Semua Pesanan" },
      { href: "/admin/orders?tab=unpaid", label: "Belum Bayar", matchTab: "unpaid" },
      { href: "/admin/orders?tab=to_ship", label: "Perlu Dikirim", matchTab: "to_ship" },
      { href: "/admin/orders?tab=shipped", label: "Dikirim", matchTab: "shipped" },
      { href: "/admin/orders?tab=completed", label: "Selesai", matchTab: "completed" },
      { href: "/admin/orders?tab=returned", label: "Pengembalian", matchTab: "returned" },
    ],
  },
  {
    href: "/admin/products",
    label: "Produk",
    icon: Package,
    children: [
      { href: "/admin/products", label: "Daftar Produk" },
      { href: "/admin/products/create", label: "Tambah Produk" },
    ],
  },
  {
    href: "/admin/promotions",
    label: "Pusat Promosi",
    icon: Megaphone,
    children: [
      { href: "/admin/promotions", label: "Semua Promosi" },
      { href: "/admin/promotions/store/create", label: "Promo Toko" },
      { href: "/admin/promotions/package/create", label: "Paket Diskon" },
      { href: "/admin/promotions/combo/create", label: "Kombo Hemat" },
    ],
  },
  {
    href: "/admin/display-promos",
    label: "Display Promo",
    icon: Sparkles,
  },
  {
    href: "/admin/master",
    label: "Master",
    icon: Database,
    children: [
      { href: "/admin/master/roles", label: "Role" },
      { href: "/admin/master/categories", label: "Kategori" },
      { href: "/admin/master/jne-destinations", label: "Kode Tujuan JNE" },
    ],
  },
];

export function AdminSidebar({
  adminName,
  adminRole,
  logoutSlot,
}: {
  adminName: string;
  adminRole: string;
  logoutSlot: React.ReactNode;
}) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentTab = searchParams.get("tab");

  const isChildActive = (item: NavItem) => {
    if (!item.children) return false;
    return item.children.some((c) => isChildMatch(c, pathname, currentTab));
  };

  const [openMap, setOpenMap] = useState<Record<string, boolean>>(() => {
    const init: Record<string, boolean> = {};
    for (const item of navItems) {
      if (item.children && pathname.startsWith(item.href)) init[item.href] = true;
    }
    return init;
  });

  useEffect(() => {
    setOpenMap((prev) => {
      const next = { ...prev };
      for (const item of navItems) {
        if (item.children && pathname.startsWith(item.href)) next[item.href] = true;
      }
      return next;
    });
  }, [pathname]);

  const toggle = (key: string) =>
    setOpenMap((prev) => ({ ...prev, [key]: !prev[key] }));

  return (
    <aside className="w-64 bg-neutral-950 text-white flex flex-col flex-shrink-0 sticky top-0 h-screen">
      <div className="px-6 py-6 border-b border-neutral-800">
        <Image
          src="/logo/ayres-logo.png"
          alt="AYRES"
          width={140}
          height={36}
          priority
          className="h-8 w-auto"
        />
        <p className="text-xs text-neutral-500 mt-2 tracking-[0.2em]">
          ADMIN PANEL
        </p>
      </div>

      <nav className="flex-1 px-3 py-4 flex flex-col gap-1 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const parentActive = pathname.startsWith(item.href);
          const childActive = isChildActive(item);
          const isOpen = openMap[item.href] ?? parentActive;

          if (!item.children) {
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors",
                  parentActive
                    ? "bg-white/10 text-white"
                    : "text-neutral-400 hover:bg-neutral-800 hover:text-white"
                )}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          }

          return (
            <div key={item.href} className="flex flex-col">
              <button
                type="button"
                onClick={() => toggle(item.href)}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors w-full text-left",
                  parentActive && !childActive
                    ? "bg-white/10 text-white"
                    : "text-neutral-400 hover:bg-neutral-800 hover:text-white"
                )}
                aria-expanded={isOpen}
              >
                <Icon className="h-4 w-4" />
                <span className="flex-1">{item.label}</span>
                <ChevronDown
                  className={cn(
                    "h-3.5 w-3.5 transition-transform duration-200",
                    isOpen ? "rotate-0" : "-rotate-90"
                  )}
                />
              </button>

              {isOpen && (
                <div className="mt-1 ml-7 pl-3 border-l border-neutral-800 flex flex-col gap-0.5">
                  {item.children.map((child) => {
                    const active = isChildMatch(child, pathname, currentTab);
                    return (
                      <Link
                        key={child.href}
                        href={child.href}
                        className={cn(
                          "px-3 py-1.5 rounded-md text-[13px] transition-colors",
                          active
                            ? "bg-white/10 text-white"
                            : "text-neutral-500 hover:bg-neutral-800 hover:text-white"
                        )}
                      >
                        {child.label}
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      <div className="px-4 py-4 border-t border-neutral-800">
        <div className="text-sm font-medium">{adminName}</div>
        <div className="text-xs text-neutral-500 mb-3">{adminRole}</div>
        {logoutSlot}
      </div>
    </aside>
  );
}

function isChildMatch(
  child: NavChild,
  pathname: string,
  currentTab: string | null
) {
  const [childPath] = child.href.split("?");
  if (pathname !== childPath) return false;
  if (child.matchTab) return currentTab === child.matchTab;
  // "Semua" / base route children: active only when no tab filter
  if (child.href === childPath) return !currentTab;
  return true;
}
