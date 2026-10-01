import { KANJI_PATTERN } from "@/lib/utils";

/** Ein Abschnitt japanischen Texts; `reading` nur bei Kanji-Abschnitten. */
export type FuriganaSegment = { text: string; reading?: string };

const BRACKET_NOTATION = /([㐀-䶿一-鿿豈-﫿々〆ヶ]+)\[([^\]]+)\]/g;

/**
 * Parst die kompakte Seed-Notation `寿司[すし]を食[た]べます。`.
 * Die Lesung in eckigen Klammern gilt für die unmittelbar davorstehende Kanji-Folge.
 */
export function parseFurigana(source: string): FuriganaSegment[] {
  const segments: FuriganaSegment[] = [];
  let lastIndex = 0;
  for (const match of source.matchAll(BRACKET_NOTATION)) {
    const index = match.index ?? 0;
    if (index > lastIndex) segments.push({ text: source.slice(lastIndex, index) });
    segments.push({ text: match[1], reading: match[2] });
    lastIndex = index + match[0].length;
  }
  if (lastIndex < source.length) segments.push({ text: source.slice(lastIndex) });
  return segments;
}

/** Entfernt die Lesungen aus der Notation: `食[た]べる` → `食べる`. */
export function stripFurigana(source: string): string {
  return source.replace(BRACKET_NOTATION, "$1");
}

/** Liest nur die Kana-Lesung aus der Notation: `食[た]べる` → `たべる`. */
export function readingFromFurigana(source: string): string {
  return source.replace(BRACKET_NOTATION, "$2");
}

const isKanji = (char: string) => KANJI_PATTERN.test(char);

/**
 * Leitet Segmente aus Wort + Gesamtlesung ab, indem gemeinsame Kana am Anfang
 * und Ende (Okurigana) abgetrennt werden: 食べる/たべる → 食(た) + べる.
 * Fällt bei unklarer Zuordnung auf eine Lesung für den gesamten Kanji-Kern zurück.
 */
export function segmentsFromReading(japanese: string, reading?: string): FuriganaSegment[] {
  if (!reading || !KANJI_PATTERN.test(japanese) || japanese === reading) {
    return [{ text: japanese }];
  }
  let prefix = 0;
  while (
    prefix < japanese.length &&
    prefix < reading.length &&
    japanese[prefix] === reading[prefix] &&
    !isKanji(japanese[prefix])
  ) {
    prefix++;
  }
  let suffix = 0;
  while (
    suffix < japanese.length - prefix &&
    suffix < reading.length - prefix &&
    japanese[japanese.length - 1 - suffix] === reading[reading.length - 1 - suffix] &&
    !isKanji(japanese[japanese.length - 1 - suffix])
  ) {
    suffix++;
  }

  const core = japanese.slice(prefix, japanese.length - suffix);
  const coreReading = reading.slice(prefix, reading.length - suffix);
  const segments: FuriganaSegment[] = [];
  if (prefix > 0) segments.push({ text: japanese.slice(0, prefix) });
  segments.push(coreReading ? { text: core, reading: coreReading } : { text: core });
  if (suffix > 0) segments.push({ text: japanese.slice(japanese.length - suffix) });
  return segments;
}

/** Normalisiert die verschiedenen Eingabeformen zu Segmenten. */
export function toSegments(
  japanese: string,
  furigana?: FuriganaSegment[] | string,
  reading?: string,
): FuriganaSegment[] {
  if (Array.isArray(furigana)) return furigana;
  if (typeof furigana === "string") return parseFurigana(furigana);
  return segmentsFromReading(japanese, reading);
}
