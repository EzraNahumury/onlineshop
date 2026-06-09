"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";

export function Pagination({
  total,
  pageSize,
  currentPage,
}: {
  total: number;
  pageSize: number;
  currentPage: number;
}) {
  const pathname = usePathname();
  const params = useSearchParams();
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  if (totalPages <= 1) return null;

  function buildHref(page: number) {
    const next = new URLSearchParams(params.toString());
    if (page === 1) next.delete("page");
    else next.set("page", String(page));
    const qs = next.toString();
    return qs ? `${pathname}?${qs}` : pathname;
  }

  const start = (currentPage - 1) * pageSize + 1;
  const end = Math.min(total, currentPage * pageSize);

  return (
    <div className="flex items-center justify-between px-4 py-3 border-t border-neutral-200 bg-white">
      <div className="text-xs text-neutral-500">
        Menampilkan {start}–{end} dari {total}
      </div>
      <div className="flex items-center gap-1">
        <PageLink
          href={buildHref(currentPage - 1)}
          disabled={currentPage <= 1}
        >
          ‹ Sebelumnya
        </PageLink>
        <span className="px-3 py-1.5 text-sm text-neutral-600">
          {currentPage} / {totalPages}
        </span>
        <PageLink
          href={buildHref(currentPage + 1)}
          disabled={currentPage >= totalPages}
        >
          Selanjutnya ›
        </PageLink>
      </div>
    </div>
  );
}

function PageLink({
  href,
  disabled,
  children,
}: {
  href: string;
  disabled: boolean;
  children: React.ReactNode;
}) {
  if (disabled) {
    return (
      <span className="px-3 py-1.5 text-sm text-neutral-300 cursor-not-allowed">
        {children}
      </span>
    );
  }
  return (
    <Link
      href={href}
      className={cn(
        "px-3 py-1.5 text-sm rounded-md text-neutral-700 hover:bg-neutral-100 transition-colors"
      )}
    >
      {children}
    </Link>
  );
}
