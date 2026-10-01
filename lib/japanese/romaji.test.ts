import { describe, expect, it } from "vitest";
import { checkRomajiAnswer, normalizeRomaji, toHiragana, toRomaji } from "./romaji";

describe("toRomaji", () => {
  it.each([
    ["すし", "sushi"],
    ["ちず", "chizu"],
    ["つくえ", "tsukue"],
    ["きょう", "kyou"],
    ["きって", "kitte"],
    ["まっちゃ", "matcha"],
    ["コーヒー", "koohii"],
    ["ほんや", "hon'ya"],
    ["しんぶん", "shinbun"],
    ["パーティー", "paatii"],
    ["カフェ", "kafe"],
    ["ジュース", "juusu"],
  ])("%s → %s", (kana, romaji) => {
    expect(toRomaji(kana)).toBe(romaji);
  });
});

describe("toHiragana", () => {
  it("wandelt Katakana um und lässt ー stehen", () => {
    expect(toHiragana("コーヒー")).toBe("こーひー");
  });
});

describe("normalizeRomaji", () => {
  it("vereinheitlicht Kunrei- und Hepburn-Schreibweisen", () => {
    expect(normalizeRomaji("si")).toBe(normalizeRomaji("shi"));
    expect(normalizeRomaji("tu")).toBe(normalizeRomaji("tsu"));
    expect(normalizeRomaji("hu")).toBe(normalizeRomaji("fu"));
    expect(normalizeRomaji("syu")).toBe(normalizeRomaji("shu"));
    expect(normalizeRomaji("zya")).toBe(normalizeRomaji("ja"));
  });

  it("lässt „shu“ und „chu“ unangetastet", () => {
    expect(normalizeRomaji("shukudai")).toBe("shukudai");
    expect(normalizeRomaji("chuu")).toBe("chuu");
  });

  it("behandelt lange Vokale einheitlich", () => {
    const forms = ["kyō", "kyou", "kyoo", "KYŌ"].map(normalizeRomaji);
    expect(new Set(forms).size).toBe(1);
  });
});

describe("checkRomajiAnswer", () => {
  it("akzeptiert Alternativen", () => {
    expect(checkRomajiAnswer("si", ["shi"])).toBe("correct");
    expect(checkRomajiAnswer(" Shi ", ["shi"])).toBe("correct");
    expect(checkRomajiAnswer("o", ["wo", "o"])).toBe("correct");
  });

  it("wertet fehlende Vokallänge oder Verdopplung als „fast richtig“", () => {
    expect(checkRomajiAnswer("kohi", ["kōhī"])).toBe("almost");
    expect(checkRomajiAnswer("kite", ["kitte"])).toBe("almost");
  });

  it("erkennt falsche Antworten", () => {
    expect(checkRomajiAnswer("tsu", ["shi"])).toBe("incorrect");
    expect(checkRomajiAnswer("", ["a"])).toBe("incorrect");
  });

  it("verwechselt n und nn nicht mit falschen Antworten", () => {
    expect(checkRomajiAnswer("konnichiwa", ["konnichiwa"])).toBe("correct");
    expect(checkRomajiAnswer("sampo", ["sanpo"])).toBe("correct");
  });
});
