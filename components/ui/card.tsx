import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";
import { cn } from "@/lib/utils";

const cardBase = "rounded-lg border border-line bg-surface";

export function Card({ className, ...props }: ComponentProps<"div">) {
  return <div className={cn(cardBase, "p-5", className)} {...props} />;
}

/** Ganze Karte als Link – mit dezenter Hover-Linie statt Schatten-Effekten. */
export function CardLink({ className, ...props }: ComponentProps<typeof Link>) {
  return (
    <Link
      className={cn(
        cardBase,
        "group block p-5 transition-colors duration-150 hover:border-line-strong hover:bg-surface-2/40",
        className,
      )}
      {...props}
    />
  );
}

export function CardTitle({
  children,
  ja,
  className,
}: {
  children: ReactNode;
  ja?: string;
  className?: string;
}) {
  return (
    <div className={cn("flex items-baseline gap-3", className)}>
      <h3 className="text-base font-semibold tracking-tight text-fg">{children}</h3>
      {ja ? (
        <span lang="ja" className="text-sm text-faint">
          {ja}
        </span>
      ) : null}
    </div>
  );
}
