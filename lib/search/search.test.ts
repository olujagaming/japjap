import { describe, expect, it } from "vitest";
import { groupResults, search } from "./index";

const first = (query: string, group: string) => search(query).find((r) => r.group === group);

describe("search", () => {
  it("findet über Deutsch Vokabel, Kanji und Sätze", () => {
    const results = search("essen");
    expect(first("essen", "vocabulary")?.japanese).toBe("食べる");
    expect(first("essen", "kanji")?.japanese).toBe("食");
    expect(results.some((r) => r.group === "sentence")).toBe(true);
  });

  it("findet über Kanji, Hiragana und Katakana", () => {
    expect(first("食べる", "vocabulary")?.id).toBe("taberu");
    expect(first("たべる", "vocabulary")?.id).toBe("taberu");
    expect(first("コーヒー", "vocabulary")?.id).toBe("kohii");
    expect(first("こーひー", "vocabulary")?.id).toBe("kohii");
  });

  it("findet über Romaji – mit und ohne Längenstriche", () => {
    expect(first("taberu", "vocabulary")?.id).toBe("taberu");
    expect(first("kohi", "vocabulary")).toBeUndefined();
    expect(first("koohii", "vocabulary")?.id).toBe("kohii");
    expect(first("kōhī", "vocabulary")?.id).toBe("kohii");
  });

  it("findet Kana nur bei exakter Lesung", () => {
    expect(
      search("ki")
        .filter((r) => r.group === "kana")
        .map((r) => r.japanese),
    ).toEqual(expect.arrayContaining(["き", "キ"]));
    expect(search("k").filter((r) => r.group === "kana")).toHaveLength(0);
  });

  it("findet Kanji über Lesungen", () => {
    expect(first("ショク", "kanji")?.japanese).toBe("食");
    expect(first("たべる", "kanji")?.japanese).toBe("食");
  });

  it("findet Grammatik über Muster und Bedeutung", () => {
    expect(first("てもいい", "grammar")?.id).toBe("te-mo-ii");
    expect(first("dürfen", "grammar")?.id).toBe("te-mo-ii");
  });

  it("ignoriert Groß-/Kleinschreibung und Umlaut-Varianten", () => {
    expect(first("BAHNHOF", "vocabulary")?.id).toBe("eki");
    expect(first("frühstück", "vocabulary")).toBeDefined();
  });

  it("liefert für leere Eingaben nichts und begrenzt Gruppen", () => {
    expect(search("   ")).toEqual([]);
    const grouped = groupResults(search("e", { limitPerGroup: 3 }));
    for (const g of grouped) expect(g.items.length).toBeLessThanOrEqual(3);
  });
});

describe("search – Situationen und Gespräche", () => {
  it("findet Situationen auf Deutsch und Japanisch", () => {
    expect(search("bahnhof").some((r) => r.group === "situation" && r.id === "station")).toBe(true);
    expect(search("コンビニ").some((r) => r.group === "situation" && r.id === "konbini")).toBe(
      true,
    );
  });

  it("findet Gespräche über ihren Titel", () => {
    expect(search("restaurant").some((r) => r.group === "conversation")).toBe(true);
    expect(
      search("bestellen").some((r) => r.group === "conversation" && r.id === "cafe-order"),
    ).toBe(true);
  });
});
