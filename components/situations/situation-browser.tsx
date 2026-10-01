"use client";

import { useMemo, useState } from "react";
import { SituationCard } from "@/components/learning/content-cards";
import { ErrorState } from "@/components/ui/states";
import { useProgressList } from "@/hooks/use-user-data";
import { isConversationCompleted } from "@/lib/learning/conversation";
import { cn } from "@/lib/utils";
import type { Difficulty, SituationCategory } from "@/types/content";

export type SituationSummary = {
  slug: string;
  titleJa: string;
  titleDe: string;
  difficulty: Difficulty;
  category: SituationCategory;
  conversationIds: string[];
};

type Filter = "all" | "beginner" | SituationCategory;

const FILTERS: { value: Filter; label: string }[] = [
  { value: "all", label: "Alle" },
  { value: "beginner", label: "Anfänger" },
  { value: "everyday", label: "Alltag" },
  { value: "travel", label: "Reisen" },
  { value: "social", label: "Social" },
  { value: "work", label: "Arbeit" },
];

export function SituationBrowser({ situations }: { situations: SituationSummary[] }) {
  const [filter, setFilter] = useState<Filter>("all");
  const { data: records, error } = useProgressList("conversation");
  const progress = useMemo(() => new Map(records.map((r) => [r.contentId, r])), [records]);

  const results = situations.filter((s) =>
    filter === "all"
      ? true
      : filter === "beginner"
        ? s.difficulty === "beginner"
        : s.category === filter,
  );

  if (error) return <ErrorState />;

  return (
    <div className="flex flex-col gap-6">
      <div role="radiogroup" aria-label="Situationen filtern" className="flex flex-wrap gap-2">
        {FILTERS.map((f) => {
          const count = situations.filter((s) =>
            f.value === "all"
              ? true
              : f.value === "beginner"
                ? s.difficulty === "beginner"
                : s.category === f.value,
          ).length;
          return (
            <button
              key={f.value}
              type="button"
              role="radio"
              aria-checked={filter === f.value}
              disabled={count === 0}
              onClick={() => setFilter(f.value)}
              className={cn(
                "h-9 rounded-full border px-3.5 text-sm transition-colors disabled:opacity-40",
                filter === f.value
                  ? "border-accent bg-accent-soft font-medium"
                  : "border-line bg-surface text-muted hover:text-fg",
              )}
            >
              {f.label} <span className="text-xs text-faint tabular-nums">{count}</span>
            </button>
          );
        })}
      </div>
      <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {results.map((s) => (
          <li key={s.slug}>
            <SituationCard
              situation={s}
              conversationCount={s.conversationIds.length}
              completedCount={
                s.conversationIds.filter((id) => isConversationCompleted(progress.get(id))).length
              }
            />
          </li>
        ))}
      </ul>
    </div>
  );
}
