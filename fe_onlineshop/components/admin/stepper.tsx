"use client";

import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

export type StepItem = {
  label: string;
  description?: string;
};

export function Stepper({
  steps,
  current,
  className,
}: {
  steps: StepItem[];
  current: number;
  className?: string;
}) {
  return (
    <div className={cn("flex items-start w-full", className)}>
      {steps.map((step, idx) => {
        const stepNumber = idx + 1;
        const isCompleted = stepNumber < current;
        const isCurrent = stepNumber === current;
        const isLast = idx === steps.length - 1;

        return (
          <div
            key={idx}
            className={cn("flex items-start", !isLast && "flex-1")}
          >
            <div className="flex flex-col items-center gap-2 min-w-[88px]">
              <div
                className={cn(
                  "w-9 h-9 rounded-full flex items-center justify-center text-sm font-semibold transition-all",
                  isCompleted && "bg-black text-white",
                  isCurrent &&
                    "bg-black text-white ring-4 ring-black/10 scale-105",
                  !isCompleted &&
                    !isCurrent &&
                    "bg-white text-neutral-400 border-2 border-neutral-200"
                )}
              >
                {isCompleted ? (
                  <Check className="h-4 w-4" strokeWidth={3} />
                ) : (
                  stepNumber
                )}
              </div>
              <div className="text-center px-1">
                <div
                  className={cn(
                    "text-xs font-semibold tracking-tight",
                    isCurrent
                      ? "text-black"
                      : isCompleted
                        ? "text-neutral-700"
                        : "text-neutral-400"
                  )}
                >
                  {step.label}
                </div>
                {step.description && (
                  <div className="text-[11px] text-neutral-400 mt-0.5 leading-tight">
                    {step.description}
                  </div>
                )}
              </div>
            </div>
            {!isLast && (
              <div
                className={cn(
                  "flex-1 h-0.5 mt-[18px] mx-1 rounded-full transition-colors",
                  isCompleted ? "bg-black" : "bg-neutral-200"
                )}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

export const PRODUCT_STEPS: StepItem[] = [
  { label: "Informasi", description: "Foto & identitas" },
  { label: "Deskripsi", description: "Detail produk" },
  { label: "Penjualan", description: "Harga & varian" },
  { label: "Pengiriman", description: "Berat & kurir" },
];
