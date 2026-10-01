import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { BrowserAudioPlayer } from "./browser-player";
import { AudioUnavailableError } from "./types";

type FakeUtterance = {
  text: string;
  lang?: string;
  pitch?: number;
  rate?: number;
  onstart?: () => void;
  onend?: () => void;
  onerror?: (e: { error: string }) => void;
};

let spoken: FakeUtterance[] = [];
let behaviour: "speak" | "silent" = "speak";

beforeEach(() => {
  spoken = [];
  vi.useFakeTimers();
  vi.stubGlobal(
    "SpeechSynthesisUtterance",
    class {
      constructor(public text: string) {}
    },
  );
  Object.defineProperty(window, "speechSynthesis", {
    configurable: true,
    value: {
      getVoices: () => [{ lang: "ja-JP", name: "Kyoko" }],
      cancel: vi.fn(),
      speak: (u: FakeUtterance) => {
        spoken.push(u);
        if (behaviour === "speak") {
          setTimeout(() => u.onstart?.(), 10);
          setTimeout(() => u.onend?.(), 500);
        }
      },
    },
  });
});

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
  behaviour = "speak";
});

describe("BrowserAudioPlayer", () => {
  it("spricht Text auf Japanisch mit Tonhöhe und Tempo", async () => {
    const player = new BrowserAudioPlayer();
    player.setSpeed(1);
    const done = player.play({ text: "えき", pitch: 1.2 });
    await vi.advanceTimersByTimeAsync(600);
    await expect(done).resolves.toBeUndefined();
    expect(spoken[0]).toMatchObject({ text: "えき", lang: "ja-JP", pitch: 1.2 });
    expect(spoken[0].rate).toBeCloseTo(0.9);
  });

  it("bricht ab, wenn die Sprachausgabe nie startet", async () => {
    behaviour = "silent";
    const player = new BrowserAudioPlayer();
    const done = player.play({ text: "えき" });
    const assertion = expect(done).rejects.toBeInstanceOf(AudioUnavailableError);
    await vi.advanceTimersByTimeAsync(5000);
    await assertion;
  });

  it("meldet fehlende Quellen sofort", async () => {
    await expect(new BrowserAudioPlayer().play({})).rejects.toBeInstanceOf(AudioUnavailableError);
  });
});
