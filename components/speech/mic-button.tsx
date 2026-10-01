"use client";

import { cn } from "@/lib/utils";
import { useSpeechInput, useSpeechSupported } from "./use-speech";

function MicIcon({ size = 18 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      aria-hidden="true"
    >
      <rect x="9" y="3" width="6" height="11" rx="3" />
      <path d="M5.5 11a6.5 6.5 0 0 0 13 0M12 17.5V21M8.5 21h7" />
    </svg>
  );
}

/**
 * Spracheingabe auf Japanisch. Wird nur angezeigt, wenn der Browser Spracherkennung anbietet;
 * das Erkannte wird an `onTranscript` übergeben (z. B. ins Eingabefeld eingefügt).
 */
export function MicButton({
  onTranscript,
  className,
}: {
  onTranscript: (text: string) => void;
  className?: string;
}) {
  const supported = useSpeechSupported();
  const { listening, interim, error, start, stop } = useSpeechInput();
  if (!supported) return null;

  const toggle = async () => {
    if (listening) {
      stop();
      return;
    }
    const text = await start();
    if (text) onTranscript(text);
  };

  return (
    <span className={cn("inline-flex items-center gap-2", className)}>
      <button
        type="button"
        onClick={() => void toggle()}
        aria-pressed={listening}
        aria-label={listening ? "Spracheingabe beenden" : "Auf Japanisch sprechen"}
        title={listening ? "Spracheingabe beenden" : "Auf Japanisch sprechen"}
        className={cn(
          "inline-flex size-10 shrink-0 items-center justify-center rounded-full border transition-colors",
          listening
            ? "animate-pulse border-akane bg-akane text-bg"
            : "border-line text-muted hover:border-line-strong hover:text-fg",
        )}
      >
        <MicIcon />
      </button>
      <span aria-live="polite" className="min-w-0 truncate text-sm">
        {listening ? (
          <span lang="ja" className="font-jp text-muted">
            {interim || "Ich höre zu …"}
          </span>
        ) : null}
        {error ? <span className="text-akane">{error}</span> : null}
      </span>
    </span>
  );
}
