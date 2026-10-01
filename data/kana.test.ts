import { describe, expect, it } from "vitest";
import { checkRomajiAnswer, toHiragana, toRomaji } from "@/lib/japanese/romaji";
import strokeData from "./stroke-order/kana.json";
import { BASIC_KANA_IDS, CONFUSION_SETS, getKanaByCharacter, KANA } from "./kana";
import { getKanaExamples, KANA_EXAMPLE_CHARACTERS } from "./kana-examples";

const strokes = strokeData.strokes as Record<string, string[]>;

describe("Kana-Daten", () => {
  it("enthält je 46 Grundzeichen pro Schrift", () => {
    for (const script of ["hiragana", "katakana"] as const) {
      expect(KANA.filter((k) => k.scriptType === script && k.group === "basic")).toHaveLength(46);
    }
    expect(BASIC_KANA_IDS.size).toBe(92);
  });

  it("enthält Dakuten (20), Handakuten (5) und Yōon (33) je Schrift", () => {
    for (const script of ["hiragana", "katakana"] as const) {
      const of = (group: string) =>
        KANA.filter((k) => k.scriptType === script && k.group === group);
      expect(of("dakuten")).toHaveLength(20);
      expect(of("handakuten")).toHaveLength(5);
      expect(of("yoon")).toHaveLength(33);
    }
  });

  it("hat eindeutige IDs und Zeichen", () => {
    expect(new Set(KANA.map((k) => k.id)).size).toBe(KANA.length);
    expect(new Set(KANA.map((k) => k.character)).size).toBe(KANA.length);
  });

  it("Romaji entsprechen der Hepburn-Umschrift des Zeichens", () => {
    for (const kana of KANA) {
      expect(toRomaji(kana.character), kana.character).toBe(kana.romaji);
    }
  });

  it("verweist nur auf existierende Zeichen", () => {
    for (const kana of KANA) {
      for (const c of [
        ...kana.relatedCharacters,
        kana.counterpart,
        kana.baseCharacter,
        kana.dakutenVariant,
        kana.handakutenVariant,
      ]) {
        if (c) expect(getKanaByCharacter(c), `${kana.character} → ${c}`).toBeDefined();
      }
    }
    for (const set of CONFUSION_SETS) {
      for (const c of set.characters) expect(getKanaByCharacter(c), c).toBeDefined();
    }
  });

  it("verknüpft Varianten in beide Richtungen", () => {
    expect(getKanaByCharacter("か")?.dakutenVariant).toBe("が");
    expect(getKanaByCharacter("が")?.baseCharacter).toBe("か");
    expect(getKanaByCharacter("は")?.handakutenVariant).toBe("ぱ");
    expect(getKanaByCharacter("き")?.relatedCharacters).toEqual(
      expect.arrayContaining(["キ", "ぎ", "きゃ", "きゅ", "きょ"]),
    );
    expect(getKanaByCharacter("きゃ")?.baseCharacter).toBe("き");
  });

  it("Strichzahlen stimmen mit den KanjiVG-Daten überein", () => {
    for (const kana of KANA.filter((k) => k.strokeCount)) {
      expect(strokes[kana.character]?.length, kana.character).toBe(kana.strokeCount);
    }
  });

  it("hat Strichdaten für alle Einzelzeichen", () => {
    for (const kana of KANA.filter((k) => k.group !== "yoon" && k.group !== "extended")) {
      expect(strokes[kana.character], kana.character).toBeDefined();
    }
  });
});

describe("Kana-Beispielwörter", () => {
  it("gibt es für alle Grundzeichen außer ヲ", () => {
    for (const kana of KANA.filter((k) => k.group === "basic" && k.character !== "ヲ")) {
      expect(getKanaExamples(kana.character).length, kana.character).toBeGreaterThan(0);
    }
  });

  it("gehören zu existierenden Zeichen", () => {
    for (const c of KANA_EXAMPLE_CHARACTERS) expect(getKanaByCharacter(c), c).toBeDefined();
  });

  it("enthalten das jeweilige Zeichen in der Lesung", () => {
    for (const c of KANA_EXAMPLE_CHARACTERS) {
      for (const word of getKanaExamples(c)) {
        const haystack = /[゠-ヿ]/.test(c) ? word.reading : toHiragana(word.reading);
        expect(haystack.includes(c), `${c} in ${word.reading}`).toBe(true);
      }
    }
  });

  it("haben Romaji, die zur Lesung passen", () => {
    for (const c of KANA_EXAMPLE_CHARACTERS) {
      for (const word of getKanaExamples(c)) {
        expect(
          checkRomajiAnswer(word.romaji, [toRomaji(word.reading)]),
          `${word.reading} ≠ ${word.romaji}`,
        ).toBe("correct");
      }
    }
  });
});
