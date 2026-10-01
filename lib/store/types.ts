import type { LearnerProfile } from "@/lib/profile";
import type { ContentType, LearningStatus } from "@/types/content";

/** Lernfortschritt eines Inhalts – entspricht der Tabelle user_learning_progress. */
export type ProgressRecord = {
  contentType: ContentType;
  contentId: string;
  status: LearningStatus;
  easeFactor: number;
  intervalDays: number;
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

/**
 * Speicher für alle nutzerbezogenen Daten. Zwei Implementierungen:
 * - LocalUserDataStore: Gastmodus, im Browser (localStorage)
 * - Supabase-Implementierung (ab Phase 2): eingeloggte Nutzer, durch RLS geschützt
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
}

export function emptyProgress(contentType: ContentType, contentId: string): ProgressRecord {
  return {
    contentType,
    contentId,
    status: "unseen",
    easeFactor: 2.5,
    intervalDays: 0,
    nextReviewAt: null,
    lastReviewedAt: null,
    correctCount: 0,
    incorrectCount: 0,
  };
}
