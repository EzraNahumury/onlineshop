"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import {
  Search,
  ShoppingBag,
  User,
  Menu,
  X,
  Heart,
  ChevronDown,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { CartBadge } from "./cart-badge";
import { LanguageSwitcher } from "./language-switcher";
import { UserMenu } from "./user-menu";
import { useT, type DictKey } from "@/lib/i18n";

interface NavColumn {
  titleKey: DictKey;
  items: { key: DictKey; href: string }[];
}

interface NavItem {
  key: DictKey;
  href: string;
  columns?: NavColumn[];
}

const navigation: NavItem[] = [
  {
    key: "nav.products",
    href: "/collections",
    columns: [
      {
        titleKey: "nav.col.apparel",
        items: [
          { key: "nav.tshirt", href: "/collections/t-shirt" },
          { key: "nav.poloShirt", href: "/collections/polo-shirt" },
          { key: "nav.shirt", href: "/collections/shirt" },
          { key: "nav.vest", href: "/collections/vest" },
          { key: "nav.jersey", href: "/collections/jersey" },
          { key: "nav.jacket", href: "/collections/jacket" },
          { key: "nav.shorts", href: "/collections/shorts" },
          { key: "nav.pants", href: "/collections/pants" },
        ],
      },
      {
        titleKey: "nav.col.protective",
        items: [
          { key: "nav.shinguard", href: "/collections/shinguard" },
          { key: "nav.elbowPad", href: "/collections/elbow-pad" },
          { key: "nav.kneePad", href: "/collections/knee-pad" },
        ],
      },
      {
        titleKey: "nav.col.accessories",
        items: [
          { key: "nav.cap", href: "/collections/cap" },
          { key: "nav.socks", href: "/collections/socks" },
        ],
      },
    ],
  },
  { key: "nav.apparel", href: "/collections/apparel" },
  { key: "nav.protective", href: "/collections/protective" },
  { key: "nav.accessories", href: "/collections/accessories" },
  { key: "nav.sale", href: "/collections/sale" },
];

