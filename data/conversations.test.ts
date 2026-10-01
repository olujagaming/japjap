import { describe, expect, it } from "vitest";
import { normalizeRomaji, toRomaji } from "@/lib/japanese/romaji";
import { CONVERSATIONS } from "./conversations";
import { getGrammar } from "./grammar";
import { SITUATIONS, getSituation } from "./situations";
import { getVocabulary } from "./vocabulary";

const loose = (romaji: string) => normalizeRomaji(romaji).replace(/ha/g, "wa").replace(/he/g, "e");
const romajiMatches = (romaji: string, reading: string) =>
  loose(romaji) === loose(toRomaji(reading));

function stem(id: string) {
  const word = getVocabulary(id)!;
  if (word.partOfSpeech === "verb-suru") return word.japanese.replace(/する$/, "");
  if (word.partOfSpeech.startsWith("verb") || word.partOfSpeech === "adj-i")
    return word.japanese.slice(0, -1);
  return word.japanese;
}

describe("Gespräche", () => {
  it("gibt es mindestens 15 mit eindeutigen IDs", () => {
    expect(CONVERSATIONS.length).toBeGreaterThanOrEqual(15);
    expect(new Set(CONVERSATIONS.map((c) => c.id)).size).toBe(CONVERSATIONS.length);
  });

  it("gehören zu existierenden Situationen und haben genau eine Lernerrolle", () => {
    for (const c of CONVERSATIONS) {
      expect(getSituation(c.situationId), c.id).toBeDefined();
      expect(
        c.speakers.filter((s) => s.isLearner),
        c.id,
      ).toHaveLength(1);
      expect(c.lines.length, c.id).toBeGreaterThanOrEqual(5);
      for (const line of c.lines) {
        expect(
          c.speakers.some((s) => s.key === line.speaker),
          line.id,
        ).toBe(true);
      }
    }
  });

  it("haben Romaji, die zur Lesung passen (Titel und Zeilen)", () => {
    for (const c of CONVERSATIONS) {
      for (const line of c.lines) {
        expect(romajiMatches(line.romaji, line.reading), `${line.id}: ${line.romaji}`).toBe(true);
      }
    }
  });

  it("verknüpfen nur Wörter und Grammatik, die in der Zeile vorkommen", () => {
    for (const c of CONVERSATIONS) {
      for (const line of c.lines) {
        for (const id of line.vocabularyIds) {
          expect(getVocabulary(id), `${line.id} → ${id}`).toBeDefined();
          expect(line.japanese.includes(stem(id)), `${line.id} enthält ${id}`).toBe(true);
        }
        for (const id of line.grammarIds)
          expect(getGrammar(id), `${line.id} → ${id}`).toBeDefined();
      }
    }
  });

  it("enden jede Zeile mit Satzzeichen", () => {
    for (const c of CONVERSATIONS) {
      for (const line of c.lines) {
        expect(line.japanese, line.id).toMatch(/[。？！]$/);
        expect(line.german, line.id).toMatch(/[.?!]$/);
      }
    }
  });
});

describe("Situationen", () => {
  it("gibt es mindestens 10, jede mit Gesprächen", () => {
    expect(SITUATIONS.length).toBeGreaterThanOrEqual(10);
    for (const s of SITUATIONS) {
      expect(
        CONVERSATIONS.some((c) => c.situationId === s.id),
        s.slug,
      ).toBe(true);
    }
  });

  it("haben gültige Vokabeln und Schlüsselausdrücke", () => {
    for (const s of SITUATIONS) {
      for (const id of s.vocabularyIds)
        expect(getVocabulary(id), `${s.slug} → ${id}`).toBeDefined();
      expect(s.keyExpressions.length).toBeGreaterThanOrEqual(3);
      for (const e of s.keyExpressions) {
        expect(romajiMatches(e.romaji, e.reading), `${s.slug}: ${e.romaji}`).toBe(true);
      }
      expect(s.culturalNotesDe.length).toBeGreaterThan(0);
    }
  });
});
