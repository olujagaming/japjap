import { describe, expect, it } from "vitest";
import { emptyProgress } from "@/lib/store/types";
import {
  applyRating,
  deriveStatus,
  isDifficult,
  isDue,
  markKnown,
  markSeen,
  perceivedDifficulty,
  scheduleNow,
  setDifficulty,
} from "./progress";

const now = new Date("2026-10-01T12:00:00Z");
const fresh = () => emptyProgress("kana", "h-ki");

describe("Lernstatus", () => {
  it("unseen → familiar beim Ansehen, sonst unverändert", () => {
    expect(markSeen(fresh()).status).toBe("familiar");
    const learning = { ...fresh(), status: "learning" as const };
    expect(markSeen(learning)).toBe(learning);
  });

  it("steigt mit richtigen Antworten: learning → known → mastered", () => {
    let record = applyRating(fresh(), "good", now);
    expect(record.status).toBe("learning");
    record = applyRating(record, "good", now);
    expect(record.status).toBe("known");
    for (let i = 0; i < 3; i++) record = applyRating(record, "good", now);
    expect(record.status).toBe("mastered");
    expect(record.correctCount).toBe(5);
  });

  it("fällt nach einem Fehler zurück auf learning", () => {
    let record = applyRating(applyRating(fresh(), "good", now), "good", now);
    record = applyRating(record, "again", now);
    expect(record.status).toBe("learning");
    expect(record.incorrectCount).toBe(1);
    expect(record.lapses).toBe(1);
  });

  it("deriveStatus richtet sich nach dem Intervall", () => {
    expect(deriveStatus({ repetitions: 0, intervalDays: 0 })).toBe("learning");
    expect(deriveStatus({ repetitions: 3, intervalDays: 5 })).toBe("known");
    expect(deriveStatus({ repetitions: 6, intervalDays: 30 })).toBe("mastered");
  });

  it("„Als bekannt markieren“ plant die nächste Kontrolle in einer Woche", () => {
    const record = markKnown(fresh(), now);
    expect(record.status).toBe("known");
    expect(Date.parse(record.nextReviewAt!)).toBe(now.getTime() + 7 * 86_400_000);
    expect(isDue(record, now)).toBe(false);
  });

  it("„Wiederholen“ macht den Inhalt sofort fällig", () => {
    const record = scheduleNow(fresh(), now);
    expect(record.status).toBe("learning");
    expect(isDue(record, now)).toBe(true);
  });

  it("Schwierigkeit setzen beeinflusst die Leichtigkeit", () => {
    expect(perceivedDifficulty(setDifficulty(fresh(), "hard"))).toBe("hard");
    expect(perceivedDifficulty(setDifficulty(fresh(), "easy"))).toBe("easy");
    expect(isDifficult(setDifficulty(fresh(), "hard"))).toBe(true);
  });

  it("erkennt wiederholt falsch beantwortete Inhalte als schwierig", () => {
    expect(isDifficult({ ...fresh(), correctCount: 2, incorrectCount: 2 })).toBe(true);
    expect(isDifficult({ ...fresh(), correctCount: 20, incorrectCount: 2 })).toBe(false);
  });
});
