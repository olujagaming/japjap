import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { AlertIcon } from "./icons";

export function EmptyState({
  title,
  description,
  ja,
  action,
  className,
}: {
  title: string;
  description?: ReactNode;
  /** Optionales japanisches Zeichen als ruhiges typografisches Motiv. */
  ja?: string;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center rounded-lg border border-dashed border-line px-6 py-12 text-center",
        className,
      )}
    >
      {ja ? (
        <span lang="ja" aria-hidden="true" className="mb-4 text-4xl text-faint">
          {ja}
        </span>
      ) : null}
      <p className="text-base font-medium text-fg">{title}</p>
      {description ? <p className="mt-1.5 max-w-md text-sm text-muted">{description}</p> : null}
      {action ? <div className="mt-6">{action}</div> : null}
    </div>
  );
}

export function LoadingState({ label = "Wird geladen …" }: { label?: string }) {
  return (
    <div role="status" aria-live="polite" className="flex flex-col gap-4 py-2">
      <span className="sr-only">{label}</span>
      <div className="h-7 w-48 animate-pulse rounded bg-surface-2" />
      <div className="h-4 w-80 max-w-full animate-pulse rounded bg-surface-2" />
      <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }, (_, i) => (
          <div key={i} className="h-28 animate-pulse rounded-lg bg-surface-2/70" />
        ))}
      </div>
    </div>
  );
}

export function ErrorState({
  title = "Etwas ist schiefgelaufen.",
  description = "Der Inhalt konnte nicht geladen werden. Bitte versuche es erneut.",
  action,
}: {
  title?: string;
  description?: ReactNode;
  action?: ReactNode;
}) {
  return (
    <div
      role="alert"
      className="flex flex-col items-center rounded-lg border border-akane/30 bg-akane-soft/40 px-6 py-12 text-center"
    >
      <AlertIcon className="mb-3 text-akane" size={28} />
      <p className="text-base font-medium text-fg">{title}</p>
      <p className="mt-1.5 max-w-md text-sm text-muted">{description}</p>
      {action ? <div className="mt-6">{action}</div> : null}
    </div>
  );
}
