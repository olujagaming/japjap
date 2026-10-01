import { describe, expect, it } from "vitest";
import { recommendNextStep, type LearnerProfile } from "./profile";

const base: LearnerProfile = {
  experience: "new",
  goals: [],
  hiragana: "unknown",
  katakana: "unknown",
  aids: [],
  dailyMinutes: null,
  completedAt: "2026-10-01T00:00:00.000Z",
};

describe("recommendNextStep", () => {
  it("schickt neue Nutzer ins Onboarding", () => {
    expect(recommendNextStep(null).href).toBe("/onboarding");
  });

  it("priorisiert Hiragana vor Katakana", () => {
    expect(recommendNextStep(base).title).toBe("Hiragana lernen");
    expect(recommendNextStep({ ...base, hiragana: "confident" }).title).toBe("Katakana lernen");
  });

  it("empfiehlt mit sicheren Kana Situationen passend zum Ziel", () => {
    const fluent = { ...base, hiragana: "confident", katakana: "confident" } as const;
    expect(recommendNextStep({ ...fluent, goals: ["travel"] }).title).toMatch(/Reise/);
    expect(recommendNextStep(fluent).href).toBe("/situations");
  });
});
