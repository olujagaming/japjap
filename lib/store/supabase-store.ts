import type { SupabaseClient } from "@supabase/supabase-js";
import { learnerProfileSchema, type LearnerProfile } from "@/lib/profile";
import type { ContentType } from "@/types/content";
import type { FavoriteRecord, ProgressRecord, ReviewLogEntry, UserDataStore } from "./types";

type ProgressRow = {
  content_type: ContentType;
  content_id: string;
  status: ProgressRecord["status"];
  ease_factor: number;
  interval_days: number;
  repetitions: number;
  lapses: number;
  next_review_at: string | null;
  last_reviewed_at: string | null;
  correct_count: number;
  incorrect_count: number;
};

const PROGRESS_COLUMNS =
  "content_type, content_id, status, ease_factor, interval_days, repetitions, lapses, next_review_at, last_reviewed_at, correct_count, incorrect_count";

function fromRow(row: ProgressRow): ProgressRecord {
  return {
    contentType: row.content_type,
    contentId: row.content_id,
    status: row.status,
    easeFactor: Number(row.ease_factor),
    intervalDays: Number(row.interval_days),
    repetitions: row.repetitions,
    lapses: row.lapses,
    nextReviewAt: row.next_review_at,
    lastReviewedAt: row.last_reviewed_at,
    correctCount: row.correct_count,
    incorrectCount: row.incorrect_count,
  };
}

function check<T>(result: { data: T; error: { message: string } | null }): T {
  if (result.error) throw new Error(result.error.message);
  return result.data;
}

/**
 * Nutzerdaten in Supabase. Jede Abfrage setzt user_id explizit;
 * RLS stellt zusätzlich sicher, dass nur eigene Zeilen erreichbar sind.
 */
export class SupabaseUserDataStore implements UserDataStore {
  constructor(
    private readonly client: SupabaseClient,
    private readonly userId: string,
  ) {}

  async getProfile(): Promise<LearnerProfile | null> {
    const data = check(
      await this.client
        .from("profiles")
        .select(
          "experience, goals, hiragana_knowledge, katakana_knowledge, aids, daily_minutes, onboarding_completed_at",
        )
        .eq("id", this.userId)
        .maybeSingle(),
    );
    if (!data?.onboarding_completed_at) return null;
    const parsed = learnerProfileSchema.safeParse({
      experience: data.experience,
      goals: data.goals,
      hiragana: data.hiragana_knowledge,
      katakana: data.katakana_knowledge,
      aids: data.aids,
      dailyMinutes: data.daily_minutes,
      completedAt: data.onboarding_completed_at,
    });
    return parsed.success ? parsed.data : null;
  }

  async saveProfile(profile: LearnerProfile) {
    check(
      await this.client.from("profiles").upsert({
        id: this.userId,
        experience: profile.experience,
        goals: profile.goals,
        hiragana_knowledge: profile.hiragana,
        katakana_knowledge: profile.katakana,
        aids: profile.aids,
        daily_minutes: profile.dailyMinutes,
        onboarding_completed_at: profile.completedAt,
        updated_at: new Date().toISOString(),
      }),
    );
  }

  async getProgress(contentType: ContentType, contentId: string) {
    const data = check(
      await this.client
        .from("user_learning_progress")
        .select(PROGRESS_COLUMNS)
        .eq("user_id", this.userId)
        .eq("content_type", contentType)
        .eq("content_id", contentId)
        .maybeSingle<ProgressRow>(),
    );
    return data ? fromRow(data) : null;
  }

  async listProgress(contentType?: ContentType) {
    let query = this.client
      .from("user_learning_progress")
      .select(PROGRESS_COLUMNS)
      .eq("user_id", this.userId);
    if (contentType) query = query.eq("content_type", contentType);
    const data = check(await query.returns<ProgressRow[]>());
    return (data ?? []).map(fromRow);
  }

  async saveProgress(record: ProgressRecord) {
    check(
      await this.client.from("user_learning_progress").upsert({
        user_id: this.userId,
        content_type: record.contentType,
        content_id: record.contentId,
        status: record.status,
        ease_factor: record.easeFactor,
        interval_days: record.intervalDays,
        repetitions: record.repetitions,
        lapses: record.lapses,
        next_review_at: record.nextReviewAt,
        last_reviewed_at: record.lastReviewedAt,
        correct_count: record.correctCount,
        incorrect_count: record.incorrectCount,
        updated_at: new Date().toISOString(),
      }),
    );
  }

  async listFavorites(contentType?: ContentType): Promise<FavoriteRecord[]> {
    let query = this.client
      .from("favorites")
      .select("content_type, content_id, created_at")
      .eq("user_id", this.userId)
      .order("created_at", { ascending: false });
    if (contentType) query = query.eq("content_type", contentType);
    const data = check(await query);
    return (data ?? []).map((row) => ({
      contentType: row.content_type as ContentType,
      contentId: row.content_id as string,
      createdAt: row.created_at as string,
    }));
  }

  async toggleFavorite(contentType: ContentType, contentId: string) {
    const existing = check(
      await this.client
        .from("favorites")
        .select("content_id")
        .eq("user_id", this.userId)
        .eq("content_type", contentType)
        .eq("content_id", contentId)
        .maybeSingle(),
    );
    if (existing) {
      check(
        await this.client
          .from("favorites")
          .delete()
          .eq("user_id", this.userId)
          .eq("content_type", contentType)
          .eq("content_id", contentId),
      );
      return false;
    }
    check(
      await this.client
        .from("favorites")
        .insert({ user_id: this.userId, content_type: contentType, content_id: contentId }),
    );
    return true;
  }

  async recordReview(entry: ReviewLogEntry) {
    check(
      await this.client.from("review_history").insert({
        user_id: this.userId,
        content_type: entry.contentType,
        content_id: entry.contentId,
        task_type: entry.taskType,
        rating: entry.rating,
        answer: entry.answer ?? null,
        reviewed_at: entry.reviewedAt,
      }),
    );
  }

  async listReviewLog(options: { since?: string; limit?: number } = {}) {
    let query = this.client
      .from("review_history")
      .select("content_type, content_id, task_type, rating, answer, reviewed_at")
      .eq("user_id", this.userId)
      .order("reviewed_at", { ascending: false })
      .limit(options.limit ?? 2000);
    if (options.since) query = query.gte("reviewed_at", options.since);
    const data = check(await query);
    return (data ?? []).map((row) => ({
      contentType: row.content_type as ContentType,
      contentId: row.content_id as string,
      taskType: row.task_type as string,
      rating: row.rating as ReviewLogEntry["rating"],
      answer: (row.answer as string | null) ?? undefined,
      reviewedAt: row.reviewed_at as string,
    }));
  }
}
