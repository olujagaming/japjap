import { describe, expect, it } from "vitest";
import { sm2Scheduler } from "./sm2";

const now = new Date("2026-10-01T12:00:00Z");
const DAY = 86_400_000;

describe("sm2Scheduler", () => {
  it("plant neue Inhalte nach „gut“ für morgen, dann in 3 Tagen", () => {
    const first = sm2Scheduler.schedule(sm2Scheduler.initialState(), "good", now);
    expect(first.intervalDays).toBe(1);
    expect(first.dueAt?.getTime()).toBe(now.getTime() + DAY);
    const second = sm2Scheduler.schedule(first, "good", now);
    expect(second.intervalDays).toBe(3);
    const third = sm2Scheduler.schedule(second, "good", now);
    expect(third.intervalDays).toBeCloseTo(7.5);
  });

  it("setzt bei „nochmal“ zurück, zählt einen Rückfall und senkt die Leichtigkeit", () => {
    const learned = sm2Scheduler.schedule(sm2Scheduler.initialState(), "good", now);
    const again = sm2Scheduler.schedule(learned, "again", now);
    expect(again.repetitions).toBe(0);
    expect(again.lapses).toBe(1);
    expect(again.easeFactor).toBeLessThan(learned.easeFactor);
    expect(again.intervalDays).toBeLessThan(0.01);
  });

  it("„leicht“ springt weiter als „gut“, „schwer“ weniger weit", () => {
    const base = sm2Scheduler.schedule(
      sm2Scheduler.schedule(sm2Scheduler.initialState(), "good", now),
      "good",
      now,
    );
    const hard = sm2Scheduler.schedule(base, "hard", now).intervalDays;
    const good = sm2Scheduler.schedule(base, "good", now).intervalDays;
    const easy = sm2Scheduler.schedule(base, "easy", now).intervalDays;
    expect(hard).toBeLessThan(good);
    expect(good).toBeLessThan(easy);
  });

  it("hält die Leichtigkeit in Grenzen", () => {
    let state = sm2Scheduler.initialState();
    for (let i = 0; i < 20; i++) state = sm2Scheduler.schedule(state, "again", now);
    expect(state.easeFactor).toBe(1.3);
  });
});
