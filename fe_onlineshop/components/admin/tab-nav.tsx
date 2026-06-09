"use client";

import { cn } from "@/lib/utils";

export interface TabDef {
  key: string;
  label: string;
  hint?: string;
}

export function TabNav({
  tabs,
  active,
  onChange,
}: {
  tabs: TabDef[];
  active: string;
  onChange: (key: string) => void;
}) {
  return (
    <div className="border-b border-neutral-200">
      <nav className="flex gap-1 overflow-x-auto">
        {tabs.map((t) => {
          const isActive = t.key === active;
          return (
            <button
              key={t.key}
              type="button"
              onClick={() => onChange(t.key)}
              className={cn(
                "px-4 py-3 text-sm font-medium border-b-2 -mb-px transition-colors whitespace-nowrap",
                isActive
                  ? "border-black text-black"
                  : "border-transparent text-neutral-500 hover:text-black hover:border-neutral-300"
              )}
            >
              {t.label}
              {t.hint && (
                <span className="ml-1.5 text-xs text-neutral-400">{t.hint}</span>
              )}
            </button>
          );
        })}
      </nav>
    </div>
  );
}
