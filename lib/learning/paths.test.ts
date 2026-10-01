import { describe, expect, it } from "vitest";
import { KANA } from "@/data/kana";
import { LEARNING_PATH_SECTIONS } from "@/data/learning-paths";
import { emptyProgress, type ProgressRecord } from "@/lib/store/types";
import { pathProgress } from "./paths";

const path = (id: string) =>
  LEARNING_PATH_SECTIONS.flatMap((s) => s.paths).find((p) => p.id === id)!;
const known = (contentType: ProgressRecord["contentType"], id: string): ProgressRecord => ({
  ...emptyProgress(contentType, id),
  status: "known",
  correctCount: 1,
});

describe("Lernpfade", () => {
  it("verweisen nur auf existierende Inhalte", () => {
    for (const section of LEARNING_PATH_SECTIONS) {
      for (const p of section.paths) expect(() => pathProgress(p, [])).not.toThrow();
    }
  });

  it("beginnen ohne Fortschritt mit der ersten Einheit", () => {
    const progress = pathProgress(path("hiragana"), []);
    expect(progress.completedItems).toBe(0);
    expect(progress.next?.label).toBe("46 Grundzeichen");
    expect(progress.items[0].max).toBe(46);
  });

  it("schließen Kana-Einheiten ab 80 % bekannter Zeichen ab und empfehlen die nächste", () => {
    const basic = KANA.filter((k) => k.scriptType === "hiragana" && k.group === "basic").slice(
      0,
      37,
    );
    const progress = pathProgress(
      path("hiragana"),
      basic.map((k) => known("kana", k.id)),
    );
    expect(progress.items[0].done).toBe(true);
    expect(progress.next?.label).toBe("Dakuten und Handakuten");
  });

  it("zählen Situationen über durchgearbeitete Gespräche", () => {
    const progress = pathProgress(path("travel"), [known("conversation", "station-ticket")]);
    const station = progress.items.find((i) => i.href === "/situations/station")!;
    expect(station.value).toBe(1);
    expect(station.done).toBe(false);
  });
});
