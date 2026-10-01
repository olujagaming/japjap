import { isDue } from "@/lib/learning/progress";
import { sm2Scheduler } from "@/lib/srs/sm2";
import type { ReviewRating } from "@/lib/srs/types";
import type { ProgressRecord } from "@/lib/store/types";
import type { ReviewIntensity } from "@/lib/settings/schema";
import type { ContentType } from "@/types/content";

/** Inhaltsarten, für die es Review-Aufgaben gibt. */
export const REVIEWABLE_TYPES = [
  "kana",
  "vocabulary",
  "kanji",
  "grammar",
  "conversation",
] as const satisfies readonly ContentType[];
export type ReviewableType = (typeof REVIEWABLE_TYPES)[number];

export const SESSION_SIZE: Record<ReviewIntensity, number> = {
  light: 10,
  normal: 20,
  intensive: 40,
};

const isReviewable = (type: ContentType): type is ReviewableType =>
  (REVIEWABLE_TYPES as readonly string[]).includes(type);

/** Fällige Inhalte, älteste zuerst, je Art gezählt. */
export function dueRecords(
  records: readonly ProgressRecord[],
  now: Date,
  types?: readonly ContentType[],
) {
  return records
    .filter(
      (r) =>
        isReviewable(r.contentType) && (!types || types.includes(r.contentType)) && isDue(r, now),
    )
    .sort((a, b) => Date.parse(a.nextReviewAt!) - Date.parse(b.nextReviewAt!));
}

export function dueCountsByType(
  records: readonly ProgressRecord[],
  now: Date,
): Record<ReviewableType, number> {
  const counts = Object.fromEntries(REVIEWABLE_TYPES.map((t) => [t, 0])) as Record<
    ReviewableType,
    number
  >;
  for (const r of dueRecords(records, now)) counts[r.contentType as ReviewableType]++;
  return counts;
}

/**
 * Mischt Arten im Reißverschlussverfahren, damit eine Session abwechslungsreich bleibt
 * („Mixed Review“), behält aber innerhalb jeder Art die Fälligkeitsreihenfolge.
 */
export function interleaveByType(records: readonly ProgressRecord[]): ProgressRecord[] {
  const groups = new Map<ContentType, ProgressRecord[]>();
  for (const r of records) groups.set(r.contentType, [...(groups.get(r.contentType) ?? []), r]);
  const queues = [...groups.values()];
  const result: ProgressRecord[] = [];
  while (queues.some((q) => q.length > 0)) {
    for (const q of queues) {
      const next = q.shift();
      if (next) result.push(next);
    }
  }
  return result;
}

export function buildReviewQueue(options: {
  records: readonly ProgressRecord[];
  now: Date;
  limit: number;
  types?: readonly ContentType[];
}): ProgressRecord[] {
  const due = dueRecords(options.records, options.now, options.types).slice(0, options.limit);
  return interleaveByType(due);
}

/** Wie viele Wiederholungen in den nächsten Tagen anstehen (Index 0 = heute). */
export function forecast(records: readonly ProgressRecord[], now: Date, days = 7): number[] {
  const result = Array.from({ length: days }, () => 0);
  const startOfToday = new Date(now);
  startOfToday.setHours(0, 0, 0, 0);
  for (const r of records) {
    if (!r.nextReviewAt || !isReviewable(r.contentType)) continue;
    const diff = Math.floor((Date.parse(r.nextReviewAt) - startOfToday.getTime()) / 86_400_000);
    if (diff >= days) continue;
    result[Math.max(0, diff)]++;
  }
  return result;
}

/** Vorschau der Intervalle für die vier Bewertungen – wird auf den Buttons angezeigt. */
export function intervalPreview(record: ProgressRecord, now: Date): Record<ReviewRating, string> {
  const state = {
    easeFactor: record.easeFactor,
    intervalDays: record.intervalDays,
    repetitions: record.repetitions,
    lapses: record.lapses,
    dueAt: null,
    lastReviewedAt: null,
  };
  const ratings: ReviewRating[] = ["again", "hard", "good", "easy"];
  return Object.fromEntries(
    ratings.map((rating) => [
      rating,
      formatInterval(sm2Scheduler.schedule(state, rating, now).intervalDays),
    ]),
  ) as Record<ReviewRating, string>;
}

export function formatInterval(days: number): string {
  const minutes = Math.round(days * 24 * 60);
  if (minutes < 60) return `${Math.max(1, minutes)} Min.`;
  const hours = Math.round(days * 24);
  if (hours < 24) return `${hours} Std.`;
  const d = Math.round(days);
  if (d < 14) return d === 1 ? "1 Tag" : `${d} Tage`;
  const weeks = Math.round(d / 7);
  if (d < 60) return `${weeks} Wo.`;
  return `${Math.round(d / 30)} Mon.`;
}
