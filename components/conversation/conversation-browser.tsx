"use client";

import { useMemo, useState } from "react";
import { ConversationCard } from "@/components/learning/content-cards";
import { FilterBar, type FilterDefinition } from "@/components/ui/filter-bar";
import { EmptyState, ErrorState } from "@/components/ui/states";
import { useProgressList } from "@/hooks/use-user-data";
import type { ConversationSummary } from "@/lib/content/conversation-data";
import { isConversationCompleted } from "@/lib/learning/conversation";
import { DIFFICULTY_META } from "@/lib/learning-status";
import { DIFFICULTIES } from "@/types/content";

const EMPTY = { difficulty: "", situation: "", length: "", status: "", register: "" };

export function ConversationBrowser({
  conversations,
  situations,
}: {
  conversations: ConversationSummary[];
  situations: { id: string; titleDe: string }[];
}) {
  const [filters, setFilters] = useState<Record<string, string>>(EMPTY);
  const { data: records, error } = useProgressList("conversation");
  const progress = useMemo(() => new Map(records.map((r) => [r.contentId, r])), [records]);

  const definitions: FilterDefinition[] = [
    {
      key: "difficulty",
      label: "Niveau",
      options: DIFFICULTIES.filter((d) => conversations.some((c) => c.difficulty === d)).map(
        (d) => ({
          value: d,
          label: DIFFICULTY_META[d].label,
        }),
      ),
    },
    {
      key: "situation",
      label: "Situation",
      options: situations.map((s) => ({ value: s.id, label: s.titleDe })),
    },
    {
      key: "length",
      label: "Länge",
      options: [
        { value: "short", label: "kurz (bis 7 Zeilen)" },
        { value: "long", label: "länger (ab 8 Zeilen)" },
      ],
    },
    {
      key: "status",
      label: "Status",
      options: [
        { value: "open", label: "noch offen" },
        { value: "done", label: "durchgearbeitet" },
      ],
    },
    {
      key: "register",
      label: "Ton",
      options: [
        { value: "polite", label: "höflich" },
        { value: "casual", label: "locker" },
      ],
    },
  ];

  const results = conversations.filter((c) => {
    const done = isConversationCompleted(progress.get(c.id));
    if (filters.difficulty && c.difficulty !== filters.difficulty) return false;
    if (filters.situation && c.situationId !== filters.situation) return false;
    if (filters.length === "short" && c.lineCount > 7) return false;
    if (filters.length === "long" && c.lineCount <= 7) return false;
    if (filters.status === "open" && done) return false;
    if (filters.status === "done" && !done) return false;
    if (filters.register && c.register !== filters.register) return false;
    return true;
  });

  if (error) return <ErrorState />;

  return (
    <div className="flex flex-col gap-6">
      <FilterBar
        filters={definitions}
        values={filters}
        onChange={(key, value) => setFilters((f) => ({ ...f, [key]: value }))}
        onReset={() => setFilters(EMPTY)}
      />
      <p className="text-sm text-muted" aria-live="polite">
        {results.length} {results.length === 1 ? "Gespräch" : "Gespräche"}
      </p>
      {results.length === 0 ? (
        <EmptyState ja="話" title="Keine passenden Gespräche." description="Passe die Filter an." />
      ) : (
        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {results.map((summary) => (
            <li key={summary.id}>
              <ConversationCard
                summary={summary}
                completed={isConversationCompleted(progress.get(summary.id))}
              />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
