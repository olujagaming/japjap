"use client";

import { ProgressCard } from "@/components/learning/learning-card";
import { BASIC_COUNT, BASIC_KANA_IDS } from "@/data/kana";
import { useProgressList } from "@/hooks/use-user-data";
import type { ContentType } from "@/types/content";

const KNOWN = new Set(["known", "mastered"]);

const AREAS: {
  label: string;
  ja: string;
  type: ContentType;
  max?: number;
  filter?: (id: string) => boolean;
}[] = [
  {
    label: "Hiragana",
    ja: "ひらがな",
    type: "kana",
    max: BASIC_COUNT,
    filter: (id) => id.startsWith("h-") && BASIC_KANA_IDS.has(id),
  },
  {
    label: "Katakana",
    ja: "カタカナ",
    type: "kana",
    max: BASIC_COUNT,
    filter: (id) => id.startsWith("k-") && BASIC_KANA_IDS.has(id),
  },
  { label: "Vokabeln", ja: "語彙", type: "vocabulary" },
  { label: "Kanji", ja: "漢字", type: "kanji" },
  { label: "Grammatik", ja: "文法", type: "grammar" },
];

/** Kompakter Wissensstand: Anzahl sicher bekannter Inhalte je Bereich. */
export function LearningOverview() {
  const { data } = useProgressList();
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
      {AREAS.map((area) => {
        const known = data.filter(
          (r) =>
            r.contentType === area.type &&
            KNOWN.has(r.status) &&
            (area.filter ? area.filter(r.contentId) : true),
        ).length;
        return (
          <ProgressCard
            key={area.label}
            label={area.label}
            ja={area.ja}
            value={known}
            max={area.max}
            hint={area.max === undefined ? "bekannt" : undefined}
          />
        );
      })}
    </div>
  );
}
