"use client";

import { useSearchParams } from "next/navigation";
import { useDeferredValue, useMemo, useState } from "react";
import { VocabularyCard } from "@/components/learning/content-cards";
import { Button } from "@/components/ui/button";
import { FilterBar, type FilterDefinition } from "@/components/ui/filter-bar";
import { SearchInput } from "@/components/ui/search-input";
import { EmptyState, ErrorState } from "@/components/ui/states";
import { Tabs } from "@/components/ui/tabs";
import { FREQUENCY_LABELS, PART_OF_SPEECH_LABELS, TAG_LABELS, VOCABULARY } from "@/data/vocabulary";
import { useFavorites, useProgressList } from "@/hooks/use-user-data";
import { normalizeRomaji, toHiragana } from "@/lib/japanese/romaji";
import { isKnownStatus } from "@/lib/learning/progress";
import { LEARNING_STATUS_META } from "@/lib/learning-status";
import { LEARNING_STATUSES, PARTS_OF_SPEECH, type Vocabulary } from "@/types/content";

type View = "all" | "learning" | "known" | "favorites";
const PAGE_SIZE = 24;

const FILTERS: FilterDefinition[] = [
  { key: "jlpt", label: "JLPT", options: ["N5", "N4", "N3"].map((v) => ({ value: v, label: v })) },
  {
    key: "pos",
    label: "Wortart",
    options: PARTS_OF_SPEECH.filter((p) => VOCABULARY.some((v) => v.partOfSpeech === p)).map(
      (p) => ({
        value: p,
        label: PART_OF_SPEECH_LABELS[p],
      }),
    ),
  },
  {
    key: "tag",
    label: "Situation",
    options: Object.entries(TAG_LABELS).map(([value, label]) => ({ value, label })),
  },
  {
    key: "frequency",
    label: "Häufigkeit",
    options: Object.entries(FREQUENCY_LABELS).map(([value, label]) => ({ value, label })),
  },
  {
    key: "status",
    label: "Status",
    options: LEARNING_STATUSES.map((s) => ({ value: s, label: LEARNING_STATUS_META[s].label })),
  },
];

const EMPTY_FILTERS = { jlpt: "", pos: "", tag: "", frequency: "", status: "" };

function matchesText(word: Vocabulary, query: string) {
  if (!query) return true;
  const q = query.toLowerCase();
  const kana = toHiragana(query);
  const romaji = normalizeRomaji(query);
  return (
    word.japanese.includes(query) ||
    toHiragana(word.reading).includes(kana) ||
    word.german.some((g) => g.toLowerCase().includes(q)) ||
    (romaji.length > 1 && normalizeRomaji(word.romaji).includes(romaji))
  );
}

export function VocabularyBrowser() {
  const [view, setView] = useState<View>("all");
  const [query, setQuery] = useState("");
  const params = useSearchParams();
  const [filters, setFilters] = useState<Record<string, string>>(() => {
    const tag = params.get("tag");
    return tag && TAG_LABELS[tag] ? { ...EMPTY_FILTERS, tag } : EMPTY_FILTERS;
  });
  const [visible, setVisible] = useState(PAGE_SIZE);
  const deferredQuery = useDeferredValue(query.trim());

  const { data: records, error } = useProgressList("vocabulary");
  const { data: favorites } = useFavorites("vocabulary");
  const status = useMemo(() => new Map(records.map((r) => [r.contentId, r.status])), [records]);
  const favoriteIds = useMemo(() => new Set(favorites.map((f) => f.contentId)), [favorites]);

  const results = useMemo(
    () =>
      VOCABULARY.filter((word) => {
        const s = status.get(word.id) ?? "unseen";
        if (view === "learning" && !(s === "learning" || s === "familiar")) return false;
        if (view === "known" && !isKnownStatus(s)) return false;
        if (view === "favorites" && !favoriteIds.has(word.id)) return false;
        if (filters.jlpt && word.jlpt !== filters.jlpt) return false;
        if (filters.pos && word.partOfSpeech !== filters.pos) return false;
        if (filters.tag && !word.tags.includes(filters.tag)) return false;
        if (filters.frequency && String(word.frequency) !== filters.frequency) return false;
        if (filters.status && s !== filters.status) return false;
        return matchesText(word, deferredQuery);
      }),
    [view, filters, deferredQuery, status, favoriteIds],
  );

  const resetPaging = () => setVisible(PAGE_SIZE);

  if (error) return <ErrorState />;

  return (
    <Tabs<View>
      label="Ansicht"
      value={view}
      onChange={(v) => {
        setView(v);
        resetPaging();
      }}
      items={[
        { value: "all", label: "Alle" },
        { value: "learning", label: "Am Lernen" },
        { value: "known", label: "Bekannt" },
        { value: "favorites", label: "Favoriten" },
      ]}
    >
      <div className="flex flex-col gap-6">
        <SearchInput
          label="Vokabeln durchsuchen"
          placeholder="Japanisch, Romaji oder Deutsch"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            resetPaging();
          }}
        />
        <FilterBar
          filters={FILTERS}
          values={filters}
          onChange={(key, value) => {
            setFilters((f) => ({ ...f, [key]: value }));
            resetPaging();
          }}
          onReset={() => setFilters(EMPTY_FILTERS)}
        />
        <p className="text-sm text-muted" aria-live="polite">
          {results.length} {results.length === 1 ? "Wort" : "Wörter"}
        </p>
        {results.length === 0 ? (
          <EmptyState
            ja="空"
            title={view === "favorites" ? "Noch keine Favoriten." : "Keine passenden Wörter."}
            description={
              view === "favorites"
                ? "Speichere Wörter auf ihrer Detailseite – sie erscheinen dann hier."
                : "Passe Suche oder Filter an."
            }
          />
        ) : (
          <>
            <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {results.slice(0, visible).map((word) => (
                <li key={word.id}>
                  <VocabularyCard word={word} status={status.get(word.id)} />
                </li>
              ))}
            </ul>
            {visible < results.length ? (
              <Button
                variant="secondary"
                className="self-center"
                onClick={() => setVisible((n) => n + PAGE_SIZE)}
              >
                Weitere {Math.min(PAGE_SIZE, results.length - visible)} anzeigen
              </Button>
            ) : null}
          </>
        )}
      </div>
    </Tabs>
  );
}
