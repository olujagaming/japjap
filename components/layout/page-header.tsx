import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function PageHeader({
  title,
  ja,
  description,
  actions,
  className,
}: {
  title: string;
  /** Japanischer Begriff als Eyebrow, z. B. 漢字 */
  ja?: string;
  description?: ReactNode;
  actions?: ReactNode;
  className?: string;
}) {
  return (
    <header
      className={cn(
        "mb-8 flex flex-col gap-4 border-b border-line pb-6 sm:flex-row sm:items-end sm:justify-between lg:mb-10",
        className,
      )}
    >
      <div className="min-w-0">
        {ja ? (
          <p lang="ja" className="mb-2 text-sm tracking-[0.2em] text-faint">
            {ja}
          </p>
        ) : null}
        <h1 className="text-2xl font-semibold tracking-tight text-fg sm:text-3xl">{title}</h1>
        {description ? (
          <p className="mt-2 max-w-2xl text-[0.95rem] leading-relaxed text-muted">{description}</p>
        ) : null}
      </div>
      {actions ? <div className="flex shrink-0 gap-2">{actions}</div> : null}
    </header>
  );
}

export function SectionHeader({
  title,
  ja,
  description,
  action,
  as: Heading = "h2",
}: {
  title: string;
  ja?: string;
  description?: ReactNode;
  action?: ReactNode;
  as?: "h2" | "h3";
}) {
  return (
    <div className="mb-4 flex items-end justify-between gap-4">
      <div>
        <div className="flex items-baseline gap-3">
          <Heading className="text-lg font-semibold tracking-tight text-fg">{title}</Heading>
          {ja ? (
            <span lang="ja" className="text-sm text-faint">
              {ja}
            </span>
          ) : null}
        </div>
        {description ? <p className="mt-1 text-sm text-muted">{description}</p> : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}
