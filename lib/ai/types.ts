import type {
  ConversationTurn,
  GrammarExplanation,
  JapaneseUtterance,
  PartnerRole,
  Politeness,
  ResponseEvaluation,
} from "./schemas";
import type { Level } from "@/lib/settings/schema";

/** Alles, was das Modell über den Lernenden und die Situation wissen muss. */
export type LearnerContext = {
  level: Level;
  knownVocabulary: string[];
  knownGrammar: string[];
};

export type ConversationSetup = {
  situationSlug: string;
  situationDescriptionDe: string;
  partner: PartnerRole;
  politeness: Politeness;
};

export type ChatMessage = { role: "partner" | "learner"; japanese: string };

/**
 * AI-Service-Abstraktion. Wird ausschließlich serverseitig instanziiert
 * (Server Actions / Route Handlers) – API-Keys erreichen nie den Browser.
 */
export interface AIProvider {
  generateConversationTurn(input: {
    learner: LearnerContext;
    setup: ConversationSetup;
    history: ChatMessage[];
  }): Promise<ConversationTurn>;

  evaluateUserResponse(input: {
    learner: LearnerContext;
    setup: ConversationSetup;
    history: ChatMessage[];
    response: string;
  }): Promise<ResponseEvaluation>;

  explainGrammar(input: { learner: LearnerContext; pattern: string }): Promise<GrammarExplanation>;

  suggestNaturalAlternative(input: {
    learner: LearnerContext;
    sentence: string;
    politeness: Politeness;
  }): Promise<JapaneseUtterance>;

  detectUnknownVocabulary(input: { learner: LearnerContext; text: string }): Promise<string[]>;
}
