/**
 * Spaced-Repetition-Vertrag. Phase 5 liefert einen SM-2-basierten Scheduler;
 * durch das Interface kann später z. B. FSRS eingesetzt werden, ohne UI-Code anzufassen.
 */

export const REVIEW_RATINGS = ["again", "hard", "good", "easy"] as const;
export type ReviewRating = (typeof REVIEW_RATINGS)[number];

export const REVIEW_RATING_LABELS: Record<ReviewRating, string> = {
  again: "Nochmal",
  hard: "Schwer",
  good: "Gut",
  easy: "Leicht",
};

export type SrsState = {
  easeFactor: number;
  intervalDays: number;
  repetitions: number;
  lapses: number;
  dueAt: Date | null;
  lastReviewedAt: Date | null;
};

export type ReviewLogEntry = {
  rating: ReviewRating;
  reviewedAt: Date;
  previousIntervalDays: number;
  nextIntervalDays: number;
};

export interface SrsScheduler {
  /** Kennung, wird mit jedem Review gespeichert (Migration zwischen Algorithmen). */
  readonly id: string;
  initialState(): SrsState;
  schedule(state: SrsState, rating: ReviewRating, now: Date, history?: ReviewLogEntry[]): SrsState;
}
