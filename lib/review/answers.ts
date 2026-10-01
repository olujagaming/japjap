import { checkRomajiAnswer, toHiragana, type AnswerVerdict } from "@/lib/japanese/romaji";

/**
 * Antwortprüfung für Reviews. Nicht binär: Kleine Abweichungen (Tippfehler,
 * Teilbedeutung, Vokallänge) gelten als „fast richtig“.
 */

const UMLAUTS: Record<string, string> = { ä: "ae", ö: "oe", ü: "ue", ß: "ss" };

export function normalizeGerman(text: string): string {
  return text
    .toLowerCase()
    .replace(/\(.*?\)/g, " ")
    .replace(/[äöüß]/g, (c) => UMLAUTS[c])
    .replace(/[.,!?;:„“"'»«…–-]/g, " ")
    .replace(/\b(der|die|das|ein|eine|einen|sich|zu|etwas)\b/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/** Zerlegt Bedeutungen in einzelne akzeptierte Varianten: „Lehrer, Lehrerin“ → zwei. */
export function meaningVariants(meanings: readonly string[]): string[] {
  const variants = meanings
    .flatMap((m) => m.split(/[,;/]/))
    .map(normalizeGerman)
    .filter(Boolean);
  return [...new Set(variants)];
}

export function levenshtein(a: string, b: string): number {
  if (a === b) return 0;
  const row = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i++) {
    let previous = row[0];
    row[0] = i;
    for (let j = 1; j <= b.length; j++) {
      const current = row[j];
      row[j] = Math.min(row[j] + 1, row[j - 1] + 1, previous + (a[i - 1] === b[j - 1] ? 0 : 1));
      previous = current;
    }
  }
  return row[b.length];
}

export function checkGermanAnswer(input: string, meanings: readonly string[]): AnswerVerdict {
  const answer = normalizeGerman(input);
  if (!answer) return "incorrect";
  const variants = meaningVariants(meanings);
  if (variants.includes(answer)) return "correct";
  for (const variant of variants) {
    const tolerance = variant.length >= 6 ? 2 : variant.length >= 4 ? 1 : 0;
    if (tolerance > 0 && levenshtein(answer, variant) <= tolerance) return "almost";
    const words = variant.split(" ");
    if (answer.length >= 4 && (words.includes(answer) || answer.split(" ").includes(variant)))
      return "almost";
  }
  return "incorrect";
}

const JAPANESE = /[぀-ヿ㐀-鿿]/;
const stripJa = (text: string) => toHiragana(text).replace(/[。、？！?!.,\s～〜]/g, "");

/** Japanische Eingabe (Kana/Kanji) oder Romaji gegen ein Wort bzw. eine Antwortliste prüfen. */
export function checkJapaneseAnswer(
  input: string,
  target: { japanese: string[]; romaji: string[] },
): AnswerVerdict {
  const answer = input.trim();
  if (!answer) return "incorrect";
  if (JAPANESE.test(answer)) {
    const normalized = stripJa(answer);
    if (target.japanese.some((j) => stripJa(j) === normalized)) return "correct";
    return "incorrect";
  }
  return checkRomajiAnswer(answer, target.romaji);
}
