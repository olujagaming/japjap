import { describe, expect, it } from "vitest";
import { getKanaByCharacter, KANA } from "@/data/kana";
import { emptyProgress } from "@/lib/store/types";
import {
  buildSession,
  chooseDistractors,
  pickReadingWord,
  selectionWeight,
  verdictToRating,
} from "./practice";

/** Deterministischer Zufall für reproduzierbare Tests. */
function seeded(seed = 42) {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) % 4294967296;
    return s / 4294967296;
  };
}

const hiraganaBasic = KANA.filter((k) => k.scriptType === "hiragana" && k.group === "basic");
const now = new Date("2026-10-01T12:00:00Z");

describe("buildSession", () => {
  it("erzeugt die gewünschte Anzahl Fragen ohne direkte Wiederholung", () => {
    const session = buildSession({
      pool: hiraganaBasic.slice(0, 5),
      allKana: KANA,
      mode: "recognition",
      length: 12,
      progress: new Map(),
      readable: new Set(),
      random: seeded(),
    });
    expect(session).toHaveLength(12);
    for (let i = 1; i < session.length; i++) {
      expect(session[i].kana.id).not.toBe(session[i - 1].kana.id);
    }
  });

  it("Auswahlfragen enthalten die Lösung genau einmal und keine doppelten Lesungen", () => {
    const session = buildSession({
      pool: hiraganaBasic,
      allKana: KANA,
      mode: "reverse",
      length: 20,
      progress: new Map(),
      readable: new Set(),
      random: seeded(7),
    });
    for (const q of session) {
      if (q.kind !== "choose-kana") throw new Error("falscher Fragetyp");
      expect(q.options.filter((o) => o.id === q.kana.id)).toHaveLength(1);
      expect(new Set(q.options.map((o) => o.romaji)).size).toBe(q.options.length);
      expect(q.options.every((o) => o.scriptType === "hiragana")).toBe(true);
    }
  });

  it("Verwechslungstraining nutzt nur verwechselbare Zeichen", () => {
    const session = buildSession({
      pool: KANA.filter((k) => k.scriptType === "katakana" && k.group === "basic"),
      allKana: KANA,
      mode: "confusion",
      length: 10,
      progress: new Map(),
      readable: new Set(),
      random: seeded(3),
    });
    expect(session.length).toBe(10);
    for (const q of session) {
      expect(q.kind).toBe("confusion");
      if (q.kind === "confusion")
        expect(q.options.map((o) => o.character)).toContain(q.kana.character);
    }
  });

  it("liefert für einen leeren Pool keine Fragen", () => {
    expect(
      buildSession({
        pool: [],
        allKana: KANA,
        mode: "mixed",
        length: 10,
        progress: new Map(),
        readable: new Set(),
      }),
    ).toEqual([]);
  });
});

describe("Gewichtung", () => {
  it("bevorzugt schwierige und fällige gegenüber sicheren Zeichen", () => {
    const difficult = {
      ...emptyProgress("kana", "h-a"),
      easeFactor: 1.8,
      status: "learning" as const,
    };
    const mastered = {
      ...emptyProgress("kana", "h-i"),
      status: "mastered" as const,
      nextReviewAt: "2027-01-01T00:00:00Z",
    };
    expect(selectionWeight(difficult, now)).toBeGreaterThan(selectionWeight(undefined, now));
    expect(selectionWeight(mastered, now)).toBeLessThan(1);
  });
});

describe("chooseDistractors", () => {
  it("nimmt verwechselbare Zeichen zuerst", () => {
    const shi = getKanaByCharacter("シ")!;
    const distractors = chooseDistractors(shi, KANA, 3, seeded());
    expect(distractors.map((k) => k.character)).toEqual(expect.arrayContaining(["ツ", "ン"]));
  });
});

describe("pickReadingWord", () => {
  it("bevorzugt Wörter aus bekannten Zeichen", () => {
    const ki = getKanaByCharacter("き")!;
    const word = pickReadingWord(ki, new Set(["き", "た"]), seeded());
    expect(word?.reading).toBe("きた");
  });
});

describe("verdictToRating", () => {
  it("bildet Antwortqualität auf SRS-Bewertungen ab", () => {
    expect(verdictToRating("correct")).toBe("good");
    expect(verdictToRating("almost")).toBe("hard");
    expect(verdictToRating("incorrect")).toBe("again");
  });
});
