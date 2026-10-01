import { beforeEach, describe, expect, it } from "vitest";
import type { LearnerProfile } from "@/lib/profile";
import { LocalUserDataStore } from "./local-store";
import { emptyProgress } from "./types";

class MemoryStorage {
  private map = new Map<string, string>();
  getItem(key: string) {
    return this.map.get(key) ?? null;
  }
  setItem(key: string, value: string) {
    this.map.set(key, value);
  }
}

const profile: LearnerProfile = {
  experience: "new",
  goals: ["travel"],
  hiragana: "unknown",
  katakana: "unknown",
  aids: ["furigana"],
  dailyMinutes: 10,
  completedAt: "2026-10-01T08:00:00.000Z",
};

describe("LocalUserDataStore", () => {
  let storage: MemoryStorage;
  let store: LocalUserDataStore;

  beforeEach(() => {
    storage = new MemoryStorage();
    store = new LocalUserDataStore(storage);
  });

  it("speichert und lädt das Profil", async () => {
    expect(await store.getProfile()).toBeNull();
    await store.saveProfile(profile);
    expect(await new LocalUserDataStore(storage).getProfile()).toEqual(profile);
  });

  it("speichert Fortschritt je Inhaltstyp", async () => {
    await store.saveProgress({ ...emptyProgress("kana", "h-a"), status: "known" });
    await store.saveProgress(emptyProgress("kanji", "食"));
    expect(await store.listProgress("kana")).toHaveLength(1);
    expect(await store.listProgress()).toHaveLength(2);
    expect((await store.getProgress("kana", "h-a"))?.status).toBe("known");
  });

  it("schaltet Favoriten um", async () => {
    expect(await store.toggleFavorite("vocabulary", "taberu")).toBe(true);
    expect(await store.listFavorites("vocabulary")).toHaveLength(1);
    expect(await store.toggleFavorite("vocabulary", "taberu")).toBe(false);
    expect(await store.listFavorites()).toHaveLength(0);
  });

  it("übersteht beschädigte Daten", async () => {
    storage.setItem("japjap.userdata.v1", "{kaputt");
    expect(await store.getProfile()).toBeNull();
    expect(await store.listProgress()).toEqual([]);
  });

  it("funktioniert ohne Storage (z. B. auf dem Server)", async () => {
    const memoryless = new LocalUserDataStore(null);
    await memoryless.saveProfile(profile);
    expect(await memoryless.getProfile()).toBeNull();
  });

  it("führt einen Übungsverlauf, neueste zuerst", async () => {
    await store.recordReview({
      contentType: "kana",
      contentId: "h-a",
      taskType: "kana-recognition",
      rating: "good",
      reviewedAt: "2026-09-01T10:00:00.000Z",
    });
    await store.recordReview({
      contentType: "kana",
      contentId: "h-i",
      taskType: "kana-recognition",
      rating: "again",
      reviewedAt: "2026-10-01T10:00:00.000Z",
    });
    const log = await store.listReviewLog();
    expect(log.map((e) => e.contentId)).toEqual(["h-i", "h-a"]);
    expect(await store.listReviewLog({ since: "2026-09-15T00:00:00.000Z" })).toHaveLength(1);
  });

  it("liest ältere Fortschrittsdaten ohne SRS-Felder", async () => {
    storage.setItem(
      "japjap.userdata.v1",
      JSON.stringify({
        profile: null,
        favorites: [],
        progress: {
          "kana:h-a": {
            contentType: "kana",
            contentId: "h-a",
            status: "known",
            easeFactor: 2.5,
            intervalDays: 3,
            nextReviewAt: null,
            lastReviewedAt: null,
            correctCount: 1,
            incorrectCount: 0,
          },
        },
      }),
    );
    expect((await store.getProgress("kana", "h-a"))?.repetitions).toBe(0);
  });
});
