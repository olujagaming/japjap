import { z } from "zod";

/**
 * Strukturierte Antworten des AI-Modells. Jede Antwort wird gegen diese Schemas validiert,
 * bevor sie die UI erreicht – ungültige Antworten werden verworfen statt angezeigt.
 */

export const politenessSchema = z.enum(["casual", "neutral", "polite"]);
export const partnerRoleSchema = z.enum([
  "friend",
  "clerk",
  "waiter",
  "staff",
  "hotel-reception",
  "colleague",
  "teacher",
]);

export const japaneseUtteranceSchema = z.object({
  japanese: z.string().min(1),
  reading: z.string().min(1),
  romaji: z.string().min(1),
  german: z.string().min(1),
});

export const conversationTurnSchema = z.object({
  utterance: japaneseUtteranceSchema,
  /** Wörter, die der Nutzer laut Kontext vermutlich noch nicht kennt. */
  newVocabulary: z
    .array(z.object({ japanese: z.string(), reading: z.string(), german: z.string() }))
    .default([]),
  /** Optionaler Hinweis, was der Nutzer antworten könnte. */
  hintDe: z.string().optional(),
  conversationEnded: z.boolean().default(false),
});

const ratingSchema = z.enum(["correct", "acceptable", "needs-work"]);

export const responseEvaluationSchema = z.object({
  understandable: ratingSchema,
  grammar: ratingSchema,
  naturalness: ratingSchema,
  politeness: ratingSchema,
  /** Kurzes Feedback auf Deutsch. */
  feedbackDe: z.string().min(1),
  betterAlternative: japaneseUtteranceSchema.optional(),
});

export const grammarExplanationSchema = z.object({
  pattern: z.string(),
  explanationDe: z.string(),
  examples: z.array(japaneseUtteranceSchema).max(5),
});

export type JapaneseUtterance = z.infer<typeof japaneseUtteranceSchema>;
export type ConversationTurn = z.infer<typeof conversationTurnSchema>;
export type ResponseEvaluation = z.infer<typeof responseEvaluationSchema>;
export type GrammarExplanation = z.infer<typeof grammarExplanationSchema>;
export type Politeness = z.infer<typeof politenessSchema>;
export type PartnerRole = z.infer<typeof partnerRoleSchema>;

export class AIResponseError extends Error {
  constructor(
    message: string,
    readonly issues?: z.core.$ZodIssue[],
  ) {
    super(message);
    this.name = "AIResponseError";
  }
}

/**
 * Extrahiert JSON aus einer Modellantwort (auch in ```json-Blöcken) und validiert es.
 * Wirft AIResponseError bei ungültigem JSON oder Schema-Verletzung.
 */
export function parseAIResponse<T extends z.ZodType>(schema: T, raw: string): z.infer<T> {
  const fenced = raw.match(/```(?:json)?\s*([\s\S]*?)```/);
  const candidate = (fenced ? fenced[1] : raw).trim();
  const start = candidate.search(/[[{]/);
  if (start === -1) throw new AIResponseError("Die Antwort enthält kein JSON.");

  let data: unknown;
  try {
    data = JSON.parse(candidate.slice(start));
  } catch {
    throw new AIResponseError("Die Antwort enthält ungültiges JSON.");
  }

  const result = schema.safeParse(data);
  if (!result.success) {
    throw new AIResponseError(
      "Die Antwort entspricht nicht dem erwarteten Format.",
      result.error.issues,
    );
  }
  return result.data;
}
