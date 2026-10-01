import { checkRomajiAnswer, toHiragana, toRomaji } from "@/lib/japanese/romaji";
import type { ConversationLine } from "@/types/content";

export type RoleplayVerdict = "match" | "close" | "different";

const JAPANESE = /[぀-ヿ㐀-鿿]/;
const strip = (text: string) => text.replace(/[。、？！?!.,\s「」]/g, "");

/**
 * Vergleicht eine eigene Antwort mit der Musterzeile. Erkennt Japanisch (Kana/Kanji)
 * und Romaji. „different“ heißt nicht falsch – es gibt oft mehrere passende Antworten;
 * dann bewertet der Nutzer selbst.
 */
export function evaluateRoleplayAnswer(
  input: string,
  line: Pick<ConversationLine, "japanese" | "reading" | "romaji">,
): RoleplayVerdict {
  const answer = input.trim();
  if (!answer) return "different";

  if (JAPANESE.test(answer)) {
    const normalized = strip(toHiragana(answer));
    if (normalized === strip(toHiragana(line.reading)) || strip(answer) === strip(line.japanese))
      return "match";
    // Kana-Antwort über die Umschrift vergleichen (toleriert z. B. fehlende Längen)
    if (!/[㐀-鿿]/.test(answer)) {
      const verdict = checkRomajiAnswer(toRomaji(normalized), [
        line.romaji,
        toRomaji(line.reading),
      ]);
      if (verdict === "almost") return "close";
    }
    return "different";
  }

  const verdict = checkRomajiAnswer(answer, [line.romaji, toRomaji(line.reading)]);
  return verdict === "correct" ? "match" : verdict === "almost" ? "close" : "different";
}
