"use client";

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import { BrowserSpeechProvider } from "@/lib/speech/browser";
import { isBrowserSpeechRecognitionSupported, type ListenHandle } from "@/lib/speech/types";

const noop = () => () => {};

/** Ob der Browser Spracherkennung anbietet – auf dem Server immer false. */
export function useSpeechSupported(): boolean {
  return useSyncExternalStore(noop, isBrowserSpeechRecognitionSupported, () => false);
}

const provider = new BrowserSpeechProvider();

/** Live-Erkennung mit Zwischenergebnis, Fehlertext und Stop. */
export function useSpeechInput() {
  const [listening, setListening] = useState(false);
  const [interim, setInterim] = useState("");
  const [error, setError] = useState<string | null>(null);
  const handle = useRef<ListenHandle | null>(null);

  useEffect(() => () => handle.current?.abort(), []);

  const start = useCallback(async (): Promise<string | null> => {
    setError(null);
    setInterim("");
    setListening(true);
    const h = provider.listen({ lang: "ja-JP", onInterim: setInterim });
    handle.current = h;
    try {
      const { text } = await h.result;
      return text;
    } catch (e) {
      const message = e instanceof Error ? e.message : "Die Spracherkennung ist fehlgeschlagen.";
      if (message !== "Abgebrochen.") setError(message);
      return null;
    } finally {
      setListening(false);
      handle.current = null;
    }
  }, []);

  const stop = useCallback(() => handle.current?.stop(), []);

  return { listening, interim, error, start, stop };
}
