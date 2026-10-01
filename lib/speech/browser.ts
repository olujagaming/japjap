import {
  isBrowserSpeechRecognitionSupported,
  SpeechUnavailableError,
  type ListenHandle,
  type SpeechProvider,
} from "./types";

/** Minimaler Ausschnitt der Web Speech API (nicht in allen TS-DOM-Typen enthalten). */
type RecognitionResultList = ArrayLike<{
  isFinal: boolean;
  0: { transcript: string; confidence: number };
}>;
type Recognition = {
  lang: string;
  interimResults: boolean;
  continuous: boolean;
  maxAlternatives: number;
  onresult: ((event: { results: RecognitionResultList }) => void) | null;
  onerror: ((event: { error: string }) => void) | null;
  onend: (() => void) | null;
  start(): void;
  stop(): void;
  abort(): void;
};
type RecognitionConstructor = new () => Recognition;

const ERROR_MESSAGES: Record<string, string> = {
  "not-allowed": "Der Zugriff auf das Mikrofon wurde nicht erlaubt.",
  "service-not-allowed": "Der Zugriff auf das Mikrofon wurde nicht erlaubt.",
  "audio-capture": "Es wurde kein Mikrofon gefunden.",
  network: "Die Spracherkennung braucht eine Internetverbindung.",
  "language-not-supported": "Japanische Spracherkennung wird von diesem Browser nicht unterstützt.",
};

/**
 * Live-Spracherkennung im Browser (Chrome, Edge, Safari). Je nach Browser läuft die
 * Erkennung über einen Dienst des Browserherstellers.
 */
export class BrowserSpeechProvider implements SpeechProvider {
  listen(options: { lang?: string; onInterim?: (text: string) => void } = {}): ListenHandle {
    if (!isBrowserSpeechRecognitionSupported()) {
      return { result: Promise.reject(new SpeechUnavailableError()), stop() {}, abort() {} };
    }
    const w = window as unknown as {
      SpeechRecognition?: RecognitionConstructor;
      webkitSpeechRecognition?: RecognitionConstructor;
    };
    const Ctor = (w.SpeechRecognition ?? w.webkitSpeechRecognition)!;
    const recognition = new Ctor();
    recognition.lang = options.lang ?? "ja-JP";
    recognition.interimResults = true;
    recognition.continuous = false;
    recognition.maxAlternatives = 1;

    let text = "";
    let confidence: number | undefined;
    let aborted = false;

    const result = new Promise<{ text: string; confidence?: number }>((resolve, reject) => {
      recognition.onresult = (event) => {
        let interim = "";
        let final = "";
        for (let i = 0; i < event.results.length; i++) {
          const r = event.results[i];
          if (r.isFinal) {
            final += r[0].transcript;
            confidence = r[0].confidence;
          } else {
            interim += r[0].transcript;
          }
        }
        text = final || interim;
        options.onInterim?.(final + interim);
      };
      recognition.onerror = (event) => {
        if (event.error === "no-speech" || event.error === "aborted") return;
        reject(
          new SpeechUnavailableError(
            ERROR_MESSAGES[event.error] ?? "Die Spracherkennung ist fehlgeschlagen.",
          ),
        );
      };
      recognition.onend = () => {
        if (aborted) reject(new SpeechUnavailableError("Abgebrochen."));
        else resolve({ text: text.trim(), confidence });
      };
    });

    try {
      recognition.start();
    } catch {
      return { result: Promise.reject(new SpeechUnavailableError()), stop() {}, abort() {} };
    }

    return {
      result,
      stop: () => recognition.stop(),
      abort: () => {
        aborted = true;
        recognition.abort();
      },
    };
  }
}
