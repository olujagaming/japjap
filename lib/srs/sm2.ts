import type { ReviewRating, SrsScheduler, SrsState } from "./types";

const DAY = 24 * 60 * 60 * 1000;
const MIN_EASE = 1.3;
const MAX_EASE = 3.0;

/** Kurze Lernschritte für neue oder vergessene Inhalte (in Tagen). */
const AGAIN_INTERVAL = 10 / (24 * 60); // 10 Minuten
const HARD_FIRST_INTERVAL = 1 / 24; // 1 Stunde

/**
 * Vereinfachtes SM-2 mit vier Bewertungen (Anki-ähnlich):
 * - again: Zurück auf Anfang, Leichtigkeit sinkt, in 10 Minuten erneut
 * - hard:  Intervall wächst nur leicht, Leichtigkeit sinkt
 * - good:  Intervall × Leichtigkeit
 * - easy:  größerer Sprung, Leichtigkeit steigt
 */
export const sm2Scheduler: SrsScheduler = {
  id: "sm2",

  initialState(): SrsState {
    return {
      easeFactor: 2.5,
      intervalDays: 0,
      repetitions: 0,
      lapses: 0,
      dueAt: null,
      lastReviewedAt: null,
    };
  },

  schedule(state: SrsState, rating: ReviewRating, now: Date): SrsState {
    let { easeFactor, intervalDays, repetitions, lapses } = state;

    switch (rating) {
      case "again":
        if (repetitions > 0) lapses += 1;
        repetitions = 0;
        easeFactor -= 0.2;
        intervalDays = AGAIN_INTERVAL;
        break;
      case "hard":
        easeFactor -= 0.15;
        intervalDays = repetitions === 0 ? HARD_FIRST_INTERVAL : Math.max(1, intervalDays * 1.2);
        repetitions += 1;
        break;
      case "good":
        intervalDays =
          repetitions === 0 ? 1 : repetitions === 1 ? 3 : Math.max(1, intervalDays) * easeFactor;
        repetitions += 1;
        break;
      case "easy":
        easeFactor += 0.15;
        intervalDays = repetitions === 0 ? 4 : Math.max(1, intervalDays) * easeFactor * 1.3;
        repetitions += 1;
        break;
    }

    easeFactor = Math.min(MAX_EASE, Math.max(MIN_EASE, easeFactor));
    intervalDays = Math.round(intervalDays * 1000) / 1000;

    return {
      easeFactor: Math.round(easeFactor * 100) / 100,
      intervalDays,
      repetitions,
      lapses,
      lastReviewedAt: now,
      dueAt: new Date(now.getTime() + intervalDays * DAY),
    };
  },
};
