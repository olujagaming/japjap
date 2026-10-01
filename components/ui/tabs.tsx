"use client";

import { useId, useRef, type KeyboardEvent, type ReactNode } from "react";
import { cn } from "@/lib/utils";

export type TabItem<T extends string> = { value: T; label: ReactNode };

/**
 * Zugängliche Tabs (WAI-ARIA Tabs Pattern): Pfeiltasten, Pos1/Ende, roving tabindex.
 * Kontrolliert – der Aufrufer hält den aktiven Wert und rendert das Panel über `children`.
 */
export function Tabs<T extends string>({
  items,
  value,
  onChange,
  label,
  children,
  className,
}: {
  items: TabItem<T>[];
  value: T;
  onChange: (value: T) => void;
  label: string;
  children?: ReactNode;
  className?: string;
}) {
  const baseId = useId();
  const refs = useRef<(HTMLButtonElement | null)[]>([]);

  const onKeyDown = (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
    let next = index;
    if (event.key === "ArrowRight") next = (index + 1) % items.length;
    else if (event.key === "ArrowLeft") next = (index - 1 + items.length) % items.length;
    else if (event.key === "Home") next = 0;
    else if (event.key === "End") next = items.length - 1;
    else return;
    event.preventDefault();
    onChange(items[next].value);
    refs.current[next]?.focus();
  };

  return (
    <div className={className}>
      <div
        role="tablist"
        aria-label={label}
        className="flex scrollbar-none gap-1 overflow-x-auto border-b border-line"
      >
        {items.map((item, index) => {
          const selected = item.value === value;
          return (
            <button
              key={item.value}
              ref={(el) => {
                refs.current[index] = el;
              }}
              id={`${baseId}-tab-${item.value}`}
              role="tab"
              type="button"
              aria-selected={selected}
              aria-controls={`${baseId}-panel`}
              tabIndex={selected ? 0 : -1}
              onClick={() => onChange(item.value)}
              onKeyDown={(e) => onKeyDown(e, index)}
              className={cn(
                "-mb-px border-b-2 px-3 pt-2 pb-2.5 text-sm font-medium whitespace-nowrap transition-colors",
                selected ? "border-accent text-fg" : "border-transparent text-muted hover:text-fg",
              )}
            >
              {item.label}
            </button>
          );
        })}
      </div>
      {children !== undefined ? (
        <div
          id={`${baseId}-panel`}
          role="tabpanel"
          aria-labelledby={`${baseId}-tab-${value}`}
          tabIndex={0}
          className="pt-6 focus-visible:outline-offset-4"
        >
          {children}
        </div>
      ) : null}
    </div>
  );
}
