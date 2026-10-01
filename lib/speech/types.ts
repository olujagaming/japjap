/**
 * Sprach-Eingabe (Phase 7). Vorerst nur der Vertrag, damit Conversation- und
 * Review-UI später ohne Umbau um Spracheingabe erweitert werden können.
 */

export type Transcription = {
  text: string;
  /** 0–1, falls vom Provider geliefert. */
  confidence?: number;
};

export type PronunciationAssessment = {
  /** 0–100 */
  score: number;
  feedbackDe: string;
};

export interface SpeechProvider {
  transcribe(audio: Blob, options?: { lang?: string }): Promise<Transcription>;
  evaluatePronunciation?(audio: Blob, expected: string): Promise<PronunciationAssessment>;
}

/** Prüft, ob der Browser Web-Speech-Erkennung anbietet. */
export function isBrowserSpeechRecognitionSupported(): boolean {
  if (typeof window === "undefined") return false;
  return "SpeechRecognition" in window || "webkitSpeechRecognition" in window;
}
