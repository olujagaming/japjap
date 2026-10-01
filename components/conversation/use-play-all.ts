"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useAudio } from "@/providers/audio-provider";
import type { AudioSource } from "@/lib/audio/types";

const PAUSE_MS = 450;

/**
 * Spielt eine Folge von Audioquellen nacheinander ab und meldet die aktuelle Position.
 * Abbrechbar; beim Verlassen der Seite wird die Wiedergabe gestoppt.
 */
export function usePlayAll(sources: AudioSource[]) {
  const { play, pause } = useAudio();
  const [current, setCurrent] = useState<number | null>(null);
  const run = useRef(0);

  const stop = useCallback(() => {
    run.current++;
    pause();
    setCurrent(null);
  }, [pause]);

  const playAll = useCallback(
    async (from = 0): Promise<boolean> => {
      const id = ++run.current;
      for (let i = from; i < sources.length; i++) {
        if (run.current !== id) return false;
        setCurrent(i);
        try {
          await play(sources[i]);
        } catch {
          // Einzelne Zeile ohne Audio überspringen
        }
        if (run.current !== id) return false;
        await new Promise((resolve) => setTimeout(resolve, PAUSE_MS));
      }
      if (run.current === id) setCurrent(null);
      return run.current === id;
    },
    [play, sources],
  );

  useEffect(
    () => () => {
      run.current++;
    },
    [],
  );

  return { current, playing: current !== null, playAll, stop };
}
