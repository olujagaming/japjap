import { KANA } from "@/data/kana";
import { CONVERSATIONS } from "@/data/conversations";
import { GRAMMAR } from "@/data/grammar";
import { KANJI } from "@/data/kanji";
import { SENTENCES } from "@/data/sentences";
import { SITUATIONS } from "@/data/situations";
import { VOCABULARY } from "@/data/vocabulary";
import { normalizeRomaji, toHiragana } from "@/lib/japanese/romaji";

/**
 * Globale Suche über alle Lerninhalte. Läuft vollständig im Browser über die
 * statischen Daten (schnell, offline-fähig) und wird beim ersten Tippen nachgeladen.
 *
 * Eingaben: Kanji, Hiragana, Katakana, Romaji, Deutsch, optional Englisch.
 */

export const SEARCH_GROUPS = [
  "kana",
  "vocabulary",
  "kanji",
  "grammar",
  "conversation",
  "situation",
  "sentence",
] as const;
export type SearchGroup = (typeof SEARCH_GROUPS)[number];

export const SEARCH_GROUP_LABELS: Record<SearchGroup, string> = {
  kana: "Kana",
  vocabulary: "Vokabeln",
  kanji: "Kanji",
  grammar: "Grammatik",
  conversation: "Gespräche",
  situation: "Situationen",
  sentence: "Sätze",
};

export type SearchResult = {
  group: SearchGroup;
  id: string;
  href: string;
  /** Japanische Hauptzeile */
  japanese: string;
  reading?: string;
  /** Deutsche Bedeutung / Beschreibung */
  german: string;
  score: number;
};

type Entry = Omit<SearchResult, "score"> & {
  /** Japanische Suchschlüssel (in Hiragana normalisiert) */
  ja: string[];
  /** Romaji-Schlüssel (normalisiert) */
  romaji: string[];
  /** Deutsche und englische Wörter (kleingeschrieben) */
  meanings: string[];
  /** Kleiner Bonus für häufige Inhalte */
  boost: number;
};

const JAPANESE = /[぀-ヿ㐀-鿿々〆ヶ～]/;

const normJa = (text: string) => toHiragana(text).replace(/[。、？！\s～]/g, "");
const normLatin = (text: string) =>
  text.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/ß/g, "ss").trim();

/** Bedeutungen in einzelne Suchbegriffe zerlegen: „Essen, Lebensmittel (z. B.)“ → … */
const meaningTerms = (values: readonly string[]) =>
  values.flatMap((v) => {
    const full = normLatin(v.replace(/\(.*?\)/g, ""));
    return [full, ...full.split(/[\s,/;:–-]+/).filter((t) => t.length > 1)];
  });

let index: Entry[] | null = null;

