"use client";

import { useEffect } from "react";
import { create } from "zustand";
import { AlertTriangle, HelpCircle } from "lucide-react";
import { cn } from "@/lib/utils";

export type ConfirmOptions = {
  title: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
  variant?: "default" | "danger";
};

type ConfirmStore = {
  open: boolean;
  options: ConfirmOptions | null;
  resolver: ((value: boolean) => void) | null;
  openDialog: (opts: ConfirmOptions, resolve: (v: boolean) => void) => void;
  close: (value: boolean) => void;
};

const useConfirmStore = create<ConfirmStore>((set, get) => ({
  open: false,
  options: null,
  resolver: null,
  openDialog: (options, resolver) => set({ open: true, options, resolver }),
  close: (value) => {
    const resolver = get().resolver;
    if (resolver) resolver(value);
    set({ open: false, options: null, resolver: null });
  },
}));

export function confirm(options: ConfirmOptions): Promise<boolean> {
  return new Promise((resolve) => {
    useConfirmStore.getState().openDialog(options, resolve);
  });
}

export function ConfirmDialog() {
  const { open, options, close } = useConfirmStore();

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close(false);
      if (e.key === "Enter") close(true);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, close]);

  if (!open || !options) return null;

  const variant = options.variant ?? "default";
  const Icon = variant === "danger" ? AlertTriangle : HelpCircle;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
    >
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm ui-fade-in"
        onClick={() => close(false)}
      />

      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden ui-dialog-in">
        <div className="p-6">
          <div className="flex items-start gap-4">
            <div
              className={cn(
                "flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center",
                variant === "danger"
                  ? "bg-red-50 text-red-600"
                  : "bg-neutral-100 text-neutral-600"
              )}
            >
              <Icon className="h-5 w-5" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-base font-semibold text-neutral-900">
                {options.title}
              </h3>
              {options.description && (
                <p className="mt-1.5 text-sm text-neutral-500 leading-relaxed">
                  {options.description}
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="flex gap-2 px-6 py-4 bg-neutral-50 border-t border-neutral-100">
          <button
            type="button"
            onClick={() => close(false)}
            className="flex-1 h-10 px-4 rounded-lg border border-neutral-200 bg-white text-sm font-medium text-neutral-700 hover:bg-neutral-50 active:bg-neutral-100 transition-colors"
          >
            {options.cancelText ?? "Batal"}
          </button>
          <button
            type="button"
            onClick={() => close(true)}
            autoFocus
            className={cn(
              "flex-1 h-10 px-4 rounded-lg text-sm font-medium text-white transition-colors",
              variant === "danger"
                ? "bg-red-600 hover:bg-red-500 active:bg-red-700"
                : "bg-neutral-900 hover:bg-neutral-800 active:bg-black"
            )}
          >
            {options.confirmText ?? "Konfirmasi"}
          </button>
        </div>
      </div>
    </div>
  );
}
