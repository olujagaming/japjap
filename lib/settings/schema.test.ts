import { describe, expect, it } from "vitest";
import { resolveTheme } from "./document";
import { DEFAULT_SETTINGS, parseSettings } from "./schema";

describe("parseSettings", () => {
  it("liefert sinnvolle Standardwerte für Einsteiger", () => {
    expect(parseSettings(undefined)).toEqual(DEFAULT_SETTINGS);
    expect(DEFAULT_SETTINGS.furigana).toBe("always");
    expect(DEFAULT_SETTINGS.romaji).toBe(true);
    expect(DEFAULT_SETTINGS.translation).toBe("always");
  });

  it("setzt nur ungültige Felder zurück", () => {
    const parsed = parseSettings({ furigana: "off", romaji: "ja", audioSpeed: 99 });
    expect(parsed.furigana).toBe("off");
    expect(parsed.romaji).toBe(true);
    expect(parsed.audioSpeed).toBe(1);
  });

  it("ignoriert unbekannte Felder", () => {
    expect(parseSettings({ foo: 1 })).toEqual(DEFAULT_SETTINGS);
  });
});

describe("resolveTheme", () => {
  it("löst „system“ anhand der Systemvorgabe auf", () => {
    expect(resolveTheme("system", true)).toBe("dark");
    expect(resolveTheme("system", false)).toBe("light");
    expect(resolveTheme("light", true)).toBe("light");
  });
});
