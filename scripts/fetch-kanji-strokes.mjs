/**
 * Lädt Strichreihenfolge-Daten für alle Kanji aus data/kanji.ts aus KanjiVG
 * (CC BY-SA 3.0, https://kanjivg.tagaini.net) nach data/stroke-order/kanji.json.
 *
 * Aufruf: node scripts/fetch-kanji-strokes.mjs
 */
import { readFile, writeFile } from "node:fs/promises";

const BASE = "https://raw.githubusercontent.com/KanjiVG/kanjivg/master/kanji/";
const source = await readFile(new URL("../data/kanji.ts", import.meta.url), "utf8");
const characters = [...source.matchAll(/character: "(.)"/g)].map((m) => m[1]);

const result = {};
for (const character of characters) {
  const file = character.codePointAt(0).toString(16).padStart(5, "0") + ".svg";
  const response = await fetch(BASE + file);
  if (!response.ok) {
    console.warn(`Keine Daten für ${character}`);
    continue;
  }
  const svg = await response.text();
  result[character] = [...svg.matchAll(/<path[^>]*\sd="([^"]+)"/g)].map((m) => m[1]);
}

await writeFile(
  new URL("../data/stroke-order/kanji.json", import.meta.url),
  JSON.stringify({
    source: "KanjiVG (https://kanjivg.tagaini.net)",
    license: "CC BY-SA 3.0 – Copyright (C) Ulrich Apel",
    viewBox: "0 0 109 109",
    strokes: result,
  }) + "\n",
);
console.log(`${Object.keys(result).length} Kanji gespeichert.`);
