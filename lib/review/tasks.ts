import { clozesForGrammar, type Cloze } from "@/data/cloze";
import { getKanaById } from "@/data/kana";
import { getConversation, getGrammar, getKanji, getSituation, getVocabulary } from "@/lib/content";
import type { ProgressRecord } from "@/lib/store/types";
import type {
  Conversation,
  ConversationLine,
  GrammarPoint,
  Kana,
  Kanji,
  Vocabulary,
} from "@/types/content";

/**
 * Review-Aufgaben. Jede fällige Einheit wird zu genau einer Aufgabe; die Art wechselt mit
 * wachsender Sicherheit (erst erkennen, dann aktiv abrufen und hören).
 */
export type ReviewTask =
  | { kind: "kana-reading"; record: ProgressRecord; kana: Kana }
  | { kind: "vocab-meaning"; record: ProgressRecord; word: Vocabulary }
  | { kind: "vocab-recall"; record: ProgressRecord; word: Vocabulary }
  | { kind: "vocab-listening"; record: ProgressRecord; word: Vocabulary }
  | { kind: "kanji-meaning"; record: ProgressRecord; kanji: Kanji }
  | { kind: "grammar-cloze"; record: ProgressRecord; point: GrammarPoint; cloze: Cloze }
  | { kind: "grammar-meaning"; record: ProgressRecord; point: GrammarPoint }
  | {
      kind: "situational";
      record: ProgressRecord;
      conversation: Conversation;
      situationTitleDe: string;
      line: ConversationLine;
      previous?: ConversationLine;
    };

export const TASK_LABELS: Record<ReviewTask["kind"], string> = {
  "kana-reading": "Kana lesen",
  "vocab-meaning": "Bedeutung",
  "vocab-recall": "Auf Japanisch",
  "vocab-listening": "Hören",
  "kanji-meaning": "Kanji-Bedeutung",
  "grammar-cloze": "Lückensatz",
  "grammar-meaning": "Grammatik",
  situational: "Situation",
};

export function createTask(record: ProgressRecord): ReviewTask | null {
  const reps = record.repetitions;
  switch (record.contentType) {
    case "kana": {
      const kana = getKanaById(record.contentId);
      return kana ? { kind: "kana-reading", record, kana } : null;
    }
    case "vocabulary": {
      const word = getVocabulary(record.contentId);
      if (!word) return null;
      // Neu und unsicher: erkennen. Danach abwechselnd aktiv abrufen und hören.
      const kind =
        reps < 2
          ? "vocab-meaning"
          : (["vocab-recall", "vocab-listening", "vocab-meaning"] as const)[(reps - 2) % 3];
      return { kind, record, word };
    }
    case "kanji": {
      const kanji = getKanji(record.contentId);
      return kanji ? { kind: "kanji-meaning", record, kanji } : null;
    }
    case "grammar": {
      const point = getGrammar(record.contentId);
      if (!point) return null;
      const clozes = clozesForGrammar(point.id);
      if (clozes.length === 0) return { kind: "grammar-meaning", record, point };
      return { kind: "grammar-cloze", record, point, cloze: clozes[reps % clozes.length] };
    }
    case "conversation": {
      const conversation = getConversation(record.contentId);
      if (!conversation) return null;
      const learner = conversation.speakers.find((s) => s.isLearner)!.key;
      const learnerLines = conversation.lines
        .map((line, index) => ({ line, index }))
        // Sehr kurze Antworten wie „はい、どうぞ。“ eignen sich kaum als Aufgabe
        .filter(({ line }) => line.speaker === learner && line.reading.length >= 6);
      if (learnerLines.length === 0) return null;
      const { line, index } = learnerLines[reps % learnerLines.length];
      return {
        kind: "situational",
        record,
        conversation,
        situationTitleDe: getSituation(conversation.situationId)?.titleDe ?? "",
        line,
        previous: index > 0 ? conversation.lines[index - 1] : undefined,
      };
    }
    default:
      return null;
  }
}

export function createTasks(records: readonly ProgressRecord[]): ReviewTask[] {
  return records.map(createTask).filter((t): t is ReviewTask => t !== null);
}
