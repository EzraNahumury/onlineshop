"use client";

import { cn } from "@/lib/utils";
import { forwardRef, type InputHTMLAttributes } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, id, ...props }, ref) => {
    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label
            htmlFor={id}
            className="text-sm font-medium text-neutral-700"
          >
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={id}
          className={cn(
            "h-11 w-full rounded-lg border bg-white px-4 text-sm text-black transition-colors",
            "placeholder:text-neutral-400",
            "focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent",
            "disabled:cursor-not-allowed disabled:bg-neutral-50 disabled:text-neutral-400",
            error
              ? "border-red-500 focus:ring-red-500"
              : "border-neutral-300 hover:border-neutral-400",
            className
          )}
          {...props}
        />
        {error && <p className="text-xs text-red-500">{error}</p>}
      </div>
    );
  }
);

Input.displayName = "Input";

export { Input };
export type { InputProps };
