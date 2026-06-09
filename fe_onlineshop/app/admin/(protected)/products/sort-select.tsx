"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";

export function SortSelect<T extends string>({
  options,
  defaultValue,
  paramName = "sort",
}: {
  options: { value: T; label: string }[];
  defaultValue: T;
  paramName?: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();

  function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const next = new URLSearchParams(params.toString());
    next.set(paramName, e.target.value);
    next.delete("page");
    router.push(`${pathname}?${next.toString()}`);
  }

  return (
    <select
      value={params.get(paramName) || defaultValue}
      onChange={handleChange}
      className="h-10 px-3 bg-white border border-neutral-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
    >
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  );
}
