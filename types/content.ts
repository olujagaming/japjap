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

export const KANA_GROUPS = ["basic", "dakuten", "handakuten", "yoon", "extended"] as const;
export type KanaGroup = (typeof KANA_GROUPS)[number];

export type Kana = {
  id: string;
  character: string;
  scriptType: ScriptType;
  /** Hepburn-Umschrift. */
  romaji: string;
  /** Weitere akzeptierte Eingaben (z. B. Kunrei-shiki „si“ für し). */
  alternatives: string[];
  /** Aussprachehinweis auf Deutsch. */
  pronunciation?: string;
  /** Konsonantenreihe, z. B. „ka“; „vowel“ für あ-Reihe. */
  row: string;
  /** Vokalspalte 0–4 (a i u e o) für die Tabellenanordnung; bei Yōon 0–2 (ya yu yo). */
  column: number;
  group: KanaGroup;
  strokeCount?: number;
  /** SVG-Pfade je Strich (KanjiVG, viewBox 0 0 109 109). Wird bei Bedarf geladen. */
  strokeOrderData?: string[];
  audioUrl?: string;
  /** Grundzeichen eines Dakuten-/Handakuten-/Yōon-Zeichens. */
  baseCharacter?: string;
  dakutenVariant?: string;
  handakutenVariant?: string;
  /** Gleiches Zeichen in der anderen Silbenschrift. */
  counterpart?: string;
  relatedCharacters: string[];
  confusionGroup?: string;
};

export const PARTS_OF_SPEECH = [
  "noun",
  "pronoun",
  "verb-godan",
  "verb-ichidan",
  "verb-irregular",
  "verb-suru",
  "adj-i",
  "adj-na",
  "adverb",
  "question",
  "counter",
  "expression",
] as const;
export type PartOfSpeech = (typeof PARTS_OF_SPEECH)[number];

/** 1 = sehr häufig, 2 = häufig, 3 = gelegentlich */
export type FrequencyTier = 1 | 2 | 3;

export type Vocabulary = {
  id: string;
  japanese: string;
  reading: string;
  /** Furigana-Notation `食[た]べる` für präzise Zuordnung (nur bei Kanji). */
  furigana?: string;
  romaji: string;
  german: string[];
  english?: string[];
  partOfSpeech: PartOfSpeech;
  jlpt?: JlptLevel;
  frequency: FrequencyTier;
  audioUrl?: string;
  /** Themen und Situationen, z. B. „restaurant“, „time“. */
  tags: string[];
  /** Kurzer Hinweis zur Verwendung auf Deutsch. */
  noteDe?: string;
  /** Inhaltlich verwandte Wörter (IDs). */
  related: string[];
};

export type Kanji = {
  id: string;
  character: string;
  meaningsDe: string[];
  meaningsEn?: string[];
  /** Sino-japanische Lesungen in Katakana. */
  onyomi: string[];
  /** Japanische Lesungen in Hiragana; Okurigana nach Punkt: た.べる */
  kunyomi: string[];
  radical: string;
  radicalMeaningDe: string;
  components: string[];
  strokeCount: number;
  jlpt?: JlptLevel;
  frequency: FrequencyTier;
  grade?: number;
  strokeOrderData?: string[];
  /** Merkhilfe oder Hinweis auf Deutsch. */
  noteDe?: string;
  related: string[];
};

export const GRAMMAR_CATEGORIES = ["basics", "requests", "wishes", "connecting"] as const;
export type GrammarCategory = (typeof GRAMMAR_CATEGORIES)[number];

export type GrammarPoint = {
  id: string;
  slug: string;
  pattern: string;
  meaningDe: string;
  structure: string;
  explanationDe: string;
  jlpt?: JlptLevel;
  category: GrammarCategory;
  /** Besonders häufig in Alltagsgesprächen. */
  common: boolean;
  usageNotes?: string;
  commonMistakes: string[];
  similar: string[];
};

export type Sentence = {
  id: string;
  japanese: string;
  furigana?: string;
  reading: string;
  romaji: string;
  german: string;
  /** Kontext für die Übersetzung, z. B. „an der Kasse“. */
  contextDe?: string;
  audioUrl?: string;
  vocabularyIds: string[];
  grammarIds: string[];
};

export const SITUATION_CATEGORIES = ["everyday", "travel", "social", "work"] as const;
export type SituationCategory = (typeof SITUATION_CATEGORIES)[number];

/** Fester Ausdruck, der in einer Situation immer wieder vorkommt. */
export type KeyExpression = {
  japanese: string;
  furigana?: string;
  reading: string;
  romaji: string;
  german: string;
  noteDe?: string;
};

export type Situation = {
  id: string;
  slug: string;
  titleJa: string;
  /** Lesung des japanischen Titels (für Furigana und Audio). */
  titleReading: string;
  titleDe: string;
  descriptionDe: string;
  difficulty: Difficulty;
  category: SituationCategory;
  keyExpressions: KeyExpression[];
  culturalNotesDe: string[];
  vocabularyIds: string[];
};

export type Speaker = {
  key: string;
  nameDe: string;
  nameJa: string;
  /** Der Lernende selbst – im Rollenspiel antwortet der Nutzer für diese Rolle. */
  isLearner: boolean;
};

export type ConversationLine = {
  id: string;
  conversationId: string;
  speaker: string;
  position: number;
  japanese: string;
  furigana?: string;
  reading: string;
  romaji: string;
  german: string;
  noteDe?: string;
  audioUrl?: string;
  vocabularyIds: string[];
  grammarIds: string[];
};

export type Conversation = {
  id: string;
  titleJa: string;
  titleReading: string;
  titleDe: string;
  situationId: string;
  difficulty: Difficulty;
  jlptEstimate?: JlptLevel;
  /** Höflichkeitsstufe des Gesprächs. */
  register: "casual" | "polite";
  descriptionDe: string;
  audioUrl?: string;
  speakers: Speaker[];
  lines: ConversationLine[];
};