export function Header({
  initialUser,
}: {
  initialUser?: { id: number; name: string; email: string } | null;
}) {
  const { t } = useT();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [mobileExpanded, setMobileExpanded] = useState<string | null>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  function handleSearchSubmit(e: React.FormEvent) {
    e.preventDefault();
    const q = searchQuery.trim();
    if (!q) return;
    router.push(`/search?q=${encodeURIComponent(q)}`);
    setSearchOpen(false);
    setSearchQuery("");
  }

  function openMenu(key: string) {
    if (closeTimer.current) {
      clearTimeout(closeTimer.current);
      closeTimer.current = null;
    }
    setActiveMenu(key);
  }

  function scheduleClose() {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    closeTimer.current = setTimeout(() => setActiveMenu(null), 120);
  }

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setActiveMenu(null);
        setMobileMenuOpen(false);
        setSearchOpen(false);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <>
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-neutral-100">
        {/* Top announcement bar */}
        <div className="bg-black text-white text-center py-2 px-4">
          <p className="text-xs tracking-widest uppercase">
            {t("announcement.freeShipping")}
          </p>
        </div>

        {/* Main header */}
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between gap-6">
            {/* Mobile menu button */}
            <button
              className="lg:hidden p-2 -ml-2 text-neutral-700 hover:text-black transition-colors"
              onClick={() => setMobileMenuOpen(true)}
              aria-label="Open menu"
            >
              <Menu className="h-5 w-5" />
            </button>

            {/* Logo */}
            <Link href="/" className="flex-shrink-0" aria-label="AYRES home">
              <Image
                src="/logo/ayres-logo.png"
                alt="AYRES"
                width={300}
                height={80}
                priority
                className="h-16 w-auto invert"
              />
            </Link>

            {/* Desktop navigation */}
            <nav className="hidden lg:flex items-center gap-1 flex-1 justify-center">
              {navigation.map((item) => {
                const hasMenu = !!item.columns;
                const isActive = activeMenu === item.key;
                return (
                  <div
                    key={item.key}
                    className="relative"
                    onMouseEnter={() => hasMenu && openMenu(item.key)}
                    onMouseLeave={() => hasMenu && scheduleClose()}
                  >
                    <Link
                      href={item.href}
                      className={cn(
                        "inline-flex items-center gap-1 px-4 py-2 text-sm tracking-wide transition-colors rounded-md",
                        isActive
                          ? "text-black"
                          : "text-neutral-600 hover:text-black"
                      )}
                    >
                      {t(item.key)}
                      {hasMenu && (
                        <ChevronDown
                          className={cn(
                            "h-3 w-3 transition-transform duration-200",
                            isActive ? "rotate-180" : ""
                          )}
                        />
                      )}
                    </Link>
                    {hasMenu && (
                      <span
                        className={cn(
                          "absolute left-4 right-4 -bottom-px h-px bg-black transition-opacity duration-200",
                          isActive ? "opacity-100" : "opacity-0"
                        )}
                      />
                    )}
                  </div>
                );
              })}
            </nav>

            {/* Right icons */}
            <div className="flex items-center gap-1">
              <button
                onClick={() => setSearchOpen(!searchOpen)}
                className="p-2.5 text-neutral-700 hover:text-black transition-colors"
                aria-label={t("nav.search")}
              >
                <Search className="h-5 w-5" />
              </button>
              <Link
                href="/wishlist"
                className="hidden sm:flex p-2.5 text-neutral-700 hover:text-black transition-colors"
                aria-label={t("nav.wishlist")}
              >
                <Heart className="h-5 w-5" />
              </Link>
              <Link
                href="/cart"
                className="relative p-2.5 text-neutral-700 hover:text-black transition-colors"
                aria-label={t("nav.cart")}
              >
                <ShoppingBag className="h-5 w-5" />
                <CartBadge />
              </Link>
              <UserMenu className="hidden sm:flex" initialUser={initialUser} />
              <div className="hidden sm:block ml-1 pl-1 border-l border-neutral-200">
                <LanguageSwitcher />
              </div>
            </div>
          </div>
        </div>

        {/* Mega menu panel */}
        {navigation.map((item) => {
          if (!item.columns) return null;
          const isActive = activeMenu === item.key;
          return (
            <div
              key={`panel-${item.key}`}
              onMouseEnter={() => openMenu(item.key)}
              onMouseLeave={scheduleClose}
              className={cn(
                "absolute inset-x-0 top-full hidden lg:block transition-all duration-200 origin-top",
                isActive
                  ? "opacity-100 translate-y-0 pointer-events-auto"
                  : "opacity-0 -translate-y-1 pointer-events-none"
              )}
            >
              <div className="bg-white/95 backdrop-blur-xl border-b border-neutral-100 shadow-[0_8px_24px_rgba(0,0,0,0.04)]">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
                  <div className="grid grid-cols-12 gap-8">
                    {item.columns.map((col) => (
                      <div key={col.titleKey} className="col-span-3">
                        <h4 className="text-sm font-semibold text-black mb-4 tracking-wide">
                          {t(col.titleKey)}
                        </h4>
                        <ul className="flex flex-col gap-3">
                          {col.items.map((sub) => (
                            <li key={sub.key}>
                              <Link
                                href={sub.href}
                                onClick={() => setActiveMenu(null)}
                                className="text-sm text-neutral-600 hover:text-black transition-colors"
                              >
                                {t(sub.key)}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                    <div className="col-span-3 flex items-end">
                      <Link
                        href={item.href}
                        onClick={() => setActiveMenu(null)}
                        className="text-sm font-medium text-black hover:underline"
                      >
                        {t("nav.viewAll")}
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}

        {/* Search overlay */}
        <div
          className={cn(
            "absolute inset-x-0 top-full bg-white border-b border-neutral-100 transition-all duration-300",
            searchOpen
              ? "opacity-100 translate-y-0"
              : "opacity-0 -translate-y-2 pointer-events-none"
          )}
        >
          <div className="mx-auto max-w-2xl px-4 py-6">
            <form onSubmit={handleSearchSubmit} className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-neutral-400 pointer-events-none" />
              <input
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t("nav.searchPlaceholder")}
                className="w-full h-12 pl-12 pr-4 bg-neutral-50 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-black"
                autoFocus={searchOpen}
              />
              {searchQuery.trim() && (
                <button
                  type="submit"
                  className="absolute right-1.5 top-1/2 -translate-y-1/2 h-9 px-4 bg-black text-white rounded-full text-xs font-medium hover:bg-neutral-800 transition-colors"
                >
                  Cari
                </button>
              )}
            </form>
          </div>
        </div>
      </header>

      {/* Mobile menu overlay */}
      <div
        className={cn(
          "fixed inset-0 z-[60] lg:hidden transition-opacity duration-300",
          mobileMenuOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
      >
        <div
          className="absolute inset-0 bg-black/40"
          onClick={() => setMobileMenuOpen(false)}
        />
        <div
          className={cn(
            "absolute inset-y-0 left-0 w-80 max-w-[calc(100vw-3rem)] bg-white shadow-2xl transition-transform duration-300 ease-out flex flex-col",
            mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
          )}
        >
          <div className="flex items-center justify-between p-4 border-b border-neutral-100">
            <Image
              src="/logo/ayres-logo.png"
              alt="AYRES"
              width={180}
              height={48}
              className="h-10 w-auto invert"
            />
            <button
              onClick={() => setMobileMenuOpen(false)}
              className="p-2 text-neutral-500 hover:text-black transition-colors"
              aria-label="Close menu"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <nav className="flex-1 overflow-y-auto px-2 py-4">
            {navigation.map((item) => {
              const hasMenu = !!item.columns;
              const expanded = mobileExpanded === item.key;
              return (
                <div key={item.key} className="border-b border-neutral-50 last:border-0">
                  <div className="flex items-stretch">
                    <Link
                      href={item.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex-1 py-3 px-3 text-base text-neutral-700 hover:text-black"
                    >
                      {t(item.key)}
                    </Link>
                    {hasMenu && (
                      <button
                        type="button"
                        onClick={() =>
                          setMobileExpanded(expanded ? null : item.key)
                        }
                        className="px-3 text-neutral-400 hover:text-black transition-colors"
                        aria-label="Toggle submenu"
                      >
                        <ChevronDown
                          className={cn(
                            "h-4 w-4 transition-transform duration-200",
                            expanded ? "rotate-180" : ""
                          )}
                        />
                      </button>
                    )}
                  </div>
                  {hasMenu && expanded && (
                    <div className="pb-3 pl-5 space-y-4">
                      {item.columns!.map((col) => (
                        <div key={col.titleKey}>
                          <div className="text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-2">
                            {t(col.titleKey)}
                          </div>
                          <ul className="flex flex-col">
                            {col.items.map((sub) => (
                              <li key={sub.key}>
                                <Link
                                  href={sub.href}
                                  onClick={() => setMobileMenuOpen(false)}
                                  className="block py-1.5 text-sm text-neutral-600 hover:text-black"
                                >
                                  {t(sub.key)}
                                </Link>
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </nav>

          <div className="p-4 border-t border-neutral-100 space-y-3">
            <div className="flex flex-col gap-1">
              <Link
                href="/login"
                className="flex items-center gap-3 py-2.5 px-2 text-sm text-neutral-600 hover:text-black transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                <User className="h-4 w-4" />
                {t("nav.signInRegister")}
              </Link>
              <Link
                href="/wishlist"
                className="flex items-center gap-3 py-2.5 px-2 text-sm text-neutral-600 hover:text-black transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                <Heart className="h-4 w-4" />
                {t("nav.wishlist")}
              </Link>
            </div>
            <div className="pt-3 border-t border-neutral-100">
              <LanguageSwitcher />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
