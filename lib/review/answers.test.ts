import { describe, expect, it } from "vitest";
import {
  checkGermanAnswer,
  checkJapaneseAnswer,
  levenshtein,
  meaningVariants,
  normalizeGerman,
} from "./answers";

describe("normalizeGerman", () => {
  it("entfernt Artikel, Klammern, Satzzeichen und vereinheitlicht Umlaute", () => {
    expect(normalizeGerman("Der Bahnhof!")).toBe("bahnhof");
    expect(normalizeGerman("Tee (meist grüner Tee)")).toBe("tee");
    expect(normalizeGerman("Frühstück")).toBe(normalizeGerman("fruehstueck"));
  });
});

describe("meaningVariants", () => {
  it("zerlegt Aufzählungen", () => {
    expect(meaningVariants(["Lehrer, Lehrerin", "Arzt / Ärztin"])).toEqual([
      "lehrer",
      "lehrerin",
      "arzt",
      "aerztin",
    ]);
  });
});

describe("checkGermanAnswer", () => {
  it("akzeptiert jede Bedeutung", () => {
    expect(checkGermanAnswer("teuer", ["teuer", "hoch"])).toBe("correct");
    expect(checkGermanAnswer("hoch", ["teuer", "hoch"])).toBe("correct");
    expect(checkGermanAnswer("die Lehrerin", ["Lehrer, Lehrerin"])).toBe("correct");
  });

  it("wertet Tippfehler und Teilantworten als „fast richtig“", () => {
    expect(checkGermanAnswer("Bahnhfo", ["Bahnhof", "Station"])).toBe("almost");
    expect(checkGermanAnswer("Kreditkarte", ["Karte (z. B. Kreditkarte)"])).toBe("incorrect");
    expect(checkGermanAnswer("Zeit", ["Zeit", "Stunde(n)"])).toBe("correct");
    expect(checkGermanAnswer("Grund", ["Grund"])).toBe("correct");
    expect(checkGermanAnswer("Wochenende", ["Wochenende frei"])).toBe("almost");
  });

  it("lehnt Falsches ab", () => {
    expect(checkGermanAnswer("trinken", ["essen"])).toBe("incorrect");
    expect(checkGermanAnswer("", ["essen"])).toBe("incorrect");
  });
});

describe("checkJapaneseAnswer", () => {
  const taberu = { japanese: ["食べる", "たべる"], romaji: ["taberu"] };
  it("akzeptiert Kanji, Kana und Romaji", () => {
    expect(checkJapaneseAnswer("食べる", taberu)).toBe("correct");
    expect(checkJapaneseAnswer("たべる", taberu)).toBe("correct");
    expect(checkJapaneseAnswer("タベル", taberu)).toBe("correct");
    expect(checkJapaneseAnswer("taberu", taberu)).toBe("correct");
  });

  it("toleriert fehlende Längen in Romaji", () => {
    expect(checkJapaneseAnswer("kohi", { japanese: ["コーヒー"], romaji: ["kōhī"] })).toBe(
      "almost",
    );
  });

  it("prüft Partikel in Lückensätzen", () => {
    expect(checkJapaneseAnswer("は", { japanese: ["は"], romaji: ["wa"] })).toBe("correct");
    expect(checkJapaneseAnswer("wa", { japanese: ["は"], romaji: ["wa"] })).toBe("correct");
    expect(checkJapaneseAnswer("が", { japanese: ["は"], romaji: ["wa"] })).toBe("incorrect");
  });

  it("berechnet die Editierdistanz", () => {
    expect(levenshtein("kitten", "sitting")).toBe(3);
  });
});
