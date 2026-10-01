import type { ReactNode } from "react";
import { ButtonLink } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/states";

/**
 * Ehrlicher Platzhalter für Bereiche, deren Inhalte noch entstehen:
 * beschreibt, was kommt, und verweist auf etwas, das schon funktioniert.
 */
export function UpcomingSection({
  ja,
  title,
  description,
  features,
  fallback = { href: "/", label: "Zur Startseite" },
}: {
  ja: string;
  title: string;
  description: ReactNode;
  features: string[];
  fallback?: { href: string; label: string };
}) {
  return (
    <div className="flex flex-col gap-8">
      <EmptyState
        ja={ja}
        title={title}
        description={description}
        action={
          <ButtonLink href={fallback.href} variant="secondary">
            {fallback.label}
          </ButtonLink>
        }
      />
      <div>
        <h2 className="mb-3 text-sm font-medium text-muted">Was hier entsteht</h2>
        <ul className="grid gap-2 sm:grid-cols-2">
          {features.map((feature) => (
            <li
              key={feature}
              className="flex items-start gap-3 rounded-md border border-line bg-surface px-4 py-3 text-sm text-fg"
            >
              <span
                aria-hidden="true"
                className="mt-2 size-1.5 shrink-0 rounded-full bg-line-strong"
              />
              {feature}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
