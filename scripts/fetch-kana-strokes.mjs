/**
 * Lädt Strichreihenfolge-Daten für alle Kana aus KanjiVG (CC BY-SA 3.0,
 * https://kanjivg.tagaini.net) und speichert sie als data/stroke-order/kana.json.
 *
 * Aufruf: node scripts/fetch-kana-strokes.mjs
 */
import { writeFile } from "node:fs/promises";

const BASE = "https://raw.githubusercontent.com/KanjiVG/kanjivg/master/kanji/";
const ranges = [
  [0x3041, 0x3094], // Hiragana inkl. kleiner Zeichen
  [0x30a1, 0x30f4], // Katakana inkl. ヴ
];

const codes = ranges.flatMap(([from, to]) =>
  Array.from({ length: to - from + 1 }, (_, i) => from + i),
);
const result = {};

for (const code of codes) {
  const file = code.toString(16).padStart(5, "0") + ".svg";
  const response = await fetch(BASE + file);
  if (!response.ok) continue;
  const svg = await response.text();
  const paths = [...svg.matchAll(/<path[^>]*\sd="([^"]+)"/g)].map((m) => m[1]);
  if (paths.length) result[String.fromCodePoint(code)] = paths;
}

const header = {
  source: "KanjiVG (https://kanjivg.tagaini.net)",
  license: "CC BY-SA 3.0 – Copyright (C) Ulrich Apel",
  viewBox: "0 0 109 109",
};
await writeFile(
  new URL("../data/stroke-order/kana.json", import.meta.url),
  JSON.stringify({ ...header, strokes: result }) + "\n",
);
console.log(`${Object.keys(result).length} Zeichen gespeichert.`);
