import { describe, expect, it } from "vitest";
import { assessPronunciation } from "./pronunciation";

const target = { japanese: "お会計をお願いします。", reading: "おかいけいをおねがいします。" };

describe("assessPronunciation", () => {
  it("bewertet eine exakt erkannte Äußerung (Kanji oder Kana) als klar", () => {
    expect(assessPronunciation("お会計をお願いします", target)).toMatchObject({
      score: 100,
      verdict: "clear",
    });
    expect(assessPronunciation("おかいけいをおねがいします", target).verdict).toBe("clear");
  });

  it("erkennt kleine Abweichungen als gut oder teilweise", () => {
    expect(assessPronunciation("お会計お願いします", target).verdict).toBe("clear");
    expect(assessPronunciation("おかいけいをおねがい", target).verdict).toBe("good");
    expect(assessPronunciation("おかいけいを", target).verdict).toBe("partial");
  });

  it("meldet Unverständliches und leere Erkennung", () => {
    expect(assessPronunciation("", target)).toMatchObject({ score: 0, verdict: "unclear" });
    expect(assessPronunciation("こんにちは", target).verdict).toBe("unclear");
  });
});
