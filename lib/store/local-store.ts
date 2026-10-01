import { z } from "zod";
import { learnerProfileSchema, type LearnerProfile } from "@/lib/profile";
import { CONTENT_TYPES, LEARNING_STATUSES, type ContentType } from "@/types/content";
import { REVIEW_RATINGS } from "@/lib/srs/types";
import type { FavoriteRecord, ProgressRecord, ReviewLogEntry, UserDataStore } from "./types";

const STORAGE_KEY = "japjap.userdata.v1";

const progressSchema = z.object({
  contentType: z.enum(CONTENT_TYPES),
  contentId: z.string(),
  status: z.enum(LEARNING_STATUSES),
  easeFactor: z.number(),
  intervalDays: z.number(),
  repetitions: z.number().int().nonnegative().default(0),
  lapses: z.number().int().nonnegative().default(0),
  nextReviewAt: z.string().nullable(),
  lastReviewedAt: z.string().nullable(),
  correctCount: z.number().int().nonnegative(),
  incorrectCount: z.number().int().nonnegative(),
});

const favoriteSchema = z.object({
  contentType: z.enum(CONTENT_TYPES),
  contentId: z.string(),
  createdAt: z.string(),
});

const reviewLogSchema = z.object({
  contentType: z.enum(CONTENT_TYPES),
  contentId: z.string(),
  taskType: z.string(),
  rating: z.enum(REVIEW_RATINGS),
  answer: z.string().optional(),
  reviewedAt: z.string(),
});

/** Im Browser wird nur ein begrenzter Verlauf gehalten. */
const MAX_LOG_ENTRIES = 2000;

const dataSchema = z.object({
  profile: learnerProfileSchema.nullable().catch(null),
  progress: z.record(z.string(), progressSchema).catch({}),
  favorites: z.array(favoriteSchema).catch([]),
  reviewLog: z.array(reviewLogSchema).catch([]),
});

type Data = z.infer<typeof dataSchema>;

const EMPTY: Data = { profile: null, progress: {}, favorites: [], reviewLog: [] };

const progressKey = (type: ContentType, id: string) => `${type}:${id}`;

/** Gastmodus-Speicher. `storage` ist injizierbar (Tests, sessionStorage). */
export class LocalUserDataStore implements UserDataStore {
  constructor(
    private readonly storage: Pick<Storage, "getItem" | "setItem"> | null = typeof window !==
    "undefined"
      ? window.localStorage
      : null,
  ) {}

  private read(): Data {
    try {
      const raw = this.storage?.getItem(STORAGE_KEY);
      if (!raw) return structuredClone(EMPTY);
      const parsed = dataSchema.safeParse(JSON.parse(raw));
      return parsed.success ? parsed.data : structuredClone(EMPTY);
    } catch {
      return structuredClone(EMPTY);
    }
  }

  private write(data: Data): void {
    try {
      this.storage?.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch {
      // Speicher nicht verfügbar – Daten bleiben nur für diesen Aufruf erhalten.
    }
  }

  async getProfile() {
    return this.read().profile;
  }

  async saveProfile(profile: LearnerProfile) {
    const data = this.read();
    data.profile = learnerProfileSchema.parse(profile);
    this.write(data);
  }

  async getProgress(contentType: ContentType, contentId: string) {
    return this.read().progress[progressKey(contentType, contentId)] ?? null;
  }

  async listProgress(contentType?: ContentType) {
    const all = Object.values(this.read().progress);
    return contentType ? all.filter((r) => r.contentType === contentType) : all;
  }

  async saveProgress(record: ProgressRecord) {
    const data = this.read();
    data.progress[progressKey(record.contentType, record.contentId)] = progressSchema.parse(record);
    this.write(data);
  }

  async listFavorites(contentType?: ContentType): Promise<FavoriteRecord[]> {
    const all = this.read().favorites;
    return contentType ? all.filter((f) => f.contentType === contentType) : all;
  }

  async toggleFavorite(contentType: ContentType, contentId: string) {
    const data = this.read();
    const index = data.favorites.findIndex(
      (f) => f.contentType === contentType && f.contentId === contentId,
    );
    if (index >= 0) {
      data.favorites.splice(index, 1);
    } else {
      data.favorites.push({ contentType, contentId, createdAt: new Date().toISOString() });
    }
    this.write(data);
    return index < 0;
  }

  async recordReview(entry: ReviewLogEntry) {
    const data = this.read();
    data.reviewLog.unshift(reviewLogSchema.parse(entry));
    data.reviewLog.length = Math.min(data.reviewLog.length, MAX_LOG_ENTRIES);
    this.write(data);
  }

  async listReviewLog(options: { since?: string; limit?: number } = {}) {
    let log = this.read().reviewLog;
    if (options.since) log = log.filter((e) => e.reviewedAt >= options.since!);
    return options.limit ? log.slice(0, options.limit) : log;
  }
}
