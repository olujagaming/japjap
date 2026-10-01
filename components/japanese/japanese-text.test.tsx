import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ReactNode } from "react";
import { describe, expect, it, vi } from "vitest";
import type { AudioPlayer } from "@/lib/audio/types";
import { AudioProvider } from "@/providers/audio-provider";
import { FuriganaText } from "./furigana-text";
import { JapaneseText } from "./japanese-text";

function fakePlayer(): AudioPlayer {
  return {
    play: vi.fn(() => Promise.resolve()),
    pause: vi.fn(),
    setSpeed: vi.fn(),
    canPlay: () => true,
  };
}

function wrap(ui: ReactNode, player = fakePlayer()) {
  return { player, ...render(<AudioProvider player={player}>{ui}</AudioProvider>) };
}

describe("FuriganaText", () => {
  it("rendert Kanji mit <ruby>/<rt> und Kana als Text", () => {
    const { container } = render(<FuriganaText japanese="食べる" reading="たべる" />);
    const ruby = container.querySelector("ruby");
    expect(ruby).not.toBeNull();
    expect(ruby?.querySelector("rt")?.textContent).toBe("た");
    expect(container.textContent).toContain("べる");
  });

  it("enthält <rp>-Fallbacks für Browser ohne Ruby-Unterstützung", () => {
    const { container } = render(<FuriganaText japanese="駅" furigana="駅[えき]" />);
    expect(container.querySelectorAll("rp")).toHaveLength(2);
  });

  it("markiert bekannte Wörter für den Modus „Nur unbekannte“", () => {
    const { container } = render(<FuriganaText japanese="駅" furigana="駅[えき]" known />);
    expect(container.querySelector("ruby")?.hasAttribute("data-known")).toBe(true);
  });
});

describe("JapaneseText", () => {
  const props = {
    japanese: "寿司を食べます。",
    furigana: "寿司[すし]を食[た]べます。",
    reading: "すしをたべます。",
    romaji: "sushi o tabemasu.",
    german: "Ich esse Sushi.",
  };

  it("zeigt Japanisch (lang=ja), Romaji und Deutsch", () => {
    const { container } = wrap(<JapaneseText {...props} />);
    expect(container.querySelector('[lang="ja"]')?.textContent).toContain("寿司");
    expect(screen.getByText("sushi o tabemasu.")).toBeInTheDocument();
    expect(screen.getByText("Ich esse Sushi.")).toBeInTheDocument();
    expect(container.querySelectorAll("rt")).toHaveLength(2);
  });

  it("setzt lokale Overrides als data-Attribute", () => {
    const { container } = wrap(
      <JapaneseText {...props} furiganaMode="off" romajiVisible={false} translationMode="click" />,
    );
    const root = container.firstElementChild as HTMLElement;
    expect(root.dataset.furigana).toBe("off");
    expect(root.dataset.romaji).toBe("off");
    expect(root.dataset.translation).toBe("click");
  });

  it("übernimmt ohne Overrides die globalen Einstellungen", () => {
    const { container } = wrap(<JapaneseText {...props} />);
    const root = container.firstElementChild as HTMLElement;
    expect(root.dataset.furigana).toBeUndefined();
    expect(root.dataset.translation).toBeUndefined();
  });

  it("deckt die Übersetzung per Klick auf", async () => {
    const { container } = wrap(<JapaneseText {...props} translationMode="click" />);
    const toggle = screen.getByRole("button", { name: /deutsch anzeigen/i });
    expect(toggle).toHaveAttribute("aria-expanded", "false");
    await userEvent.click(toggle);
    expect(toggle).toHaveAttribute("aria-expanded", "true");
    expect(container.querySelector('[data-revealed="true"]')).not.toBeNull();
  });

  it("spielt Audio über den AudioProvider ab", async () => {
    const { player } = wrap(<JapaneseText {...props} />);
    await userEvent.click(
      screen.getByRole("button", { name: "Aussprache anhören: 寿司を食べます。" }),
    );
    expect(player.play).toHaveBeenCalledWith({ text: "すしをたべます。", url: undefined });
  });

  it("lässt Audio und Übersetzung weg, wenn nicht gewünscht", () => {
    wrap(<JapaneseText japanese="駅" reading="えき" audio={false} />);
    expect(screen.queryByRole("button")).toBeNull();
  });
});
