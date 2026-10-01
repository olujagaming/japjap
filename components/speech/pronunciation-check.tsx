"use client";

import { useState } from "react";
import { assessPronunciation } from "@/lib/speech/pronunciation";
import type { PronunciationAssessment } from "@/lib/speech/types";
import { cn } from "@/lib/utils";
import { useSpeechInput, useSpeechSupported } from "./use-speech";

const TONE = {
  clear: "border-matcha/40 bg-matcha-soft/50 text-matcha",
  good: "border-accent/40 bg-accent-soft/50 text-accent",
  partial: "border-kohaku/40 bg-kohaku-soft/50 text-kohaku",
  unclear: "border-akane/40 bg-akane-soft/50 text-akane",
} as const;

/**
 * „Nachsprechen“: Der Nutzer spricht einen Ausdruck, die Spracherkennung prüft,
 * ob er verstanden wurde. Ehrlich benannt – keine phonetische Lautanalyse.
 */
export function PronunciationCheck({
  japanese,
  reading,
  compact = false,
}: {
  japanese: string;
  reading: string;
  compact?: boolean;
}) {
  const supported = useSpeechSupported();
  const { listening, interim, error, start, stop } = useSpeechInput();
  const [result, setResult] = useState<PronunciationAssessment | null>(null);
  if (!supported) return null;

  const run = async () => {
    if (listening) {
      stop();
      return;
    }
    setResult(null);
    const text = await start();
    if (text !== null) setResult(assessPronunciation(text, { japanese, reading }));
  };

  return (
    <div className="flex flex-col gap-2">
      <button
        type="button"
        onClick={() => void run()}
        aria-pressed={listening}
        className={cn(
          "self-start rounded-full border transition-colors",
          compact ? "h-7 px-2.5 text-xs" : "h-9 px-3.5 text-sm",
          listening
            ? "animate-pulse border-akane bg-akane text-bg"
            : "border-line text-muted hover:text-fg",
        )}
      >
        {listening ? "Aufnahme beenden" : "Nachsprechen"}
      </button>
      <div aria-live="polite">
        {listening ? (
          <p lang="ja" className="font-jp text-sm text-muted">
            {interim || "Sprich jetzt …"}
          </p>
        ) : null}
        {error ? <p className="text-sm text-akane">{error}</p> : null}
        {result ? (
          <div className={cn("rounded-md border px-3 py-2 text-sm", TONE[result.verdict])}>
            <p className="font-medium">
              {result.score} / 100 · {result.feedbackDe}
            </p>
            <p className="mt-0.5 text-xs text-muted">
              Erkannt:{" "}
              <span lang="ja" className="font-jp">
                {result.recognized || "–"}
              </span>
            </p>
          </div>
        ) : null}
      </div>
    </div>
  );
}
