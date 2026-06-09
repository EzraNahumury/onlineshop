"use client";

import { cn } from "@/lib/utils";
import { forwardRef, useState, type InputHTMLAttributes } from "react";

interface FloatingInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string | null;
  rightSlot?: React.ReactNode;
}

const FloatingInput = forwardRef<HTMLInputElement, FloatingInputProps>(
  ({ className, label, error, rightSlot, id, value, defaultValue, onFocus, onBlur, ...props }, ref) => {
    const [focused, setFocused] = useState(false);
    const hasValue =
      (typeof value === "string" && value.length > 0) ||
      (typeof defaultValue === "string" && defaultValue.length > 0);
    const floated = focused || hasValue;

    return (
      <div className="flex flex-col gap-1">
        <div
          className={cn(
            "group relative rounded-2xl border bg-white/70 backdrop-blur-sm transition-all duration-200",
            error
              ? "border-red-400 ring-4 ring-red-100"
              : focused
                ? "border-black ring-4 ring-black/5"
                : "border-neutral-200 hover:border-neutral-300"
          )}
        >
          <label
            htmlFor={id}
            className={cn(
              "pointer-events-none absolute left-4 transition-all duration-200 ease-out font-medium",
              floated
                ? "top-2 text-[10px] uppercase tracking-wider text-neutral-500"
                : "top-1/2 -translate-y-1/2 text-sm text-neutral-400"
            )}
          >
            {label}
          </label>
          <input
            ref={ref}
            id={id}
            value={value}
            defaultValue={defaultValue}
            onFocus={(e) => {
              setFocused(true);
              onFocus?.(e);
            }}
            onBlur={(e) => {
              setFocused(false);
              onBlur?.(e);
            }}
            className={cn(
              "w-full bg-transparent px-4 pt-6 pb-2 text-sm text-black focus:outline-none placeholder:text-neutral-300",
              rightSlot ? "pr-12" : "",
              className
            )}
            {...props}
          />
          {rightSlot && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              {rightSlot}
            </div>
          )}
        </div>
        {error && (
          <p className="text-xs text-red-600 px-1">{error}</p>
        )}
      </div>
    );
  }
);
FloatingInput.displayName = "FloatingInput";

export { FloatingInput };
