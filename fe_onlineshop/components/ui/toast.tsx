"use client";

import { useEffect } from "react";
import { create } from "zustand";
import { CheckCircle2, XCircle, Info, X } from "lucide-react";
import { cn } from "@/lib/utils";

export type ToastType = "success" | "error" | "info";

type ToastItem = {
  id: string;
  message: string;
  type: ToastType;
  duration: number;
};

type ToastStore = {
  toasts: ToastItem[];
  show: (message: string, type: ToastType, duration?: number) => void;
  dismiss: (id: string) => void;
};

const useToastStore = create<ToastStore>((set) => ({
  toasts: [],
  show: (message, type, duration = 4000) => {
    const id = Math.random().toString(36).slice(2);
    set((state) => ({
      toasts: [...state.toasts, { id, message, type, duration }],
    }));
  },
  dismiss: (id) =>
    set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) })),
}));

export const toast = {
  success: (message: string, duration?: number) =>
    useToastStore.getState().show(message, "success", duration),
  error: (message: string, duration?: number) =>
    useToastStore.getState().show(message, "error", duration),
  info: (message: string, duration?: number) =>
    useToastStore.getState().show(message, "info", duration),
};

const iconMap: Record<ToastType, typeof CheckCircle2> = {
  success: CheckCircle2,
  error: XCircle,
  info: Info,
};

const styleMap: Record<ToastType, string> = {
  success: "border-emerald-200 bg-white text-emerald-900 [&_svg]:text-emerald-500",
  error: "border-red-200 bg-white text-red-900 [&_svg]:text-red-500",
  info: "border-neutral-200 bg-white text-neutral-900 [&_svg]:text-neutral-500",
};

export function Toaster() {
  const { toasts, dismiss } = useToastStore();

  return (
    <div className="fixed top-6 right-6 z-[110] flex flex-col gap-2 pointer-events-none">
      {toasts.map((t) => (
        <ToastBubble key={t.id} item={t} onDismiss={() => dismiss(t.id)} />
      ))}
    </div>
  );
}

function ToastBubble({
  item,
  onDismiss,
}: {
  item: ToastItem;
  onDismiss: () => void;
}) {
  const Icon = iconMap[item.type];

  useEffect(() => {
    const timer = setTimeout(onDismiss, item.duration);
    return () => clearTimeout(timer);
  }, [onDismiss, item.duration]);

  return (
    <div
      role="status"
      className={cn(
        "pointer-events-auto flex items-start gap-3 min-w-[280px] max-w-md px-4 py-3 rounded-xl border shadow-lg ui-toast-in",
        styleMap[item.type]
      )}
    >
      <Icon className="h-5 w-5 flex-shrink-0 mt-0.5" />
      <p className="flex-1 text-sm leading-snug">{item.message}</p>
      <button
        type="button"
        onClick={onDismiss}
        className="flex-shrink-0 -mr-1 -mt-0.5 p-1 rounded-md text-neutral-400 hover:text-neutral-900 hover:bg-neutral-100 transition-colors"
        aria-label="Dismiss"
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}
