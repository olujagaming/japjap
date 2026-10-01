import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { describe, expect, it, vi } from "vitest";
import type { AudioPlayer } from "@/lib/audio/types";
import { createTask } from "@/lib/review/tasks";
import { emptyProgress } from "@/lib/store/types";
import { AudioProvider } from "@/providers/audio-provider";
import { ReviewTaskView, type TaskResult } from "./review-task";

const player: AudioPlayer = {
  play: vi.fn(() => Promise.resolve()),
  pause: vi.fn(),
  setSpeed: vi.fn(),
  canPlay: () => true,
};

function Harness({
  id,
  type,
  repetitions = 0,
}: {
  id: string;
  type: "vocabulary" | "grammar" | "conversation";
  repetitions?: number;
}) {
  const [result, setResult] = useState<TaskResult | null>(null);
  const task = createTask({ ...emptyProgress(type, id), repetitions })!;
  return (
    <AudioProvider player={player}>
      <ReviewTaskView task={task} result={result} onAnswer={setResult} />
      <span data-testid="verdict">{result?.verdict ?? ""}</span>
    </AudioProvider>
  );
}

describe("ReviewTaskView", () => {
  it("prüft die deutsche Bedeutung einer Vokabel", async () => {
    render(<Harness id="taberu" type="vocabulary" />);
    await userEvent.type(screen.getByLabelText("Deutsche Bedeutung"), "Essen{Enter}");
    expect(screen.getByTestId("verdict")).toHaveTextContent("correct");
    expect(screen.getByRole("status")).toHaveTextContent("Richtig");
  });

  it("akzeptiert Romaji beim aktiven Abrufen", async () => {
    render(<Harness id="mizu" type="vocabulary" repetitions={2} />);
    expect(screen.getByText("Wasser")).toBeInTheDocument();
    await userEvent.type(screen.getByLabelText("Japanisch oder Romaji"), "mizu{Enter}");
    expect(screen.getByTestId("verdict")).toHaveTextContent("correct");
  });

  it("zeigt bei Lückensätzen die vollständige Lösung", async () => {
    render(<Harness id="masu" type="grammar" />);
    await userEvent.type(screen.getByLabelText("Fehlender Teil"), "いきます{Enter}");
    expect(screen.getByTestId("verdict")).toHaveTextContent("correct");
    expect(screen.getByText("明日東京に行きます。")).toBeInTheDocument();
  });

  it("lässt abweichende Formulierungen in Situationen selbst einschätzen", async () => {
    render(<Harness id="cafe-order" type="conversation" />);
    await userEvent.type(screen.getByLabelText("Deine Antwort"), "kohii kudasai{Enter}");
    expect(screen.getByTestId("verdict")).toHaveTextContent("open");
  });
});
