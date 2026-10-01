"use server";

import Anthropic from "@anthropic-ai/sdk";
import { headers } from "next/headers";
import { z } from "zod";
import { getSituation } from "@/data/situations";
import { getAIProvider } from "@/lib/ai";
import { AIRefusalError } from "@/lib/ai/claude-provider";
import { RateLimiter } from "@/lib/ai/rate-limit";
import { FREE_TOPIC } from "@/lib/ai/topics";
import {
  AIResponseError,
  partnerRoleSchema,
  politenessSchema,
  type ConversationTurn,
  type ResponseEvaluation,
} from "@/lib/ai/schemas";
import type { ConversationSetup, LearnerContext } from "@/lib/ai/types";
import { LEVELS } from "@/lib/settings/schema";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { getCurrentUser } from "@/lib/supabase/server";

export type ActionResult<T> = { ok: true; data: T } | { ok: false; error: string };

const learnerSchema = z.object({
  level: z.enum(LEVELS),
  knownVocabulary: z.array(z.string().max(30)).max(200),
  knownGrammar: z.array(z.string().max(40)).max(60),
});

const setupSchema = z.object({
  situationSlug: z.string().max(40),
  partner: partnerRoleSchema,
  politeness: politenessSchema,
});

const historySchema = z
  .array(z.object({ role: z.enum(["partner", "learner"]), japanese: z.string().min(1).max(400) }))
  .max(40);

const turnInput = z.object({ setup: setupSchema, learner: learnerSchema, history: historySchema });
const evaluationInput = turnInput.extend({ response: z.string().trim().min(1).max(400) });

/** 30 Anfragen pro 10 Minuten und Nutzer bzw. IP. */
const limiter = new RateLimiter(30, 10 * 60 * 1000);

/**
 * Situation serverseitig auflösen – der Client liefert nur den Slug, nie freien Prompt-Text.
 */
function resolveSetup(input: z.infer<typeof setupSchema>): ConversationSetup | null {
  if (input.situationSlug === FREE_TOPIC) {
    return {
      ...input,
      situationDescriptionDe:
        "A relaxed, open conversation about everyday topics (hobbies, weekend, food, travel).",
    };
  }
  const situation = getSituation(input.situationSlug);
  if (!situation) return null;
  return {
    ...input,
    situationDescriptionDe: `${situation.titleDe} (${situation.titleJa}): ${situation.descriptionDe}`,
  };
}

async function guard(): Promise<string | null> {
  if (isSupabaseConfigured()) {
    const user = await getCurrentUser();
    if (!user) return "Bitte melde dich an, um mit dem AI-Partner zu sprechen.";
    return limiter.take(`user:${user.id}`)
      ? null
      : "Du hast gerade sehr viele Nachrichten gesendet. Bitte warte ein paar Minuten.";
  }
  const h = await headers();
  const ip = h.get("x-forwarded-for")?.split(",")[0]?.trim() || h.get("x-real-ip") || "local";
  return limiter.take(`ip:${ip}`)
    ? null
    : "Du hast gerade sehr viele Nachrichten gesendet. Bitte warte ein paar Minuten.";
}

function describeError(error: unknown): string {
  if (error instanceof AIRefusalError) {
    return "Darauf kann der Gesprächspartner nicht antworten. Versuche eine andere Formulierung.";
  }
  if (error instanceof AIResponseError)
    return "Die Antwort konnte nicht verarbeitet werden. Bitte versuche es noch einmal.";
  if (error instanceof Anthropic.RateLimitError)
    return "Der AI-Dienst ist gerade ausgelastet. Bitte versuche es gleich noch einmal.";
  if (
    error instanceof Anthropic.AuthenticationError ||
    error instanceof Anthropic.PermissionDeniedError
  ) {
    return "Der AI-Dienst ist nicht richtig konfiguriert (API-Schlüssel prüfen).";
  }
  if (error instanceof Anthropic.APIConnectionError)
    return "Keine Verbindung zum AI-Dienst. Bitte prüfe deine Verbindung.";
  if (error instanceof Anthropic.APIError)
    return "Der AI-Dienst hat einen Fehler gemeldet. Bitte versuche es später noch einmal.";
  return "Etwas ist schiefgelaufen. Bitte versuche es noch einmal.";
}

async function run<T>(fn: () => Promise<T>): Promise<ActionResult<T>> {
  try {
    return { ok: true, data: await fn() };
  } catch (error) {
    console.error("[ai]", error);
    return { ok: false, error: describeError(error) };
  }
}

export async function partnerTurnAction(raw: unknown): Promise<ActionResult<ConversationTurn>> {
  const provider = getAIProvider();
  if (!provider)
    return { ok: false, error: "Der AI-Partner ist in dieser Installation nicht eingerichtet." };
  const parsed = turnInput.safeParse(raw);
  if (!parsed.success) return { ok: false, error: "Ungültige Anfrage." };
  const setup = resolveSetup(parsed.data.setup);
  if (!setup) return { ok: false, error: "Unbekannte Situation." };
  const blocked = await guard();
  if (blocked) return { ok: false, error: blocked };

  const learner: LearnerContext = parsed.data.learner;
  return run(() =>
    provider.generateConversationTurn({ learner, setup, history: parsed.data.history }),
  );
}

export async function evaluateAction(raw: unknown): Promise<ActionResult<ResponseEvaluation>> {
  const provider = getAIProvider();
  if (!provider)
    return { ok: false, error: "Der AI-Partner ist in dieser Installation nicht eingerichtet." };
  const parsed = evaluationInput.safeParse(raw);
  if (!parsed.success) return { ok: false, error: "Ungültige Anfrage." };
  const setup = resolveSetup(parsed.data.setup);
  if (!setup) return { ok: false, error: "Unbekannte Situation." };
  const blocked = await guard();
  if (blocked) return { ok: false, error: blocked };

  return run(() =>
    provider.evaluateUserResponse({
      learner: parsed.data.learner,
      setup,
      history: parsed.data.history,
      response: parsed.data.response,
    }),
  );
}
