import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";
import { SearchIcon } from "./icons";

export function SearchInput({
  label = "Suche",
  className,
  ...props
}: Omit<ComponentProps<"input">, "type"> & { label?: string }) {
  return (
    <div className={cn("relative", className)}>
      <SearchIcon
        size={18}
        className="pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 text-faint"
      />
      <input
        type="search"
        aria-label={label}
        autoComplete="off"
        spellCheck={false}
        className="h-12 w-full rounded-lg border border-line bg-surface pr-4 pl-11 text-base text-fg placeholder:text-faint focus:border-accent/60 focus-visible:ring-2 focus-visible:ring-accent/25 focus-visible:outline-none"
        {...props}
      />
    </div>
  );
}
