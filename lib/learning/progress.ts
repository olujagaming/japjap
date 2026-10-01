import { sm2Scheduler } from "@/lib/srs/sm2";
import type { ReviewRating, SrsScheduler } from "@/lib/srs/types";
import { emptyProgress, type ProgressRecord } from "@/lib/store/types";
import type { ContentType, LearningStatus } from "@/types/content";

/**
 * Regeln für Lernstatus und Wiederholungsplanung – unabhängig von UI und Speicher.
 *
 * unseen   → noch nie angesehen
 * familiar → angesehen, aber noch nicht geübt
 * learning → in Übung, Intervall unter 3 Tagen
 * known    → mehrfach richtig, Intervall ab 3 Tagen
 * mastered → stabil, Intervall ab 21 Tagen
 */

const DAY = 24 * 60 * 60 * 1000;

export function deriveStatus(
  record: Pick<ProgressRecord, "repetitions" | "intervalDays">,
): LearningStatus {
  if (record.repetitions === 0) return "learning";
  if (record.intervalDays >= 21) return "mastered";
  if (record.intervalDays >= 3) return "known";
  return "learning";
}

export function applyRating(
  record: ProgressRecord,
  rating: ReviewRating,
  now: Date = new Date(),
  scheduler: SrsScheduler = sm2Scheduler,
): ProgressRecord {
  const next = scheduler.schedule(
    {
      easeFactor: record.easeFactor,
      intervalDays: record.intervalDays,
      repetitions: record.repetitions,
      lapses: record.lapses,
      dueAt: record.nextReviewAt ? new Date(record.nextReviewAt) : null,
      lastReviewedAt: record.lastReviewedAt ? new Date(record.lastReviewedAt) : null,
    },
    rating,
    now,
  );
  const correct = rating !== "again";
  const updated: ProgressRecord = {
    ...record,
    easeFactor: next.easeFactor,
    intervalDays: next.intervalDays,
    repetitions: next.repetitions,
    lapses: next.lapses,
    nextReviewAt: next.dueAt?.toISOString() ?? null,
    lastReviewedAt: now.toISOString(),
    correctCount: record.correctCount + (correct ? 1 : 0),
    incorrectCount: record.incorrectCount + (correct ? 0 : 1),
  };
  return { ...updated, status: deriveStatus(updated) };
}

/** Beim ersten Ansehen: unseen → familiar. Alles andere bleibt unverändert. */
export function markSeen(record: ProgressRecord): ProgressRecord {
  return record.status === "unseen" ? { ...record, status: "familiar" } : record;
}

/** „Als bekannt markieren“: überspringt die Lernphase, nächste Kontrolle in einer Woche. */
export function markKnown(record: ProgressRecord, now: Date = new Date()): ProgressRecord {
  return {
    ...record,
    status: "known",
    repetitions: Math.max(record.repetitions, 2),
    intervalDays: Math.max(record.intervalDays, 7),
    nextReviewAt: new Date(now.getTime() + Math.max(record.intervalDays, 7) * DAY).toISOString(),
  };
}

/** „Wiederholen“: sofort in die Wiederholung aufnehmen. */
export function scheduleNow(record: ProgressRecord, now: Date = new Date()): ProgressRecord {
  return {
    ...record,
    status: record.status === "unseen" || record.status === "familiar" ? "learning" : record.status,
    nextReviewAt: now.toISOString(),
  };
}

export const DIFFICULTY_EASE = { easy: 2.8, normal: 2.5, hard: 1.8 } as const;
export type PerceivedDifficulty = keyof typeof DIFFICULTY_EASE;

/** Persönliche Schwierigkeit: beeinflusst, wie schnell Intervalle wachsen. */
export function setDifficulty(
  record: ProgressRecord,
  difficulty: PerceivedDifficulty,
): ProgressRecord {
  return { ...record, easeFactor: DIFFICULTY_EASE[difficulty] };
}

export function perceivedDifficulty(record: ProgressRecord): PerceivedDifficulty {
  if (record.easeFactor <= 2.0) return "hard";
  if (record.easeFactor >= 2.75) return "easy";
  return "normal";
}

/** Schwierige Inhalte: wiederholt falsch oder vom Nutzer als schwer markiert. */
export function isDifficult(record: ProgressRecord): boolean {
  const attempts = record.correctCount + record.incorrectCount;
  if (record.easeFactor <= 2.0) return true;
  return record.incorrectCount >= 2 && record.incorrectCount / attempts >= 0.3;
}

export function isDue(record: ProgressRecord, now: Date = new Date()): boolean {
  return record.nextReviewAt !== null && Date.parse(record.nextReviewAt) <= now.getTime();
}

export function isKnownStatus(status: LearningStatus): boolean {
  return status === "known" || status === "mastered";
}

export function progressOrEmpty(
  record: ProgressRecord | null | undefined,
  contentType: ContentType,
  contentId: string,
): ProgressRecord {
  return record ?? emptyProgress(contentType, contentId);
}
