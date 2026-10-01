"use client";

import { useEffect } from "react";
import { LearningStatusBadge } from "@/components/learning/badges";
import { Button, ButtonLink } from "@/components/ui/button";
import { useProgress } from "@/hooks/use-user-data";
import {
  isDue,
  markKnown,
  markSeen,
  perceivedDifficulty,
  scheduleNow,
  setDifficulty,
  type PerceivedDifficulty,
} from "@/lib/learning/progress";
import { cn } from "@/lib/utils";
import type { Kana } from "@/types/content";

const DIFFICULTY_LABELS: Record<PerceivedDifficulty, string> = {
  easy: "Leicht",
  normal: "Normal",
  hard: "Schwer",
};

function formatDue(iso: string | null) {
  if (!iso) return null;
  const date = new Date(iso);
  return date.toLocaleDateString("de-DE", { day: "numeric", month: "long" });
}

export function KanaReviewActions({ kana }: { kana: Kana }) {
  const { data: record, loading, update } = useProgress("kana", kana.id);

  // Erstes Ansehen zählt: unseen → familiar
  useEffect(() => {
    void update(markSeen);
  }, [update]);

  const difficulty = perceivedDifficulty(record);
  const attempts = record.correctCount + record.incorrectCount;
  const due = isDue(record);

  return (
    <div className="flex flex-col gap-5" aria-busy={loading}>
      <div className="flex flex-wrap items-center gap-3">
        <LearningStatusBadge status={record.status} />
        {attempts > 0 ? (
          <span className="text-sm text-muted tabular-nums">
            {record.correctCount} von {attempts} richtig
          </span>
        ) : null}
        {record.nextReviewAt ? (
          <span className="text-sm text-muted">
            {due
              ? "Wiederholung fällig"
              : `Nächste Wiederholung: ${formatDue(record.nextReviewAt)}`}
          </span>
        ) : null}
      </div>

      <div className="flex flex-wrap gap-2">
        <ButtonLink href={`/kana/practice?mode=mixed&chars=${encodeURIComponent(kana.character)}`}>
          Jetzt üben
        </ButtonLink>
        <Button variant="secondary" onClick={() => update(scheduleNow)} disabled={due}>
          {due ? "In der Wiederholung" : "Wiederholen"}
        </Button>
        <Button
          variant="secondary"
          onClick={() => update((r) => markKnown(r))}
          disabled={record.status === "known" || record.status === "mastered"}
        >
          Als bekannt markieren
        </Button>
      </div>

      <div>
        <p id="difficulty-label" className="mb-2 text-sm text-muted">
          Wie schwer fällt dir dieses Zeichen?
        </p>
        <div
          role="radiogroup"
          aria-labelledby="difficulty-label"
          className="inline-flex rounded-md border border-line bg-surface-2 p-0.5"
        >
          {(Object.keys(DIFFICULTY_LABELS) as PerceivedDifficulty[]).map((value) => (
            <button
              key={value}
              type="button"
              role="radio"
              aria-checked={difficulty === value}
              onClick={() => update((r) => setDifficulty(r, value))}
              className={cn(
                "h-8 rounded-[5px] px-3 text-sm transition-colors",
                difficulty === value
                  ? "bg-surface font-medium text-fg shadow-soft"
                  : "text-muted hover:text-fg",
              )}
            >
              {DIFFICULTY_LABELS[value]}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
