import { AudioUnavailableError, type AudioPlayer, type AudioSource } from "./types";

/** Zeit, nach der eine nie gestartete Sprachausgabe als nicht verfügbar gilt. */
const START_TIMEOUT_MS = 4000;

/**
 * Browser-Implementierung: <audio> für Aufnahmen, Web Speech API (ja-JP) als Fallback.
 * Es spielt immer höchstens eine Quelle gleichzeitig.
 */
export class BrowserAudioPlayer implements AudioPlayer {
  private audio: HTMLAudioElement | null = null;
  private rate = 1;
  private finishCurrent: (() => void) | null = null;

  private get synth(): SpeechSynthesis | null {
    return typeof window !== "undefined" && "speechSynthesis" in window
      ? window.speechSynthesis
      : null;
  }

  canPlay(source: AudioSource): boolean {
    return Boolean(source.url) || (Boolean(source.text) && this.synth !== null);
  }

  setSpeed(rate: number): void {
    this.rate = rate;
    if (this.audio) this.audio.playbackRate = rate;
  }

  pause(): void {
    this.audio?.pause();
    this.synth?.cancel();
    this.finishCurrent?.();
    this.finishCurrent = null;
  }

  play(source: AudioSource): Promise<void> {
    this.pause();
    if (source.url) return this.playUrl(source.url);
    if (source.text && this.synth)
      return this.speak(source.text, source.lang ?? "ja-JP", source.pitch);
    return Promise.reject(new AudioUnavailableError());
  }

  private playUrl(url: string): Promise<void> {
    this.audio ??= new Audio();
    const audio = this.audio;
    audio.src = url;
    audio.playbackRate = this.rate;
    return new Promise((resolve, reject) => {
      const done = () => {
        audio.onended = null;
        audio.onerror = null;
        resolve();
      };
      this.finishCurrent = done;
      audio.onended = done;
      audio.onerror = () =>
        reject(new AudioUnavailableError("Die Audiodatei konnte nicht geladen werden."));
      audio.play().catch(reject);
    });
  }

  private speak(text: string, lang: string, pitch = 1): Promise<void> {
    const synth = this.synth!;
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang;
    utterance.pitch = pitch;
    // TTS klingt bei 1.0 oft gehetzt; leicht verlangsamt ist für Lernende angenehmer.
    utterance.rate = this.rate * 0.9;
    const voice = synth.getVoices().find((v) => v.lang.replace("_", "-").startsWith("ja"));
    if (voice) utterance.voice = voice;

    return new Promise((resolve, reject) => {
      // Manche Browser starten die Ausgabe nie (z. B. ohne passende Stimme) und melden auch
      // kein Ende. Der Wächter verhindert, dass Wiedergabe-Abläufe dann hängen bleiben.
      let watchdog: ReturnType<typeof setTimeout> | undefined = setTimeout(() => {
        synth.cancel();
        reject(new AudioUnavailableError());
      }, START_TIMEOUT_MS);
      const clear = () => {
        if (watchdog) clearTimeout(watchdog);
        watchdog = undefined;
      };
      const done = () => {
        clear();
        resolve();
      };
      this.finishCurrent = done;
      utterance.onstart = clear;
      utterance.onend = done;
      utterance.onerror = (event) => {
        clear();
        if (event.error === "canceled" || event.error === "interrupted") resolve();
        else reject(new AudioUnavailableError());
      };
      synth.speak(utterance);
    });
  }
}
