"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { BrowserAudioPlayer } from "@/lib/audio/browser-player";
import type { AudioPlayer, AudioSource } from "@/lib/audio/types";
import { useSettings } from "@/hooks/use-settings";

type AudioContextValue = {
  /** Schlüssel der gerade spielenden Quelle (für Play/Stop-Zustand in Buttons). */
  activeKey: string | null;
  play: (source: AudioSource) => Promise<void>;
  pause: () => void;
  setSpeed: (rate: number) => void;
  canPlay: (source: AudioSource) => boolean;
};

const AudioCtx = createContext<AudioContextValue | null>(null);

export function audioKey(source: AudioSource): string {
  return source.url ?? `tts:${source.text ?? ""}`;
}

export function AudioProvider({
  children,
  player: injected,
}: {
  children: React.ReactNode;
  player?: AudioPlayer;
}) {
  const [player] = useState<AudioPlayer>(() => injected ?? new BrowserAudioPlayer());
  const [activeKey, setActiveKey] = useState<string | null>(null);
  const [settings] = useSettings();

  useEffect(() => {
    player.setSpeed(settings.audioSpeed);
  }, [player, settings.audioSpeed]);

  const play = useCallback(
    async (source: AudioSource) => {
      const key = audioKey(source);
      setActiveKey(key);
      try {
        await player.play(source);
      } finally {
        setActiveKey((current) => (current === key ? null : current));
      }
    },
    [player],
  );

  const value = useMemo<AudioContextValue>(
    () => ({
      activeKey,
      play,
      pause: () => {
        player.pause();
        setActiveKey(null);
      },
      setSpeed: (rate) => player.setSpeed(rate),
      canPlay: (source) => player.canPlay(source),
    }),
    [activeKey, play, player],
  );

  return <AudioCtx.Provider value={value}>{children}</AudioCtx.Provider>;
}

export function useAudio(): AudioContextValue {
  const ctx = useContext(AudioCtx);
  if (!ctx) throw new Error("useAudio muss innerhalb von <AudioProvider> verwendet werden.");
  return ctx;
}
