import { toHiragana } from "@/lib/japanese/romaji";
import { levenshtein } from "@/lib/review/answers";
import type { PronunciationAssessment, PronunciationVerdict } from "./types";

const strip = (text: string) => toHiragana(text).replace(/[。、？！?!.,\s「」・ー〜～]/g, "");

function similarity(a: string, b: string): number {
  if (!a || !b) return 0;
  return 1 - levenshtein(a, b) / Math.max(a.length, b.length);
}

const FEEDBACK: Record<PronunciationVerdict, string> = {
  clear: "Sehr gut – die Spracherkennung hat dich genau verstanden.",
  good: "Gut verständlich. Kleine Abweichungen – hör dir das Original noch einmal an.",
  partial: "Teilweise erkannt. Sprich langsamer und achte auf die einzelnen Silben.",
  unclear:
    "Nicht erkannt. Hör dir das Original an und versuche es noch einmal – ruhig etwas lauter.",
};

/**
 * Einfache Aussprache-Rückmeldung: Wie gut stimmt das, was die Spracherkennung verstanden hat,
 * mit dem Zieltext überein? Das ist ein Verständlichkeits-Signal, keine phonetische Analyse.
 */
export function assessPronunciation(
  recognized: string,
  expected: { japanese: string; reading: string },
): PronunciationAssessment {
  const heard = strip(recognized);
  const score = Math.round(
    100 *
      Math.max(
        similarity(heard, strip(expected.japanese)),
        similarity(heard, strip(expected.reading)),
      ),
  );
  const verdict: PronunciationVerdict =
    score >= 90 ? "clear" : score >= 70 ? "good" : score >= 40 ? "partial" : "unclear";
  return { score, verdict, feedbackDe: FEEDBACK[verdict], recognized };
}
