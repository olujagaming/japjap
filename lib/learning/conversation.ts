import { applyRating } from "@/lib/learning/progress";
import { emptyProgress, type ProgressRecord, type UserDataStore } from "@/lib/store/types";
import type { Conversation } from "@/types/content";

/** Ein Gespräch gilt als abgeschlossen, sobald es einmal vollständig durchgearbeitet wurde. */
export function isConversationCompleted(record: ProgressRecord | undefined): boolean {
  return Boolean(record && record.correctCount > 0);
}

export type ConversationTask =
  "conversation-reading" | "conversation-listening" | "conversation-roleplay";

/** Speichert den Abschluss eines Gesprächs als Wiederholung (Bewertung „gut“) mit Verlaufseintrag. */
export async function completeConversation(
  store: UserDataStore,
  id: string,
  task: ConversationTask,
  now = new Date(),
) {
  const current =
    (await store.getProgress("conversation", id)) ?? emptyProgress("conversation", id);
  await store.saveProgress(applyRating(current, "good", now));
  await store.recordReview({
    contentType: "conversation",
    contentId: id,
    taskType: task,
    rating: "good",
    reviewedAt: now.toISOString(),
  });
}

/** Unterschiedliche Tonhöhen, damit Sprecher in der Sprachsynthese unterscheidbar sind. */
export function speakerPitch(conversation: Conversation, speakerKey: string): number {
  const others = conversation.speakers.filter((s) => !s.isLearner).map((s) => s.key);
  const index = others.indexOf(speakerKey);
  if (index === -1) return 1;
  return [1.15, 0.85, 1.3][index % 3];
}
