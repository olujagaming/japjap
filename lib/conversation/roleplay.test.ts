import { describe, expect, it } from "vitest";
import { evaluateRoleplayAnswer } from "./roleplay";

const line = {
  japanese: "お会計をお願いします。",
  reading: "おかいけいをおねがいします。",
  romaji: "okaikei o onegai shimasu.",
};

describe("evaluateRoleplayAnswer", () => {
  it("erkennt exakte Antworten in Kanji, Kana und Romaji", () => {
    expect(evaluateRoleplayAnswer("お会計をお願いします", line)).toBe("match");
    expect(evaluateRoleplayAnswer("おかいけいをおねがいします。", line)).toBe("match");
    expect(evaluateRoleplayAnswer("okaikei o onegai shimasu", line)).toBe("match");
    expect(evaluateRoleplayAnswer("Okaikei wo onegaishimasu!", line)).toBe("match");
  });

  it("wertet kleine Abweichungen als „nah dran“", () => {
    const long = {
      japanese: "コーヒーをください。",
      reading: "コーヒーをください。",
      romaji: "kōhī o kudasai.",
    };
    expect(evaluateRoleplayAnswer("kohi o kudasai", long)).toBe("close");
  });

  it("markiert andere Formulierungen zur Selbsteinschätzung", () => {
    expect(evaluateRoleplayAnswer("お会計お願い", line)).toBe("different");
    expect(evaluateRoleplayAnswer("", line)).toBe("different");
  });
});
