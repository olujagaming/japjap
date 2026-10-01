import type Anthropic from "@anthropic-ai/sdk";
import { describe, expect, it, vi } from "vitest";

type SentParams = {
  model: string;
  fallbacks: unknown;
  betas: string[];
  output_config: { effort: string; format: unknown };
  system: { text: string; cache_control: unknown }[];
};
import { AIRefusalError, CLAUDE_MODEL, ClaudeProvider } from "./claude-provider";
import { AIResponseError } from "./schemas";

const setup = {
  situationSlug: "cafe",
  situationDescriptionDe: "Café",
  partner: "clerk" as const,
  politeness: "polite" as const,
};
const learner = { level: "beginner" as const, knownVocabulary: ["コーヒー"], knownGrammar: [] };

function fakeClient(response: Record<string, unknown>) {
  const parse = vi.fn(async () => response);
  const client = { beta: { messages: { parse } } } as unknown as Anthropic;
  return { client, parse };
}

const utterance = {
  japanese: "ご注文は？",
  reading: "ごちゅうもんは？",
  romaji: "gochūmon wa?",
  german: "Was darf es sein?",
};

describe("ClaudeProvider", () => {
  it("fragt eine strukturierte Gesprächsantwort mit Fallback und niedriger Effort-Stufe an", async () => {
    const { client, parse } = fakeClient({
      stop_reason: "end_turn",
      parsed_output: {
        utterance,
        newVocabulary: [{ japanese: "注文", reading: "ちゅうもん", german: "Bestellung" }],
        hintDe: "  ",
        conversationEnded: false,
      },
    });
    const turn = await new ClaudeProvider(client).generateConversationTurn({
      setup,
      learner,
      history: [],
    });

    expect(turn.utterance.german).toBe("Was darf es sein?");
    expect(turn.hintDe).toBeUndefined();
    const params = (parse.mock.calls[0] as unknown[])[0] as SentParams;
    expect(params.model).toBe(CLAUDE_MODEL);
    expect(params.fallbacks).toBe("default");
    expect(params.betas).toContain("server-side-fallback-2026-07-01");
    expect(params.output_config.effort).toBe("low");
    expect(params.output_config.format).toBeDefined();
    expect(params.system[0].text).toContain("absolute beginner");
    expect(params.system[0].cache_control).toEqual({ type: "ephemeral" });
  });

  it("validiert Feedback und lässt eine fehlende Alternative weg", async () => {
    const { client, parse } = fakeClient({
      stop_reason: "end_turn",
      parsed_output: {
        understandable: "correct",
        grammar: "acceptable",
        naturalness: "acceptable",
        politeness: "correct",
        feedbackDe: "Gut verständlich.",
        betterAlternative: null,
      },
    });
    const evaluation = await new ClaudeProvider(client).evaluateUserResponse({
      setup,
      learner,
      history: [],
      response: "kohii kudasai",
    });
    expect(evaluation.betterAlternative).toBeUndefined();
    expect(((parse.mock.calls[0] as unknown[])[0] as SentParams).output_config.effort).toBe(
      "medium",
    );
  });

  it("meldet Ablehnungen und ungültige Antworten als eigene Fehler", async () => {
    await expect(
      new ClaudeProvider(
        fakeClient({ stop_reason: "refusal", parsed_output: null }).client,
      ).generateConversationTurn({ setup, learner, history: [] }),
    ).rejects.toBeInstanceOf(AIRefusalError);
    await expect(
      new ClaudeProvider(
        fakeClient({ stop_reason: "end_turn", parsed_output: null }).client,
      ).generateConversationTurn({ setup, learner, history: [] }),
    ).rejects.toBeInstanceOf(AIResponseError);
    await expect(
      new ClaudeProvider(
        fakeClient({ stop_reason: "max_tokens", parsed_output: null }).client,
      ).generateConversationTurn({ setup, learner, history: [] }),
    ).rejects.toBeInstanceOf(AIResponseError);
  });

  it("verwirft Antworten mit leeren Pflichtfeldern", async () => {
    const { client } = fakeClient({
      stop_reason: "end_turn",
      parsed_output: {
        utterance: { ...utterance, german: "" },
        newVocabulary: [],
        hintDe: "",
        conversationEnded: false,
      },
    });
    await expect(
      new ClaudeProvider(client).generateConversationTurn({ setup, learner, history: [] }),
    ).rejects.toThrow();
  });
});
