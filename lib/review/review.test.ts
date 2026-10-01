import { describe, expect, it } from "vitest";
import { CLOZES } from "@/data/cloze";
import { getGrammar } from "@/data/grammar";
import { emptyProgress, type ProgressRecord } from "@/lib/store/types";
import {
  buildReviewQueue,
  dueCountsByType,
  forecast,
  formatInterval,
  interleaveByType,
  intervalPreview,
} from "./queue";
import { createTask, createTasks } from "./tasks";

const now = new Date("2026-10-01T12:00:00Z");
const due = (
  type: ProgressRecord["contentType"],
  id: string,
  hoursAgo = 1,
  extra: Partial<ProgressRecord> = {},
): ProgressRecord => ({
  ...emptyProgress(type, id),
  status: "learning",
  nextReviewAt: new Date(now.getTime() - hoursAgo * 3_600_000).toISOString(),
  ...extra,
});

describe("Review-Queue", () => {
  const records = [
    due("kana", "h-a", 5),
    due("kana", "h-i", 4),
    due("vocabulary", "taberu", 3),
    due("kanji", "食", 2),
    due("grammar", "tai", 1),
    { ...emptyProgress("vocabulary", "nomu"), nextReviewAt: "2026-10-05T00:00:00Z" },
    { ...emptyProgress("vocabulary", "mizu") },
  ];

  it("enthält nur fällige Inhalte und mischt die Arten", () => {
    const queue = buildReviewQueue({ records, now, limit: 20 });
    expect(queue.map((r) => r.contentId)).toEqual(["h-a", "taberu", "食", "tai", "h-i"]);
  });

  it("begrenzt die Session-Größe auf die ältesten Fälligen", () => {
    expect(buildReviewQueue({ records, now, limit: 2 }).map((r) => r.contentId)).toEqual([
      "h-a",
      "h-i",
    ]);
  });

  it("filtert nach Arten und zählt Fällige je Art", () => {
    expect(buildReviewQueue({ records, now, limit: 20, types: ["kana"] })).toHaveLength(2);
    expect(dueCountsByType(records, now)).toEqual({
      kana: 2,
      vocabulary: 1,
      kanji: 1,
      grammar: 1,
      conversation: 0,
    });
  });

  it("verteilt künftige Wiederholungen auf Tage", () => {
    const days = forecast(records, now, 7);
    expect(days[0]).toBe(5);
    expect(days.reduce((a, b) => a + b, 0)).toBe(6);
    expect(days).toHaveLength(7);
  });

  it("verzahnt Arten im Reißverschlussverfahren", () => {
    const mixed = interleaveByType([due("kana", "a"), due("kana", "b"), due("kanji", "c")]);
    expect(mixed.map((r) => r.contentId)).toEqual(["a", "c", "b"]);
  });
});

describe("Intervall-Vorschau", () => {
  it("zeigt für neue Inhalte kurze, für bekannte längere Intervalle", () => {
    const preview = intervalPreview(emptyProgress("kana", "h-a"), now);
    expect(preview).toEqual({ again: "10 Min.", hard: "1 Std.", good: "1 Tag", easy: "4 Tage" });
    expect(formatInterval(30)).toBe("4 Wo.");
    expect(formatInterval(90)).toBe("3 Mon.");
  });
});

describe("Aufgaben", () => {
  it("wechselt bei Vokabeln von Erkennen zu Abrufen und Hören", () => {
    const kinds = [0, 1, 2, 3, 4].map(
      (repetitions) => createTask(due("vocabulary", "taberu", 1, { repetitions }))!.kind,
    );
    expect(kinds).toEqual([
      "vocab-meaning",
      "vocab-meaning",
      "vocab-recall",
      "vocab-listening",
      "vocab-meaning",
    ]);
  });

  it("nutzt Lückensätze für Grammatik und Lernerzeilen für Gespräche", () => {
    const grammar = createTask(due("grammar", "masu"));
    expect(grammar?.kind).toBe("grammar-cloze");
    const situational = createTask(due("conversation", "cafe-order"));
    expect(situational?.kind).toBe("situational");
    if (situational?.kind === "situational") {
      expect(
        situational.conversation.speakers.find((s) => s.key === situational.line.speaker)
          ?.isLearner,
      ).toBe(true);
      expect(situational.situationTitleDe).toBe("Café");
    }
  });

  it("überspringt unbekannte Inhalte", () => {
    expect(createTasks([due("vocabulary", "gibt-es-nicht"), due("kana", "h-a")])).toHaveLength(1);
  });
});

describe("Lückensätze", () => {
  it("haben genau eine Lücke, gültige Grammatik und Antworten", () => {
    for (const c of CLOZES) {
      expect(c.japanese.split("___").length, c.id).toBe(2);
      expect(getGrammar(c.grammarId), c.id).toBeDefined();
      expect(c.answers.length * c.romaji.length, c.id).toBeGreaterThan(0);
      expect(c.solution.includes("___"), c.id).toBe(false);
    }
  });

  it("decken jeden Grammatikpunkt ab", () => {
    const covered = new Set(CLOZES.map((c) => c.grammarId));
    expect(covered.size).toBe(12);
  });
});
