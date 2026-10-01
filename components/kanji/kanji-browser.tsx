"use client";

import { useMemo, useState } from "react";
import { KanjiCard } from "@/components/learning/content-cards";
import { FilterBar, type FilterDefinition } from "@/components/ui/filter-bar";
import { EmptyState, ErrorState } from "@/components/ui/states";
import { KANJI } from "@/data/kanji";
import { useProgressList } from "@/hooks/use-user-data";
import { LEARNING_STATUS_META } from "@/lib/learning-status";
import { LEARNING_STATUSES } from "@/types/content";

const STROKE_RANGES: Record<string, [number, number]> = {
  "1-4": [1, 4],
  "5-8": [5, 8],
  "9-12": [9, 12],
  "13+": [13, 99],
};

const radicals = [
  ...new Set(KANJI.map((k) => `${k.radical}|${k.radicalMeaningDe.split(" (")[0]}`)),
].sort();

const FILTERS: FilterDefinition[] = [
  { key: "jlpt", label: "JLPT", options: ["N5", "N4"].map((v) => ({ value: v, label: v })) },
  {
    key: "grade",
    label: "Schulklasse",
    options: [...new Set(KANJI.map((k) => k.grade))]
      .sort()
      .map((g) => ({ value: String(g), label: `${g}. Klasse` })),
  },
  {
    key: "strokes",
    label: "Strichzahl",
    options: Object.keys(STROKE_RANGES).map((v) => ({ value: v, label: `${v} Striche` })),
  },
  {
    key: "radical",
    label: "Radikal",
    options: radicals.map((r) => {
      const [radical, meaning] = r.split("|");
      return { value: radical, label: `${radical} – ${meaning}` };
    }),
  },
  {
    key: "status",
    label: "Status",
    options: LEARNING_STATUSES.map((s) => ({ value: s, label: LEARNING_STATUS_META[s].label })),
  },
];

const EMPTY = { jlpt: "", grade: "", strokes: "", radical: "", status: "" };
type Sort = "grade" | "strokes";

export function KanjiBrowser() {
  const [filters, setFilters] = useState<Record<string, string>>(EMPTY);
  const [sort, setSort] = useState<Sort>("grade");
  const { data: records, error } = useProgressList("kanji");
  const status = useMemo(() => new Map(records.map((r) => [r.contentId, r.status])), [records]);

  const results = useMemo(() => {
    const filtered = KANJI.filter((k) => {
      if (filters.jlpt && k.jlpt !== filters.jlpt) return false;
      if (filters.grade && String(k.grade) !== filters.grade) return false;
      if (filters.radical && k.radical !== filters.radical) return false;
      if (filters.strokes) {
        const [min, max] = STROKE_RANGES[filters.strokes];
        if (k.strokeCount < min || k.strokeCount > max) return false;
      }
      if (filters.status && (status.get(k.id) ?? "unseen") !== filters.status) return false;
      return true;
    });
    return [...filtered].sort((a, b) =>
      sort === "grade"
        ? (a.grade ?? 9) - (b.grade ?? 9) || a.strokeCount - b.strokeCount
        : a.strokeCount - b.strokeCount,
    );
  }, [filters, sort, status]);

  if (error) return <ErrorState />;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <FilterBar
          filters={FILTERS}
          values={filters}
          onChange={(key, value) => setFilters((f) => ({ ...f, [key]: value }))}
          onReset={() => setFilters(EMPTY)}
        />
        <label className="flex flex-col gap-1 text-xs text-muted">
          Sortierung
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as Sort)}
            className="h-9 rounded-md border border-line bg-surface px-2.5 text-sm text-fg"
          >
            <option value="grade">Nach Schulklasse</option>
            <option value="strokes">Nach Strichzahl</option>
          </select>
        </label>
      </div>
      <p className="text-sm text-muted" aria-live="polite">
        {results.length} Kanji
      </p>
      {results.length === 0 ? (
        <EmptyState ja="無" title="Keine passenden Kanji." description="Passe die Filter an." />
      ) : (
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
          {results.map((kanji) => (
            <li key={kanji.id}>
              <KanjiCard kanji={kanji} status={status.get(kanji.id)} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
