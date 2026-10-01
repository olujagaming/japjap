import { describe, expect, it } from "vitest";
import { normalizeRomaji, toRomaji } from "@/lib/japanese/romaji";
import { KANJI_PATTERN } from "@/lib/utils";
import { GRAMMAR, getGrammar } from "./grammar";
import { getKanji, KANJI } from "./kanji";
import { SENTENCES } from "./sentences";
import kanjiStrokes from "./stroke-order/kanji.json";
import { getVocabulary, TAG_LABELS, VOCABULARY } from "./vocabulary";

/**
 * Vergleich von handgeschriebenen Romaji mit der automatischen Umschrift.
 * Partikel は/へ werden „wa“/„e“ gesprochen – beide Seiten werden dafür gleich normalisiert.
 */
const loose = (romaji: string) => normalizeRomaji(romaji).replace(/ha/g, "wa").replace(/he/g, "e");
const romajiMatches = (romaji: string, reading: string) =>
  loose(romaji) === loose(toRomaji(reading));

/** Wortstamm, der auch in gebeugten Formen vorkommt (食べる → 食べ, 勉強する → 勉強). */
function stem(word: (typeof VOCABULARY)[number]) {
  if (word.partOfSpeech === "verb-suru") return word.japanese.replace(/する$/, "");
  if (word.partOfSpeech.startsWith("verb") || word.partOfSpeech === "adj-i") {
    return word.japanese.length > 1 ? word.japanese.slice(0, -1) : word.japanese;
  }
  return word.japanese;
}

const unique = (values: string[]) => new Set(values).size === values.length;

describe("Vokabeln", () => {
  it("haben mindestens 50 Einträge mit eindeutigen IDs", () => {
    expect(VOCABULARY.length).toBeGreaterThanOrEqual(50);
    expect(unique(VOCABULARY.map((v) => v.id))).toBe(true);
  });

  it("haben Romaji, die zur Lesung passen", () => {
    for (const word of VOCABULARY) {
      expect(romajiMatches(word.romaji, word.reading), `${word.japanese}: ${word.romaji}`).toBe(
        true,
      );
    }
  });

  it("haben Furigana genau dann, wenn Kanji vorkommen", () => {
    for (const word of VOCABULARY) {
      expect(Boolean(word.furigana), word.japanese).toBe(KANJI_PATTERN.test(word.japanese));
    }
  });

  it("verweisen nur auf existierende Wörter und bekannte Themen", () => {
    for (const word of VOCABULARY) {
      for (const id of word.related) expect(getVocabulary(id), `${word.id} → ${id}`).toBeDefined();
      for (const tag of word.tags) expect(TAG_LABELS[tag], `${word.id}: ${tag}`).toBeDefined();
      expect(word.german.length).toBeGreaterThan(0);
    }
  });
});

describe("Kanji", () => {
  const strokes = kanjiStrokes.strokes as Record<string, string[]>;

  it("haben mindestens 20 Einträge", () => {
    expect(KANJI.length).toBeGreaterThanOrEqual(20);
    expect(unique(KANJI.map((k) => k.character))).toBe(true);
  });

  it("haben Strichzahlen wie in KanjiVG", () => {
    for (const kanji of KANJI) {
      expect(strokes[kanji.character]?.length, kanji.character).toBe(kanji.strokeCount);
    }
  });

  it("schreiben On-Lesungen in Katakana und Kun-Lesungen in Hiragana", () => {
    for (const kanji of KANJI) {
      for (const on of kanji.onyomi) expect(on, kanji.character).toMatch(/^[゠-ヿ]+$/);
      for (const kun of kanji.kunyomi) expect(kun, kanji.character).toMatch(/^[぀-ゟ.-]+$/);
    }
  });

  it("kommen im Wortschatz vor", () => {
    for (const kanji of KANJI) {
      expect(
        VOCABULARY.some((v) => v.japanese.includes(kanji.character)),
        kanji.character,
      ).toBe(true);
    }
  });

  it("verweisen auf verwandte Zeichen, die überwiegend existieren", () => {
    const all = KANJI.flatMap((k) => k.related);
    const existing = all.filter((c) => getKanji(c));
    expect(existing.length / all.length).toBeGreaterThan(0.9);
  });
});

describe("Grammatik", () => {
  it("hat mindestens 10 Punkte mit eindeutigen Slugs", () => {
    expect(GRAMMAR.length).toBeGreaterThanOrEqual(10);
    expect(unique(GRAMMAR.map((g) => g.slug))).toBe(true);
  });

  it("verweist nur auf existierende ähnliche Grammatik", () => {
    for (const point of GRAMMAR) {
      for (const id of point.similar) expect(getGrammar(id), `${point.id} → ${id}`).toBeDefined();
    }
  });

  it("hat zu jedem Punkt mindestens zwei Beispielsätze", () => {
    for (const point of GRAMMAR) {
      expect(
        SENTENCES.filter((s) => s.grammarIds.includes(point.id)).length,
        point.id,
      ).toBeGreaterThanOrEqual(2);
    }
  });
});

describe("Beispielsätze", () => {
  it("gibt es mindestens 60, mit eindeutigen IDs", () => {
    expect(SENTENCES.length).toBeGreaterThanOrEqual(60);
    expect(unique(SENTENCES.map((s) => s.id))).toBe(true);
  });

  it("haben Romaji, die zur Lesung passen", () => {
    for (const sentence of SENTENCES) {
      expect(
        romajiMatches(sentence.romaji, sentence.reading),
        `${sentence.id}: ${sentence.romaji}`,
      ).toBe(true);
    }
  });

  it("enthalten die verknüpften Wörter", () => {
    for (const sentence of SENTENCES) {
      for (const id of sentence.vocabularyIds) {
        const word = getVocabulary(id);
        expect(word, `${sentence.id} → ${id}`).toBeDefined();
        expect(
          sentence.japanese.includes(stem(word!)),
          `${sentence.id} enthält ${word!.japanese}`,
        ).toBe(true);
      }
      for (const id of sentence.grammarIds)
        expect(getGrammar(id), `${sentence.id} → ${id}`).toBeDefined();
    }
  });

  it("enden mit Satzzeichen", () => {
    for (const sentence of SENTENCES) {
      expect(sentence.japanese, sentence.id).toMatch(/[。？！]$/);
      expect(sentence.german, sentence.id).toMatch(/[.?!]$/);
    }
  });
});
