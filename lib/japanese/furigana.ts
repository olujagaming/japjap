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

const toHira = (text: string) =>
  text.replace(/[\u30A1-\u30F6]/g, (c) => String.fromCharCode(c.charCodeAt(0) - 0x60));

const escapeRegExp = (text: string) => text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/**
 * Ordnet Lesungen über Kana-Anker zu: Jede Kanji-Folge wird zu einer Gruppe, alle Kana
 * dazwischen müssen in der Lesung wörtlich vorkommen. ご注文はお決まり → 注文(ちゅうもん), 決(き).
 */
function alignByKanaAnchors(japanese: string, reading: string): FuriganaSegment[] | null {
  const runs = japanese.match(
    /[\u3400-\u4DBF\u4E00-\u9FFF\uF900-\uFAFF々〆ヶ]+|[^\u3400-\u4DBF\u4E00-\u9FFF\uF900-\uFAFF々〆ヶ]+/g,
  );
  if (!runs) return null;
  const pattern = runs
    .map((run) => (KANJI_PATTERN.test(run[0]) ? "(.+?)" : escapeRegExp(toHira(run))))
    .join("");
  const match = new RegExp(`^${pattern}$`, "u").exec(toHira(reading));
  if (!match) return null;
  let group = 1;
  return runs.map((run) =>
    KANJI_PATTERN.test(run[0]) ? { text: run, reading: match[group++] } : { text: run },
  );
}

/**
 * Leitet Segmente aus Wort + Gesamtlesung ab. Zuerst über Kana-Anker im ganzen Text
 * (食べ物/たべもの → 食(た) べ 物(もの)), sonst durch Abtrennen gemeinsamer Kana am Anfang
 * und Ende; bei unklarer Zuordnung eine Lesung für den gesamten Kanji-Kern.
 */
export function segmentsFromReading(japanese: string, reading?: string): FuriganaSegment[] {
  if (!reading || !KANJI_PATTERN.test(japanese) || japanese === reading) {
    return [{ text: japanese }];
  }
  const aligned = alignByKanaAnchors(japanese, reading);
  if (aligned) return aligned;
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
