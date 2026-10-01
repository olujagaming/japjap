"use client";

import { useDueReviewCount } from "@/hooks/use-user-data";

/** „Heute warten N Wiederholungen auf dich.“ – berechnet aus dem gespeicherten Fortschritt. */
export function ReviewSummary() {
  const { data: due, loading } = useDueReviewCount();
  if (loading)
    return <p className="h-5 w-64 animate-pulse rounded bg-surface-2" aria-hidden="true" />;
  return (
    <p className="text-[0.95rem] text-muted">
      {due > 0
        ? `Heute ${due === 1 ? "wartet 1 Wiederholung" : `warten ${due} Wiederholungen`} auf dich.`
        : "Heute stehen keine Wiederholungen an."}
    </p>
  );
}
