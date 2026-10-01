import "server-only";
import Anthropic from "@anthropic-ai/sdk";
import { betaZodOutputFormat } from "@anthropic-ai/sdk/helpers/beta/zod";
import { z } from "zod";
import {
  buildEvaluationSystemPrompt,
  buildEvaluationUserMessage,
  buildPartnerSystemPrompt,
  buildTurnUserMessage,
} from "./prompts";
import {
  AIResponseError,
  conversationTurnSchema,
  grammarExplanationSchema,
  japaneseUtteranceSchema,
  responseEvaluationSchema,
  type ConversationTurn,
  type GrammarExplanation,
  type JapaneseUtterance,
  type ResponseEvaluation,
} from "./schemas";
import type { AIProvider, ChatMessage, ConversationSetup, LearnerContext } from "./types";

export const CLAUDE_MODEL = "claude-opus-5-5";

/**
 * Ausgabeformate für strukturierte Antworten. Bewusst ohne optionale Felder und Defaults:
 * „leer“ wird als leerer String bzw. null ausgedrückt. Danach validieren die App-Schemas
 * (lib/ai/schemas.ts) das Ergebnis ein zweites Mal.
 */
const utteranceOutput = z.object({
  japanese: z.string(),
  reading: z.string(),
  romaji: z.string(),
  german: z.string(),
});

const turnOutput = z.object({
  utterance: utteranceOutput,
  newVocabulary: z.array(
    z.object({ japanese: z.string(), reading: z.string(), german: z.string() }),
  ),
  hintDe: z.string(),
  conversationEnded: z.boolean(),
});

const rating = z.enum(["correct", "acceptable", "needs-work"]);
const evaluationOutput = z.object({
  understandable: rating,
  grammar: rating,
  naturalness: rating,
  politeness: rating,
  feedbackDe: z.string(),
  betterAlternative: utteranceOutput.nullable(),
});

const explanationOutput = z.object({
  pattern: z.string(),
  explanationDe: z.string(),
  examples: z.array(utteranceOutput),
});

const unknownWordsOutput = z.object({ words: z.array(z.string()) });

export class AIRefusalError extends Error {
  constructor() {
    super("Das Modell hat die Anfrage abgelehnt.");
    this.name = "AIRefusalError";
  }
}

/**
 * Claude als Gesprächspartner. Strukturierte Ausgaben über `messages.parse` + Zod;
 * bei einer Ablehnung durch Sicherheitsfilter springt die serverseitige Fallback-Kette ein.
 */
export class ClaudeProvider implements AIProvider {
  constructor(private readonly client: Anthropic = new Anthropic()) {}

  private async structured<T extends z.ZodType>(options: {
    system: string;
    user: string;
    schema: T;
    effort: "low" | "medium";
    maxTokens?: number;
  }): Promise<z.infer<T>> {
    const response = await this.client.beta.messages.parse({
      model: CLAUDE_MODEL,
      max_tokens: options.maxTokens ?? 4000,
      betas: ["server-side-fallback-2026-07-01"],
      fallbacks: "default",
      system: [{ type: "text", text: options.system, cache_control: { type: "ephemeral" } }],
      messages: [{ role: "user", content: options.user }],
      output_config: { effort: options.effort, format: betaZodOutputFormat(options.schema) },
    });
    if (response.stop_reason === "refusal") throw new AIRefusalError();
    if (response.stop_reason === "max_tokens")
      throw new AIResponseError("Die Antwort wurde abgeschnitten.");
    if (response.parsed_output == null)
      throw new AIResponseError("Die Antwort entspricht nicht dem erwarteten Format.");
    return response.parsed_output as z.infer<T>;
  }

  async generateConversationTurn(input: {
    learner: LearnerContext;
    setup: ConversationSetup;
    history: ChatMessage[];
  }): Promise<ConversationTurn> {
    const output = await this.structured({
      system: buildPartnerSystemPrompt(input.setup, input.learner),
      user: buildTurnUserMessage(input.history),
      schema: turnOutput,
      // Gespräch: niedrige Effort-Stufe für schnelle, natürliche Antworten
      effort: "low",
    });
    return conversationTurnSchema.parse({ ...output, hintDe: output.hintDe.trim() || undefined });
  }

  async evaluateUserResponse(input: {
    learner: LearnerContext;
    setup: ConversationSetup;
    history: ChatMessage[];
    response: string;
  }): Promise<ResponseEvaluation> {
    const output = await this.structured({
      system: buildEvaluationSystemPrompt(input.setup, input.learner),
      user: buildEvaluationUserMessage(input.history, input.response),
      schema: evaluationOutput,
      // Feedback braucht etwas mehr Sorgfalt als die Gesprächsantwort
      effort: "medium",
    });
    return responseEvaluationSchema.parse({
      ...output,
      betterAlternative: output.betterAlternative ?? undefined,
    });
  }

  async explainGrammar(input: {
    learner: LearnerContext;
    pattern: string;
  }): Promise<GrammarExplanation> {
    const output = await this.structured({
      system:
        "Explain Japanese grammar to German-speaking learners. Write the explanation in German, short and clear (max. 4 sentences), and give 2–3 natural example sentences (Japanese, hiragana reading, Hepburn romaji with macrons, natural German).",
      user: `Learner level: ${input.learner.level}. Explain: ${input.pattern}`,
      schema: explanationOutput,
      effort: "medium",
    });
    return grammarExplanationSchema.parse({ ...output, examples: output.examples.slice(0, 5) });
  }

  async suggestNaturalAlternative(input: {
    learner: LearnerContext;
    sentence: string;
    politeness: ConversationSetup["politeness"];
  }): Promise<JapaneseUtterance> {
    const output = await this.structured({
      system:
        "Rewrite the learner's Japanese sentence the way a native speaker would naturally say it, keeping the meaning. Return Japanese, the hiragana reading, Hepburn romaji with macrons and a natural German translation.",
      user: `Politeness: ${input.politeness}. Learner level: ${input.learner.level}. Sentence: ${input.sentence}`,
      schema: utteranceOutput,
      effort: "low",
    });
    return japaneseUtteranceSchema.parse(output);
  }

  async detectUnknownVocabulary(input: {
    learner: LearnerContext;
    text: string;
  }): Promise<string[]> {
    const output = await this.structured({
      system:
        "List the words in the Japanese text (dictionary form) that the learner probably does not know, given the known vocabulary. Return at most 8 words.",
      user: `Known vocabulary: ${input.learner.knownVocabulary.join("、") || "(none)"}\nText: ${input.text}`,
      schema: unknownWordsOutput,
      effort: "low",
    });
    return output.words.slice(0, 8);
  }
}
