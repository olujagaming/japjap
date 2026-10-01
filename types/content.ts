/**
 * Domain-Typen für Lerninhalte. Spiegeln das Datenbankschema (supabase/migrations)
 * in camelCase wider; Seed-Daten in /data werden gegen diese Typen geschrieben.
 */

export const LEARNING_STATUSES = ["unseen", "familiar", "learning", "known", "mastered"] as const;
export type LearningStatus = (typeof LEARNING_STATUSES)[number];

export const CONTENT_TYPES = [
  "kana",
  "vocabulary",
  "kanji",
  "grammar",
  "sentence",
  "expression",
  "conversation",
] as const;
export type ContentType = (typeof CONTENT_TYPES)[number];

export const DIFFICULTIES = ["beginner", "elementary", "intermediate", "advanced"] as const;
export type Difficulty = (typeof DIFFICULTIES)[number];

export type JlptLevel = "N5" | "N4" | "N3" | "N2" | "N1";

export type ScriptType = "hiragana" | "katakana";

export type Kana = {
  id: string;
  character: string;
  scriptType: ScriptType;
  romaji: string;
  /** Aussprachehinweis auf Deutsch, z. B. „wie ‚tsu‘ in ‚Tsunami‘“. */
  pronunciation?: string;
  row: string;
  group: "basic" | "dakuten" | "handakuten" | "yoon";
  strokeCount?: number;
  /** Vorbereitet für SVG-Strichdaten (z. B. KanjiVG-Format). */
  strokeOrderData?: string[];
  audioUrl?: string;
  baseCharacter?: string;
  dakutenVariant?: string;
  handakutenVariant?: string;
  relatedCharacters: string[];
  confusionGroup?: string;
};

export type Vocabulary = {
  id: string;
  japanese: string;
  reading: string;
  /** Optional: Furigana-Notation `食[た]べる` für präzise Zuordnung. */
  furigana?: string;
  romaji: string;
  german: string[];
  english?: string[];
  partOfSpeech: string;
  jlpt?: JlptLevel;
  frequency?: number;
  audioUrl?: string;
  tags: string[];
};

export type Kanji = {
  id: string;
  character: string;
  meaningsDe: string[];
  meaningsEn?: string[];
  onyomi: string[];
  kunyomi: string[];
  radical: string;
  components: string[];
  strokeCount: number;
  jlpt?: JlptLevel;
  frequency?: number;
  grade?: number;
  strokeOrderData?: string[];
};

export type GrammarPoint = {
  id: string;
  slug: string;
  pattern: string;
  meaningDe: string;
  structure: string;
  explanationDe: string;
  jlpt?: JlptLevel;
  usageNotes?: string;
  commonMistakes?: string[];
};

export type Sentence = {
  id: string;
  japanese: string;
  furigana?: string;
  reading: string;
  romaji: string;
  german: string;
  audioUrl?: string;
  vocabularyIds: string[];
  grammarIds: string[];
};

export type Situation = {
  id: string;
  slug: string;
  titleJa: string;
  titleDe: string;
  descriptionDe: string;
  difficulty: Difficulty;
  category: "everyday" | "travel" | "social" | "work";
};

export type Conversation = {
  id: string;
  titleJa: string;
  titleDe: string;
  situationId: string;
  difficulty: Difficulty;
  jlptEstimate?: JlptLevel;
  descriptionDe: string;
  audioUrl?: string;
};

export type ConversationLine = {
  conversationId: string;
  speaker: string;
  position: number;
  japanese: string;
  furigana?: string;
  reading: string;
  romaji: string;
  german: string;
  audioUrl?: string;
};
