"use client";

import { useEffect } from "react";
import { LearningStatusBadge } from "@/components/learning/badges";
import { Button, ButtonLink } from "@/components/ui/button";
import { StarIcon } from "@/components/ui/icons";
import { useFavorite, useProgress } from "@/hooks/use-user-data";
import {
  isDue,
  isKnownStatus,
  markKnown,
  markSeen,
  perceivedDifficulty,
  scheduleNow,
  setDifficulty,
  type PerceivedDifficulty,
} from "@/lib/learning/progress";
import { cn } from "@/lib/utils";
import type { ContentType } from "@/types/content";

const DIFFICULTY_LABELS: Record<PerceivedDifficulty, string> = {
  easy: "Leicht",
  normal: "Normal",
  hard: "Schwer",
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("de-DE", { day: "numeric", month: "long" });
}

/**
 * Lernaktionen für jeden Inhalt: Status, Wiederholung planen, als bekannt markieren,
 * persönliche Schwierigkeit und Favorit. Beim ersten Ansehen wird der Inhalt als „gesehen“ markiert.
 */
export function LearningActions({
  contentType,
  contentId,
  label,
  practiceHref,
  showDifficulty = true,
  favorite = true,
}: {
  contentType: ContentType;
  contentId: string;
  /** Name des Inhalts für Screenreader, z. B. „食べる“. */
  label: string;
  practiceHref?: string;
  showDifficulty?: boolean;
  favorite?: boolean;
}) {
  const { data: record, loading, update } = useProgress(contentType, contentId);
  const fav = useFavorite(contentType, contentId);

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
              : `Nächste Wiederholung: ${formatDate(record.nextReviewAt)}`}
          </span>
        ) : null}
      </div>

      <div className="flex flex-wrap gap-2">
        {practiceHref ? <ButtonLink href={practiceHref}>Jetzt üben</ButtonLink> : null}
        <Button
          variant={practiceHref ? "secondary" : "primary"}
          onClick={() => update(scheduleNow)}
          disabled={due}
        >
          {due ? "In der Wiederholung" : "Zur Wiederholung hinzufügen"}
        </Button>
        <Button
          variant="secondary"
          onClick={() => update((r) => markKnown(r))}
          disabled={isKnownStatus(record.status)}
        >
          Als bekannt markieren
        </Button>
        {favorite ? (
          <Button
            variant="ghost"
            onClick={() => void fav.toggle()}
            aria-pressed={fav.data}
            aria-label={
              fav.data ? `${label} aus Favoriten entfernen` : `${label} zu Favoriten hinzufügen`
            }
          >
            <StarIcon size={18} className={fav.data ? "fill-kohaku text-kohaku" : undefined} />
            {fav.data ? "Gespeichert" : "Speichern"}
          </Button>
        ) : null}
      </div>

      {showDifficulty ? (
        <div>
          <p id={`difficulty-${contentId}`} className="mb-2 text-sm text-muted">
            Wie schwer fällt dir das?
          </p>
          <div
            role="radiogroup"
            aria-labelledby={`difficulty-${contentId}`}
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
      ) : null}
    </div>
  );
}