function buildIndex(): Entry[] {
  const entries: Entry[] = [];

  for (const kana of KANA) {
    entries.push({
      group: "kana",
      id: kana.id,
      href: `/kana/${encodeURIComponent(kana.character)}`,
      japanese: kana.character,
      german: `${kana.scriptType === "hiragana" ? "Hiragana" : "Katakana"} · ${kana.romaji}`,
      ja: [normJa(kana.character)],
      romaji: [kana.romaji, ...kana.alternatives].map(normalizeRomaji),
      meanings: [],
      boost: kana.group === "basic" ? 2 : 0,
    });
  }

  for (const word of VOCABULARY) {
    entries.push({
      group: "vocabulary",
      id: word.id,
      href: `/vocabulary/${word.id}`,
      japanese: word.japanese,
      reading: word.reading !== word.japanese ? word.reading : undefined,
      german: word.german.join(", "),
      ja: [normJa(word.japanese), normJa(word.reading)],
      romaji: [normalizeRomaji(word.romaji)],
      meanings: meaningTerms([...word.german, ...(word.english ?? [])]),
      boost: 4 - word.frequency,
    });
  }

  for (const kanji of KANJI) {
    entries.push({
      group: "kanji",
      id: kanji.id,
      href: `/kanji/${encodeURIComponent(kanji.character)}`,
      japanese: kanji.character,
      reading: [...kanji.onyomi, ...kanji.kunyomi].join("・"),
      german: kanji.meaningsDe.join(", "),
      ja: [kanji.character, ...kanji.onyomi, ...kanji.kunyomi.map((r) => r.replace(".", ""))].map(
        normJa,
      ),
      romaji: [],
      meanings: meaningTerms([...kanji.meaningsDe, ...(kanji.meaningsEn ?? [])]),
      boost: 2,
    });
  }

  for (const point of GRAMMAR) {
    entries.push({
      group: "grammar",
      id: point.id,
      href: `/grammar/${point.slug}`,
      japanese: point.pattern,
      german: point.meaningDe,
      ja: point.pattern.split("/").map(normJa),
      romaji: [normalizeRomaji(point.slug.replace(/-/g, ""))],
      meanings: meaningTerms([point.meaningDe]),
      boost: point.common ? 2 : 1,
    });
  }

  for (const situation of SITUATIONS) {
    entries.push({
      group: "situation",
      id: situation.id,
      href: `/situations/${situation.slug}`,
      japanese: situation.titleJa,
      reading: situation.titleReading !== situation.titleJa ? situation.titleReading : undefined,
      german: situation.titleDe,
      ja: [normJa(situation.titleJa), normJa(situation.titleReading)],
      romaji: [normalizeRomaji(situation.slug)],
      meanings: meaningTerms([situation.titleDe]),
      boost: 3,
    });
  }

  for (const conversation of CONVERSATIONS) {
    entries.push({
      group: "conversation",
      id: conversation.id,
      href: `/conversations/${conversation.id}`,
      japanese: conversation.titleJa,
      german: conversation.titleDe,
      ja: [normJa(conversation.titleJa), normJa(conversation.titleReading)],
      romaji: [],
      meanings: meaningTerms([conversation.titleDe]),
      boost: 1,
    });
  }

  for (const sentence of SENTENCES) {
    entries.push({
      group: "sentence",
      id: sentence.id,
      // Sätze haben keine eigene Seite: Sprung zum ersten enthaltenen Wort bzw. zur Grammatik
      href: sentence.vocabularyIds[0]
        ? `/vocabulary/${sentence.vocabularyIds[0]}`
        : sentence.grammarIds[0]
          ? `/grammar/${GRAMMAR.find((g) => g.id === sentence.grammarIds[0])?.slug}`
          : "/vocabulary",
      japanese: sentence.japanese,
      reading: sentence.reading,
      german: sentence.german,
      ja: [normJa(sentence.japanese), normJa(sentence.reading)],
      romaji: [normalizeRomaji(sentence.romaji)],
      meanings: meaningTerms([sentence.german]),
      boost: 0,
    });
  }

  return entries;
}

function scoreText(haystack: string, needle: string): number {
  if (!needle || !haystack) return 0;
  if (haystack === needle) return 100;
  if (haystack.startsWith(needle)) return 60 - Math.min(20, haystack.length - needle.length);
  if (haystack.includes(needle)) return 25;
  return 0;
}

function scoreEntry(entry: Entry, query: string, isJapanese: boolean): number {
  if (isJapanese) {
    const q = normJa(query);
    return Math.max(...entry.ja.map((key) => scoreText(key, q)));
  }
  const latin = normLatin(query);
  const romaji = normalizeRomaji(query);
  const meaning = Math.max(0, ...entry.meanings.map((m) => scoreText(m, latin)));
  // Romaji: bei Kana nur exakte Treffer, sonst wird „k“ zu laut
  const romajiScore =
    entry.group === "kana"
      ? entry.romaji.includes(romaji)
        ? 90
        : 0
      : Math.max(0, ...entry.romaji.map((r) => scoreText(r, romaji))) *
        (romaji.length >= 2 ? 1 : 0);
  return Math.max(meaning, romajiScore * 0.95);
}

export function search(query: string, options: { limitPerGroup?: number } = {}): SearchResult[] {
  const trimmed = query.trim();
  if (!trimmed) return [];
  index ??= buildIndex();
  const isJapanese = JAPANESE.test(trimmed);
  const limit = options.limitPerGroup ?? 6;

  const scored = index
    .map((entry) => ({ entry, score: scoreEntry(entry, trimmed, isJapanese) }))
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score + b.entry.boost - (a.score + a.entry.boost));

  const perGroup = new Map<SearchGroup, number>();
  const results: SearchResult[] = [];
  for (const { entry, score } of scored) {
    const count = perGroup.get(entry.group) ?? 0;
    if (count >= limit) continue;
    perGroup.set(entry.group, count + 1);
    results.push({
      group: entry.group,
      id: entry.id,
      href: entry.href,
      japanese: entry.japanese,
      reading: entry.reading,
      german: entry.german,
      score: score + entry.boost,
    });
  }
  return results;
}

/** Ergebnisse gruppiert, Gruppen nach bestem Treffer sortiert. */
export function groupResults(
  results: SearchResult[],
): { group: SearchGroup; items: SearchResult[] }[] {
  const groups = new Map<SearchGroup, SearchResult[]>();
  for (const result of results)
    groups.set(result.group, [...(groups.get(result.group) ?? []), result]);
  return [...groups.entries()]
    .map(([group, items]) => ({ group, items }))
    .sort((a, b) => b.items[0].score - a.items[0].score);
}
