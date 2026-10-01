import { describe, expect, it } from "vitest";
import {
  parseFurigana,
  readingFromFurigana,
  segmentsFromReading,
  stripFurigana,
  toSegments,
} from "./furigana";

describe("parseFurigana", () => {
  it("ordnet Lesungen der vorangehenden Kanji-Folge zu", () => {
    expect(parseFurigana("寿司[すし]を食[た]べます。")).toEqual([
      { text: "寿司", reading: "すし" },
      { text: "を" },
      { text: "食", reading: "た" },
      { text: "べます。" },
    ]);
  });

  it("lässt reine Kana unverändert", () => {
    expect(parseFurigana("すみません")).toEqual([{ text: "すみません" }]);
  });

  it("unterstützt Iterationszeichen", () => {
    expect(parseFurigana("時々[ときどき]")).toEqual([{ text: "時々", reading: "ときどき" }]);
  });

  it("trennt Präfix-Kana vom Kanji", () => {
    expect(parseFurigana("お茶[ちゃ]")).toEqual([{ text: "お" }, { text: "茶", reading: "ちゃ" }]);
  });
});

describe("stripFurigana / readingFromFurigana", () => {
  it("entfernt bzw. extrahiert die Lesung", () => {
    expect(stripFurigana("大丈夫[だいじょうぶ]です")).toBe("大丈夫です");
    expect(readingFromFurigana("大丈夫[だいじょうぶ]です")).toBe("だいじょうぶです");
  });
});

describe("segmentsFromReading", () => {
  it("trennt Okurigana ab", () => {
    expect(segmentsFromReading("食べる", "たべる")).toEqual([
      { text: "食", reading: "た" },
      { text: "べる" },
    ]);
  });

  it("trennt Präfix und Suffix", () => {
    expect(segmentsFromReading("お弁当です", "おべんとうです")).toEqual([
      { text: "お" },
      { text: "弁当", reading: "べんとう" },
      { text: "です" },
    ]);
  });

  it("gibt Text ohne Kanji unverändert zurück", () => {
    expect(segmentsFromReading("コーヒー", "コーヒー")).toEqual([{ text: "コーヒー" }]);
  });

  it("gibt ohne Lesung einen einzelnen Abschnitt zurück", () => {
    expect(segmentsFromReading("駅")).toEqual([{ text: "駅" }]);
  });
});

describe("toSegments", () => {
  it("bevorzugt explizite Segmente vor Notation und Lesung", () => {
    const explicit = [{ text: "今日", reading: "きょう" }];
    expect(toSegments("今日", explicit, "こんにち")).toBe(explicit);
    expect(toSegments("今日", "今日[きょう]")).toEqual(explicit);
    expect(toSegments("今日", undefined, "きょう")).toEqual(explicit);
  });
});
