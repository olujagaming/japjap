/**
 * Spracheingabe. Zwei Arten von Providern:
 * - Live-Erkennung im Browser (Web Speech API) über `listen()` – heute umgesetzt
 * - Serverseitige Transkription aufgenommener Audiodaten über `transcribe()` – Erweiterungspunkt
 */

export type Transcription = {
  text: string;
  /** 0–1, falls vom Provider geliefert. */
  confidence?: number;
};

export type PronunciationVerdict = "clear" | "good" | "partial" | "unclear";

export type PronunciationAssessment = {
  /** 0–100 */
  score: number;
  verdict: PronunciationVerdict;
  feedbackDe: string;
  recognized: string;
};

export type ListenHandle = {
  /** Endgültiges Ergebnis, sobald die Erkennung endet. */
  result: Promise<Transcription>;
  /** Beendet die Aufnahme und liefert das bisher Erkannte. */
  stop(): void;
  /** Bricht ab, ohne Ergebnis. */
  abort(): void;
};

export interface SpeechProvider {
  listen?(options?: { lang?: string; onInterim?: (text: string) => void }): ListenHandle;
  transcribe?(audio: Blob, options?: { lang?: string }): Promise<Transcription>;
  evaluatePronunciation?(audio: Blob, expected: string): Promise<PronunciationAssessment>;
}

export class SpeechUnavailableError extends Error {
  constructor(message = "Spracherkennung ist in diesem Browser nicht verfügbar.") {
    super(message);
    this.name = "SpeechUnavailableError";
  }
}

/** Prüft, ob der Browser Web-Speech-Erkennung anbietet. */
export function isBrowserSpeechRecognitionSupported(): boolean {
  if (typeof window === "undefined") return false;
  return "SpeechRecognition" in window || "webkitSpeechRecognition" in window;
}
