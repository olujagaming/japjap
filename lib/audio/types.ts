/**
 * Audio-Abstraktion. Komponenten kennen nur dieses Interface – ob eine Aufnahme (URL),
 * Browser-TTS oder später ein serverseitiger TTS-Dienst spielt, entscheidet die Implementierung.
 */
export type AudioSource = {
  /** Aufnahme (bevorzugt, wenn vorhanden). */
  url?: string;
  /** Text für Sprachsynthese als Fallback. */
  text?: string;
  /** BCP-47, Standard ja-JP. */
  lang?: string;
  /** Tonhöhe der Sprachsynthese (0–2) – unterscheidet Sprecher in Gesprächen. */
  pitch?: number;
};

export interface AudioPlayer {
  /** Spielt ab und löst auf, sobald die Wiedergabe endet oder abgebrochen wird. */
  play(source: AudioSource): Promise<void>;
  pause(): void;
  setSpeed(rate: number): void;
  canPlay(source: AudioSource): boolean;
}

/** Erweiterungspunkt für serverseitige Sprachsynthese (z. B. ab Phase 4). */
export interface TtsProvider {
  synthesize(text: string, options?: { lang?: string; speed?: number }): Promise<string>;
}

export class AudioUnavailableError extends Error {
  constructor(message = "Für diesen Inhalt ist keine Audioausgabe verfügbar.") {
    super(message);
    this.name = "AudioUnavailableError";
  }
}
