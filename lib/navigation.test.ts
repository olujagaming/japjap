import { describe, expect, it } from "vitest";
import {
  isActivePath,
  MOBILE_MORE_NAV,
  MOBILE_NAV,
  PRIMARY_NAV,
  SECONDARY_NAV,
} from "./navigation";

describe("Navigation", () => {
  it("markiert „/“ nur exakt als aktiv", () => {
    expect(isActivePath("/", "/")).toBe(true);
    expect(isActivePath("/kana", "/")).toBe(false);
  });

  it("markiert Unterseiten als aktiv, aber keine Namensvettern", () => {
    expect(isActivePath("/kana/き", "/kana")).toBe(true);
    expect(isActivePath("/kanji", "/kana")).toBe(false);
  });

  it("mobil ist jeder Bereich genau einmal erreichbar", () => {
    const mobile = [...MOBILE_NAV, ...MOBILE_MORE_NAV].map((i) => i.href).sort();
    const desktop = [...PRIMARY_NAV, ...SECONDARY_NAV].map((i) => i.href).sort();
    expect(mobile).toEqual(desktop);
    expect(MOBILE_NAV.map((i) => i.href)).toEqual(["/", "/learn", "/review", "/search"]);
  });
});
