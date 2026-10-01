import { CONVERSATIONS, getConversation } from "@/data/conversations";
import { GRAMMAR, getGrammar } from "@/data/grammar";
import { getKanji, KANJI } from "@/data/kanji";
import { SENTENCES } from "@/data/sentences";
import { SITUATIONS, getSituation } from "@/data/situations";
import { getVocabulary, VOCABULARY } from "@/data/vocabulary";
import { KANJI_PATTERN } from "@/lib/utils";
import type {
  Conversation,
  GrammarPoint,
  Kanji,
  Sentence,
  Situation,
  Vocabulary,
} from "@/types/content";

/**
 * Content-Repository: alle Abfragen und Verknüpfungen zwischen Lerninhalten.
 * Heute auf Basis der typisierten Seed-Daten; dieselbe Schnittstelle kann
 * später auf Supabase-Abfragen umgestellt werden, ohne Seiten anzupassen.
 */

export { getGrammar, getKanji, getVocabulary };
export { getGrammarBySlug } from "@/data/grammar";

export const listVocabulary = (): readonly Vocabulary[] => VOCABULARY;
export const listKanji = (): readonly Kanji[] => KANJI;
export const listGrammar = (): readonly GrammarPoint[] => GRAMMAR;
export const listSentences = (): readonly Sentence[] => SENTENCES;

const resolve = <T>(ids: readonly string[], get: (id: string) => T | undefined): T[] =>
  ids.map(get).filter((item): item is T => item !== undefined);

/** Kanji eines Wortes, die in der Kanji-Sammlung vorhanden sind (in Reihenfolge, ohne Doppelte). */
export function kanjiInText(text: string): Kanji[] {
  const chars = [...new Set([...text].filter((c) => KANJI_PATTERN.test(c)))];
  return resolve(chars, getKanji);
}

/** Alle Kanji-Zeichen eines Textes – auch solche ohne eigenen Eintrag. */
export function kanjiCharacters(text: string): string[] {
  return [...new Set([...text].filter((c) => KANJI_PATTERN.test(c)))];
}

export function sentencesForVocabulary(id: string): Sentence[] {
  return SENTENCES.filter((s) => s.vocabularyIds.includes(id));
}

export function sentencesForGrammar(id: string): Sentence[] {
  return SENTENCES.filter((s) => s.grammarIds.includes(id));
}

export function sentencesForKanji(character: string): Sentence[] {
  return SENTENCES.filter((s) => s.japanese.includes(character));
}

export function vocabularyForKanji(character: string): Vocabulary[] {
  return VOCABULARY.filter((v) => v.japanese.includes(character));
}

export function vocabularyInSentence(sentence: Sentence): Vocabulary[] {
  return resolve(sentence.vocabularyIds, getVocabulary);
}

export function grammarInSentence(sentence: Sentence): GrammarPoint[] {
  return resolve(sentence.grammarIds, getGrammar);
}

/** Ausdrücklich verwandte Wörter, ergänzt um Wörter mit gemeinsamen Kanji. */
export function relatedVocabulary(word: Vocabulary, limit = 8): Vocabulary[] {
  const explicit = resolve(word.related, getVocabulary);
  const sharedKanji = kanjiCharacters(word.japanese).flatMap(vocabularyForKanji);
  const result = new Map<string, Vocabulary>();
  for (const candidate of [...explicit, ...sharedKanji]) {
    if (candidate.id !== word.id) result.set(candidate.id, candidate);
  }
  return [...result.values()].slice(0, limit);
}

export function relatedKanji(kanji: Kanji): { character: string; entry?: Kanji }[] {
  return kanji.related.map((character) => ({ character, entry: getKanji(character) }));
}

export function similarGrammar(point: GrammarPoint): GrammarPoint[] {
  return resolve(point.similar, getGrammar);
}

/** Vokabel-Eintrag für ein Wort in exakter Schreibweise (z. B. Kana-Beispielwörter). */
export function findVocabularyByJapanese(japanese: string): Vocabulary | undefined {
  return VOCABULARY.find((v) => v.japanese === japanese);
}

// ---------------------------------------------------------------------------
// Situationen und Gespräche
// ---------------------------------------------------------------------------

export { getConversation, getSituation };

export const listSituations = (): readonly Situation[] => SITUATIONS;
export const listConversations = (): readonly Conversation[] => CONVERSATIONS;

export function conversationsForSituation(situationId: string): Conversation[] {
  return CONVERSATIONS.filter((c) => c.situationId === situationId);
}

export function conversationsForVocabulary(id: string): Conversation[] {
  return CONVERSATIONS.filter((c) => c.lines.some((l) => l.vocabularyIds.includes(id)));
}

export function conversationsForGrammar(id: string): Conversation[] {
  return CONVERSATIONS.filter((c) => c.lines.some((l) => l.grammarIds.includes(id)));
}

export function situationVocabulary(situation: Situation): Vocabulary[] {
  return resolve(situation.vocabularyIds, getVocabulary);
}

/** Alle in einem Gespräch verknüpften Wörter (eindeutig, in Reihenfolge des Auftretens). */
export function conversationVocabulary(conversation: Conversation): Vocabulary[] {
  return resolve([...new Set(conversation.lines.flatMap((l) => l.vocabularyIds))], getVocabulary);
}

export function conversationGrammar(conversation: Conversation): GrammarPoint[] {
  return resolve([...new Set(conversation.lines.flatMap((l) => l.grammarIds))], getGrammar);
}

/** Geschätzte Dauer in Minuten (≈ 6 Moren pro Sekunde plus Pausen), mindestens 1. */
export function conversationMinutes(conversation: Conversation): number {
  const morae = conversation.lines.reduce(
    (sum, l) => sum + l.reading.replace(/[ゃゅょャュョ。、？！]/g, "").length,
    0,
  );
  const seconds = morae / 6 + conversation.lines.length * 1.5;
  return Math.max(1, Math.round(seconds / 60));
}
