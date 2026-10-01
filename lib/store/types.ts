import type { LearnerProfile } from "@/lib/profile";
import type { ReviewRating } from "@/lib/srs/types";
import type { ContentType, LearningStatus } from "@/types/content";

/** Lernfortschritt eines Inhalts – entspricht der Tabelle user_learning_progress. */
export type ProgressRecord = {
  contentType: ContentType;
  contentId: string;
  status: LearningStatus;
  easeFactor: number;
  intervalDays: number;
  repetitions: number;
  lapses: number;
  nextReviewAt: string | null;
  lastReviewedAt: string | null;
  correctCount: number;
  incorrectCount: number;
};

export type FavoriteRecord = {
  contentType: ContentType;
  contentId: string;
  createdAt: string;
};

/** Ein einzelner Übungs- oder Review-Versuch – entspricht review_history. */
export type ReviewLogEntry = {
  contentType: ContentType;
  contentId: string;
  /** z. B. „kana-recognition“, „kana-listening“ */
  taskType: string;
  rating: ReviewRating;
  answer?: string;
  reviewedAt: string;
};

/**
 * Speicher für alle nutzerbezogenen Daten. Zwei Implementierungen:
 * - LocalUserDataStore: Gastmodus, im Browser (localStorage)
 * - SupabaseUserDataStore: eingeloggte Nutzer, durch RLS geschützt
 * Die API ist asynchron, damit beide austauschbar sind.
 */
export interface UserDataStore {
  getProfile(): Promise<LearnerProfile | null>;
  saveProfile(profile: LearnerProfile): Promise<void>;

  getProgress(contentType: ContentType, contentId: string): Promise<ProgressRecord | null>;
  listProgress(contentType?: ContentType): Promise<ProgressRecord[]>;
  saveProgress(record: ProgressRecord): Promise<void>;

  listFavorites(contentType?: ContentType): Promise<FavoriteRecord[]>;
  /** Liefert den neuen Zustand (true = jetzt Favorit). */
  toggleFavorite(contentType: ContentType, contentId: string): Promise<boolean>;

  recordReview(entry: ReviewLogEntry): Promise<void>;
  /** Neueste Einträge zuerst. */
  listReviewLog(options?: { since?: string; limit?: number }): Promise<ReviewLogEntry[]>;
}

export function emptyProgress(contentType: ContentType, contentId: string): ProgressRecord {
  return {
    contentType,
    contentId,
    status: "unseen",
    easeFactor: 2.5,
    intervalDays: 0,
    repetitions: 0,
    lapses: 0,
    nextReviewAt: null,
    lastReviewedAt: null,
    correctCount: 0,
    incorrectCount: 0,
  };
}
