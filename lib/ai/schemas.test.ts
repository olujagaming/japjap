import { describe, expect, it } from "vitest";
import {
  AIResponseError,
  conversationTurnSchema,
  parseAIResponse,
  responseEvaluationSchema,
} from "./schemas";

const turn = {
  utterance: {
    japanese: "袋はいりますか？",
    reading: "ふくろはいりますか？",
    romaji: "fukuro wa irimasu ka?",
    german: "Brauchen Sie eine Tüte?",
  },
};

describe("parseAIResponse", () => {
  it("validiert reines JSON und setzt Defaults", () => {
    const result = parseAIResponse(conversationTurnSchema, JSON.stringify(turn));
    expect(result.utterance.german).toBe("Brauchen Sie eine Tüte?");
    expect(result.newVocabulary).toEqual([]);
    expect(result.conversationEnded).toBe(false);
  });

  it("extrahiert JSON aus Markdown-Codeblöcken", () => {
    const raw = "Hier ist die Antwort:\n```json\n" + JSON.stringify(turn) + "\n```";
    expect(parseAIResponse(conversationTurnSchema, raw).utterance.romaji).toBe(
      "fukuro wa irimasu ka?",
    );
  });

  it("lehnt Antworten ohne Pflichtfelder ab", () => {
    const invalid = { utterance: { japanese: "はい" } };
    expect(() => parseAIResponse(conversationTurnSchema, JSON.stringify(invalid))).toThrow(
      AIResponseError,
    );
  });

  it("lehnt Nicht-JSON ab", () => {
    expect(() =>
      parseAIResponse(conversationTurnSchema, "Entschuldigung, das kann ich nicht."),
    ).toThrow(/kein JSON/);
    expect(() => parseAIResponse(conversationTurnSchema, "{ kaputt")).toThrow(/ungültiges JSON/);
  });

  it("validiert Feedback inkl. Alternative", () => {
    const evaluation = parseAIResponse(
      responseEvaluationSchema,
      JSON.stringify({
        understandable: "correct",
        grammar: "correct",
        naturalness: "acceptable",
        politeness: "correct",
        feedbackDe: "Gut verständlich. Natürlicher klingt お願いします.",
        betterAlternative: {
          japanese: "アイスコーヒーをお願いします。",
          reading: "アイスコーヒーをおねがいします。",
          romaji: "aisu kōhī o onegai shimasu.",
          german: "Einen Eiskaffee, bitte.",
        },
      }),
    );
    expect(evaluation.betterAlternative?.japanese).toBe("アイスコーヒーをお願いします。");
  });
});
