"use client";

import { useMemo, useState } from "react";
import { SectionHeader } from "@/components/layout/page-header";
import { GrammarCard } from "@/components/learning/content-cards";
import { FilterBar, type FilterDefinition } from "@/components/ui/filter-bar";
import { EmptyState, ErrorState } from "@/components/ui/states";
import { GRAMMAR, GRAMMAR_CATEGORY_LABELS } from "@/data/grammar";
import { useProgressList } from "@/hooks/use-user-data";
import { isKnownStatus } from "@/lib/learning/progress";
import { GRAMMAR_CATEGORIES } from "@/types/content";

const FILTERS: FilterDefinition[] = [
  { key: "jlpt", label: "JLPT", options: ["N5", "N4"].map((v) => ({ value: v, label: v })) },
  {
    key: "category",
    label: "Verwendung",
    options: GRAMMAR_CATEGORIES.map((c) => ({ value: c, label: GRAMMAR_CATEGORY_LABELS[c] })),
  },
  {
    key: "learned",
    label: "Gelernt",
    options: [
      { value: "yes", label: "Bekannt" },
      { value: "no", label: "Noch nicht" },
    ],
  },
  { key: "common", label: "Häufigkeit", options: [{ value: "yes", label: "Häufig verwendet" }] },
];

const EMPTY = { jlpt: "", category: "", learned: "", common: "" };

export function GrammarBrowser() {
  const [filters, setFilters] = useState<Record<string, string>>(EMPTY);
  const { data: records, error } = useProgressList("grammar");
  const status = useMemo(() => new Map(records.map((r) => [r.contentId, r.status])), [records]);

  const results = GRAMMAR.filter((g) => {
    const known = isKnownStatus(status.get(g.id) ?? "unseen");
    if (filters.jlpt && g.jlpt !== filters.jlpt) return false;
    if (filters.category && g.category !== filters.category) return false;
    if (filters.learned === "yes" && !known) return false;
    if (filters.learned === "no" && known) return false;
    if (filters.common === "yes" && !g.common) return false;
    return true;
  });

  if (error) return <ErrorState />;

  return (
    <div className="flex flex-col gap-10">
      <FilterBar
        filters={FILTERS}
        values={filters}
        onChange={(key, value) => setFilters((f) => ({ ...f, [key]: value }))}
        onReset={() => setFilters(EMPTY)}
      />
      {results.length === 0 ? (
        <EmptyState ja="無" title="Keine passende Grammatik." description="Passe die Filter an." />
      ) : (
        GRAMMAR_CATEGORIES.map((category) => {
          const items = results.filter((g) => g.category === category);
          if (items.length === 0) return null;
          return (
            <section key={category}>
              <SectionHeader title={GRAMMAR_CATEGORY_LABELS[category]} />
              <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {items.map((point) => (
                  <li key={point.id}>
                    <GrammarCard point={point} status={status.get(point.id)} />
                  </li>
                ))}
              </ul>
            </section>
          );
        })
      )}
    </div>
  );
}
