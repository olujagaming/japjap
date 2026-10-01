import { describe, expect, it } from "vitest";
import {
  findVocabularyByJapanese,
  getKanji,
  getVocabulary,
  kanjiInText,
  relatedVocabulary,
  sentencesForGrammar,
  sentencesForKanji,
  sentencesForVocabulary,
  vocabularyForKanji,
} from "./index";

describe("Content-Verknüpfungen", () => {
  it("verbindet 食べる mit seinem Kanji, Sätzen und verwandten Wörtern", () => {
    const taberu = getVocabulary("taberu")!;
    expect(kanjiInText(taberu.japanese).map((k) => k.character)).toEqual(["食"]);
    expect(sentencesForVocabulary("taberu").length).toBeGreaterThan(2);
    const related = relatedVocabulary(taberu).map((w) => w.japanese);
    expect(related).toEqual(expect.arrayContaining(["食事", "食べ物", "朝食"]));
    expect(related).not.toContain("食べる");
  });

  it("findet zu einem Kanji Wörter und Sätze", () => {
    expect(vocabularyForKanji("食").map((w) => w.id)).toEqual(
      expect.arrayContaining(["taberu", "shokuji", "tabemono", "choushoku", "shokuhin"]),
    );
    expect(sentencesForKanji("駅").every((s) => s.japanese.includes("駅"))).toBe(true);
    expect(getKanji("食")?.related).toContain("飲");
  });

  it("liefert Beispielsätze für Grammatik", () => {
    expect(sentencesForGrammar("te-mo-ii").map((s) => s.japanese)).toContain(
      "ここに座ってもいいですか。",
    );
  });

  it("findet Vokabeln über ihre Schreibweise (Kana-Beispielwörter)", () => {
    expect(findVocabularyByJapanese("駅")?.id).toBe("eki");
    expect(findVocabularyByJapanese("gibtsnicht")).toBeUndefined();
  });
});
