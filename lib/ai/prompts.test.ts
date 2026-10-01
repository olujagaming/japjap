import { describe, expect, it } from "vitest";
import {
  buildEvaluationUserMessage,
  buildPartnerSystemPrompt,
  buildTurnUserMessage,
} from "./prompts";

const setup = {
  situationSlug: "cafe",
  situationDescriptionDe: "Im Café: Bestellen an der Theke.",
  partner: "clerk" as const,
  politeness: "polite" as const,
};

describe("AI-Prompts", () => {
  it("enthält Niveau, Höflichkeit, Situation und bekannten Wortschatz", () => {
    const prompt = buildPartnerSystemPrompt(setup, {
      level: "beginner",
      knownVocabulary: ["水", "コーヒー", "水"],
      knownGrammar: ["～です"],
    });
    expect(prompt).toContain("absolute beginner");
    expect(prompt).toContain("keigo");
    expect(prompt).toContain("Im Café");
    expect(prompt).toContain("水、コーヒー");
    expect(prompt).not.toContain("水、コーヒー、水");
  });

  it("passt Anweisungen an lockere Gespräche an", () => {
    const prompt = buildPartnerSystemPrompt(
      { ...setup, partner: "friend", politeness: "casual" },
      {
        level: "advanced",
        knownVocabulary: [],
        knownGrammar: [],
      },
    );
    expect(prompt).toContain("plain forms");
    expect(prompt).toContain("(none yet)");
  });

  it("baut Gesprächsverlauf und Erstnachricht", () => {
    expect(buildTurnUserMessage([])).toMatch(/first line/);
    const message = buildTurnUserMessage([
      { role: "partner", japanese: "いらっしゃいませ。" },
      { role: "learner", japanese: "コーヒーをください。" },
    ]);
    expect(message).toContain("Partner: いらっしゃいませ。\nLearner: コーヒーをください。");
    expect(buildEvaluationUserMessage([], "kohii kudasai")).toBe(
      "Learner's last message: kohii kudasai",
    );
  });
});
