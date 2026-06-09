"use client";

import { useEffect, useState } from "react";
import { Globe } from "lucide-react";
import { useLanguage, type Lang } from "@/lib/store/language";
import { cn } from "@/lib/utils";

export function LanguageSwitcher() {
  const lang = useLanguage((s) => s.lang);
  const setLang = useLanguage((s) => s.setLang);
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!open) return;
    const handler = () => setOpen(false);
    window.addEventListener("click", handler);
    return () => window.removeEventListener("click", handler);
  }, [open]);

  const display: Lang = mounted ? lang : "id";

  return (
    <div className="relative">
      <button
        onClick={(e) => {
          e.stopPropagation();
          setOpen((v) => !v);
        }}
        className="flex items-center gap-1.5 px-2.5 py-2 text-neutral-700 hover:text-black transition-colors text-sm font-medium"
        aria-label="Ganti bahasa"
      >
        <Globe className="h-4 w-4" />
        <span className="uppercase tracking-wider text-xs">{display}</span>
      </button>
      {open && (
        <div className="absolute right-0 top-full mt-1 w-32 bg-white border border-neutral-200 rounded-lg shadow-lg overflow-hidden z-50">
          <LangOption
            value="id"
            label="Indonesia"
            current={display}
            onSelect={(l) => {
              setLang(l);
              setOpen(false);
            }}
          />
          <LangOption
            value="en"
            label="English"
            current={display}
            onSelect={(l) => {
              setLang(l);
              setOpen(false);
            }}
          />
        </div>
      )}
    </div>
  );
}

function LangOption({
  value,
  label,
  current,
  onSelect,
}: {
  value: Lang;
  label: string;
  current: Lang;
  onSelect: (l: Lang) => void;
}) {
  const active = value === current;
  return (
    <button
      onClick={() => onSelect(value)}
      className={cn(
        "w-full text-left px-3 py-2 text-sm transition-colors",
        active
          ? "bg-neutral-100 text-black font-medium"
          : "text-neutral-600 hover:bg-neutral-50"
      )}
    >
      <span className="uppercase tracking-wider text-xs mr-2">{value}</span>
      {label}
    </button>
  );
}
