"use client";

import { useId } from "react";
import { cn } from "@/lib/utils";

export type FilterOption = { value: string; label: string };
export type FilterDefinition = {
  key: string;
  label: string;
  options: FilterOption[];
};

/**
 * Kompakte Filterleiste aus nativen Selects – zugänglich, tastaturbedienbar und mobil
 * mit dem System-Picker. Leerer Wert = „Alle“.
 */
export function FilterBar({
  filters,
  values,
  onChange,
  onReset,
  className,
}: {
  filters: FilterDefinition[];
  values: Record<string, string>;
  onChange: (key: string, value: string) => void;
  onReset?: () => void;
  className?: string;
}) {
  const baseId = useId();
  const active = Object.values(values).filter(Boolean).length;
  return (
    <div className={cn("flex flex-wrap items-end gap-3", className)}>
      {filters.map((filter) => {
        const id = `${baseId}-${filter.key}`;
        const value = values[filter.key] ?? "";
        return (
          <div key={filter.key} className="flex flex-col gap-1">
            <label htmlFor={id} className="text-xs text-muted">
              {filter.label}
            </label>
            <select
              id={id}
              value={value}
              onChange={(e) => onChange(filter.key, e.target.value)}
              className={cn(
                "h-9 min-w-32 rounded-md border bg-surface px-2.5 text-sm text-fg focus-visible:ring-2 focus-visible:ring-accent/30 focus-visible:outline-none",
                value ? "border-accent/50" : "border-line",
              )}
            >
              <option value="">Alle</option>
              {filter.options.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        );
      })}
      {onReset && active > 0 ? (
        <button
          type="button"
          onClick={onReset}
          className="h-9 px-2 text-sm text-muted underline underline-offset-4 hover:text-fg"
        >
          Filter zurücksetzen ({active})
        </button>
      ) : null}
    </div>
  );
}
