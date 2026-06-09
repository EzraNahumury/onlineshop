"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";

export interface TabItem {
  key: string;
  label: string;
  count?: number;
}

export function StatusTabs({
  tabs,
  paramName = "tab",
  defaultTab,
}: {
  tabs: TabItem[];
  paramName?: string;
  defaultTab?: string;
}) {
  const pathname = usePathname();
  const params = useSearchParams();
  const current = params.get(paramName) || defaultTab || tabs[0]?.key;

  function buildHref(tabKey: string) {
    const next = new URLSearchParams(params.toString());
    if (tabKey === (defaultTab || tabs[0]?.key)) {
      next.delete(paramName);
    } else {
      next.set(paramName, tabKey);
    }
    next.delete("page");
    const qs = next.toString();
    return qs ? `${pathname}?${qs}` : pathname;
  }

  return (
    <div className="border-b border-neutral-200 overflow-x-auto">
      <nav className="flex gap-1 min-w-max">
        {tabs.map((t) => {
          const active = t.key === current;
          return (
            <Link
              key={t.key}
              href={buildHref(t.key)}
              className={cn(
                "inline-flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 -mb-px transition-colors",
                active
                  ? "border-black text-black"
                  : "border-transparent text-neutral-500 hover:text-black hover:border-neutral-300"
              )}
            >
              {t.label}
              {typeof t.count === "number" && (
                <span
                  className={cn(
                    "text-xs px-1.5 py-0.5 rounded-full",
                    active ? "bg-black text-white" : "bg-neutral-100 text-neutral-600"
                  )}
                >
                  {t.count}
                </span>
              )}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
