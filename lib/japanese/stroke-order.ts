import kanaStrokes from "@/data/stroke-order/kana.json";
import kanjiStrokes from "@/data/stroke-order/kanji.json";

export type GlyphStrokes = { character: string; paths: string[] };

const STROKES = {
  ...(kanaStrokes.strokes as Record<string, string[]>),
  ...(kanjiStrokes.strokes as Record<string, string[]>),
};

/**
 * Strichdaten (KanjiVG) je Zeichen – Kana und Kanji. Nur auf dem Server verwenden. Kombinationen wie きゃ liefern zwei Glyphen.
 * Fehlen Daten für ein Zeichen, ist das Ergebnis leer – die UI zeigt dann einen Hinweis.
 */
export function getStrokeOrder(text: string): GlyphStrokes[] {
  const glyphs = [...text].map((character) => ({ character, paths: STROKES[character] ?? [] }));
  return glyphs.every((g) => g.paths.length > 0) ? glyphs : [];
}

export const STROKE_ORDER_ATTRIBUTION = {
  label: "Strichdaten: KanjiVG",
  href: "https://kanjivg.tagaini.net",
  license: "CC BY-SA 3.0",
};
