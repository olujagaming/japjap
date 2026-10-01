import type { LineGrammar } from "@/components/conversation/conversation-line";
import type { DrawerWord } from "@/components/conversation/vocabulary-drawer";
import { PART_OF_SPEECH_LABELS } from "@/data/vocabulary";
import type { Conversation, Difficulty } from "@/types/content";
import {
  conversationGrammar,
  conversationMinutes,
  conversationVocabulary,
  getSituation,
} from "./index";

/** Schlanke, serialisierbare Daten für Client-Komponenten eines Gesprächs. */
export function conversationLookups(conversation: Conversation) {
  const words: Record<string, DrawerWord> = {};
  for (const w of conversationVocabulary(conversation)) {
    words[w.id] = {
      id: w.id,
      japanese: w.japanese,
      reading: w.reading,
      furigana: w.furigana,
      romaji: w.romaji,
      german: w.german,
      noteDe: w.noteDe,
      jlpt: w.jlpt,
      partOfSpeechLabel: PART_OF_SPEECH_LABELS[w.partOfSpeech],
    };
  }
  const grammar: Record<string, LineGrammar> = {};
  for (const g of conversationGrammar(conversation)) {
    grammar[g.id] = { id: g.id, slug: g.slug, pattern: g.pattern, meaningDe: g.meaningDe };
  }
  return { words, grammar };
}

export type ConversationSummary = {
  id: string;
  titleJa: string;
  titleReading: string;
  titleDe: string;
  situationId: string;
  situationTitleDe: string;
  difficulty: Difficulty;
  minutes: number;
  lineCount: number;
  wordCount: number;
  register: Conversation["register"];
};

export function summarizeConversation(conversation: Conversation): ConversationSummary {
  return {
    id: conversation.id,
    titleJa: conversation.titleJa,
    titleReading: conversation.titleReading,
    titleDe: conversation.titleDe,
    situationId: conversation.situationId,
    situationTitleDe: getSituation(conversation.situationId)?.titleDe ?? "",
    difficulty: conversation.difficulty,
    minutes: conversationMinutes(conversation),
    lineCount: conversation.lines.length,
    wordCount: conversationVocabulary(conversation).length,
    register: conversation.register,
  };
}
