import { PARTNER_LABELS } from "./labels";
import type { Politeness } from "./schemas";
import type { ChatMessage, ConversationSetup, LearnerContext } from "./types";
import type { Level } from "@/lib/settings/schema";

/**
 * Prompts für den AI-Gesprächspartner. Reine Funktionen – testbar ohne API-Aufruf.
 * Die Anweisungen sind auf Englisch (präziser für das Modell); alle Ausgaben für
 * Lernende sind Japanisch bzw. Deutsch.
 */

const LEVEL_GUIDANCE: Record<Level, string> = {
  beginner:
    "The learner is an absolute beginner (JLPT N5 level at most). Use very short sentences (usually one, at most two per turn), only basic N5 vocabulary and grammar (です/ます, を, に, で, ～たい, ～てください). Prefer words from the known vocabulary list. Avoid kanji the learner is unlikely to know where a common kana spelling exists.",
  elementary:
    "The learner is at an elementary level (around JLPT N5–N4). Use short, natural sentences (one or two per turn) with common everyday vocabulary and basic grammar. Introduce at most one or two new words per turn.",
  intermediate:
    "The learner is at an intermediate level (around JLPT N4–N3). Use natural everyday Japanese with typical colloquial expressions where they fit. Two or three sentences per turn are fine.",
  advanced:
    "The learner is advanced. Speak naturally as a native speaker would in this situation, including idiomatic expressions and appropriate keigo, while staying clear.",
};

const POLITENESS_GUIDANCE: Record<Politeness, string> = {
  casual: "Speak casually (plain forms, だ/よ/ね, no です/ます), as between friends.",
  neutral: "Speak in the neutral polite style (です/ます).",
  polite:
    "Speak politely. Staff and service roles may use the natural keigo that real staff use (いらっしゃいませ, ございます, お～ください), but keep it simple enough for the learner's level.",
};

/** Kürzt Listen, damit der Prompt kompakt bleibt (Reihenfolge = Priorität). */
function limitList(items: readonly string[], max: number): string {
  if (items.length === 0) return "(none yet)";
  const unique = [...new Set(items)].slice(0, max);
  return unique.join("、");
}

export function buildPartnerSystemPrompt(
  setup: ConversationSetup,
  learner: LearnerContext,
): string {
  const partner = PARTNER_LABELS[setup.partner];
  return [
    "You are the conversation partner in a Japanese learning app for German-speaking learners.",
    `Role-play as ${partner.en}. Situation: ${setup.situationDescriptionDe}`,
    "",
    "Language level:",
    LEVEL_GUIDANCE[learner.level],
    "",
    "Politeness:",
    POLITENESS_GUIDANCE[setup.politeness],
    "",
    `Vocabulary the learner already knows: ${limitList(learner.knownVocabulary, 150)}`,
    `Grammar the learner already knows: ${limitList(learner.knownGrammar, 40)}`,
    "",
    "How to respond:",
    "- Stay in your role and keep the conversation moving with a natural question or reaction, like a real person in this situation would.",
    "- Sound natural. Not every sentence needs to be textbook-perfect; contractions and colloquial forms are fine when they fit the role and politeness.",
    "- If the learner writes in German, English or romaji, or makes mistakes, do not correct them in your turn; react in Japanese as a friendly native speaker would, keeping it simple.",
    "- `utterance.japanese`: your turn in natural Japanese script.",
    "- `utterance.reading`: the full reading in hiragana (keep katakana words in katakana), same punctuation.",
    "- `utterance.romaji`: modified Hepburn with macrons (ō, ū), particles は/へ/を as wa/e/o.",
    "- `utterance.german`: a natural German translation that fits the context – not word for word.",
    "- `newVocabulary`: up to 4 words from your turn that the learner probably does not know yet (dictionary form, hiragana reading, short German meaning). Empty if none.",
    "- `hintDe`: one short German sentence suggesting what the learner could answer, optionally with a short Japanese example. Empty string if not needed.",
    "- `conversationEnded`: true only when the interaction has naturally come to an end (e.g. after saying goodbye).",
  ].join("\n");
}

function transcript(history: readonly ChatMessage[]): string {
  return history
    .map((m) => `${m.role === "partner" ? "Partner" : "Learner"}: ${m.japanese}`)
    .join("\n");
}

export function buildTurnUserMessage(history: readonly ChatMessage[]): string {
  if (history.length === 0) {
    return "Start the conversation with your first line in this situation.";
  }
  return `Conversation so far:\n${transcript(history)}\n\nWrite the partner's next turn.`;
}

export function buildEvaluationSystemPrompt(
  setup: ConversationSetup,
  learner: LearnerContext,
): string {
  const partner = PARTNER_LABELS[setup.partner];
  return [
    "You give feedback to German-speaking learners of Japanese in a conversation practice app.",
    `Situation: ${setup.situationDescriptionDe} The learner talks to ${partner.en}. Expected politeness: ${POLITENESS_GUIDANCE[setup.politeness]}`,
    `Learner level: ${learner.level}.`,
    "",
    "Evaluate only the learner's LAST message in the context of the conversation.",
    "- Ratings (`understandable`, `grammar`, `naturalness`, `politeness`): `correct` if it is right and fitting, `acceptable` if a native speaker would understand and accept it but it could be better, `needs-work` if it is wrong or would cause confusion. Several phrasings can be correct – do not penalise a valid alternative.",
    "- Romaji or kana-only answers are fine for a learner; judge the language, not the script.",
    "- `feedbackDe`: 1–3 short, encouraging sentences in German. Be specific; explain at most one or two important points simply. Do not list trivia.",
    "- `betterAlternative`: a more natural way to say the same thing in this situation (Japanese, hiragana reading, Hepburn romaji with macrons, natural German). Use null if the learner's message is already natural.",
  ].join("\n");
}

export function buildEvaluationUserMessage(
  history: readonly ChatMessage[],
  response: string,
): string {
  const context = history.length > 0 ? `Conversation so far:\n${transcript(history)}\n\n` : "";
  return `${context}Learner's last message: ${response}`;
}
