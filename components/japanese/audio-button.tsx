"use client";

import { useState } from "react";
import { SpeakerIcon, StopIcon } from "@/components/ui/icons";
import { audioKey, useAudio } from "@/providers/audio-provider";
import { cn } from "@/lib/utils";

export function AudioButton({
  text,
  url,
  label,
  size = "md",
  className,
}: {
  /** Japanischer Text – wird für TTS und das Screenreader-Label genutzt. */
  text: string;
  url?: string;
  /** Überschreibt das Screenreader-Label. */
  label?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  const { activeKey, play, pause } = useAudio();
  const [failed, setFailed] = useState(false);
  const source = { text, url };
  const playing = activeKey === audioKey(source);

  const onClick = () => {
    if (playing) {
      pause();
      return;
    }
    setFailed(false);
    play(source).catch(() => setFailed(true));
  };

  const accessibleLabel = failed
    ? `Audio nicht verfügbar: ${text}`
    : playing
      ? `Wiedergabe stoppen: ${text}`
      : (label ?? `Aussprache anhören: ${text}`);

  const iconSize = size === "sm" ? 16 : size === "lg" ? 22 : 18;

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={accessibleLabel}
      aria-pressed={playing}
      title={failed ? "Audio in diesem Browser nicht verfügbar" : undefined}
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-full border transition-colors",
        size === "sm" ? "size-7" : size === "lg" ? "size-12" : "size-9",
        playing
          ? "border-accent bg-accent text-accent-fg"
          : "border-line text-muted hover:border-line-strong hover:text-fg",
        failed && "border-dashed opacity-60",
        className,
      )}
    >
      {playing ? <StopIcon size={iconSize} /> : <SpeakerIcon size={iconSize} />}
    </button>
  );
}
