import { CONFUSION_SETS } from "@/data/kana";
import { getKanaExamples, type KanaExample } from "@/data/kana-examples";
import { isDifficult, isDue } from "@/lib/learning/progress";
import { toHiragana, toRomaji, type AnswerVerdict } from "@/lib/japanese/romaji";
import type { ReviewRating } from "@/lib/srs/types";
import type { ProgressRecord } from "@/lib/store/types";
import type { Kana } from "@/types/content";

export const PRACTICE_MODES = [
  "recognition",
  "reverse",
  "listening",
  "reading",
  "confusion",
  "mixed",
] as const;
export type PracticeMode = (typeof PRACTICE_MODES)[number];

export const PRACTICE_MODE_META: Record<PracticeMode, { label: string; description: string }> = {
  recognition: { label: "Erkennen", description: "Zeichen sehen, Lesung eintippen." },
  reverse: { label: "Abrufen", description: "Lesung sehen, passendes Zeichen wählen." },
  listening: { label: "Hören", description: "Laut hören, Zeichen erkennen." },
  reading: { label: "Lesen", description: "Ganze Wörter lesen und in Romaji eingeben." },
  confusion: { label: "Verwechslungen", description: "Ähnliche Zeichen gezielt unterscheiden." },
  mixed: { label: "Gemischt", description: "Adaptive Mischung – Schwieriges kommt öfter." },
};

export type Question =
  | { kind: "type-romaji"; kana: Kana; taskType: "kana-recognition" }
  | {
      kind: "choose-kana";
      kana: Kana;
      options: Kana[];
      prompt: "romaji" | "audio";
      taskType: "kana-reverse" | "kana-listening";
    }
  | {
      kind: "read-word";
      kana: Kana;
      word: KanaExample;
      accepted: string[];
      taskType: "kana-reading";
    }
  | { kind: "confusion"; kana: Kana; options: Kana[]; tipDe: string; taskType: "kana-confusion" };

export type Random = () => number;

export function shuffle<T>(items: readonly T[], random: Random = Math.random): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

/** Gewicht eines Zeichens für die adaptive Auswahl: Schwieriges und Fälliges öfter. */
export function selectionWeight(record: ProgressRecord | undefined, now: Date): number {
  if (!record) return 3;
  if (isDifficult(record)) return 5;
  if (isDue(record, now)) return 4;
  switch (record.status) {
    case "unseen":
    case "familiar":
    case "learning":
      return 3;
    case "known":
      return 1;
    case "mastered":
      return 0.4;
  }
}

/** Gewichtete Auswahl ohne Zurücklegen; bei kleinem Pool wird aufgefüllt. */
export function pickWeighted<T>(
  items: readonly T[],
  weight: (item: T) => number,
  count: number,
  random: Random,
): T[] {
  const result: T[] = [];
  let pool = [...items];
  while (result.length < count && items.length > 0) {
    if (pool.length === 0) pool = [...items];
    const total = pool.reduce((sum, item) => sum + weight(item), 0);
    let threshold = random() * total;
    let index = pool.findIndex((item) => (threshold -= weight(item)) <= 0);
    if (index < 0) index = pool.length - 1;
    const [picked] = pool.splice(index, 1);
    // Direkte Wiederholung desselben Zeichens vermeiden
    if (result.length > 0 && result[result.length - 1] === picked && pool.length > 0) {
      pool.push(picked);
      continue;
    }
    result.push(picked);
  }
  return result;
}

/**
 * Ablenker für Auswahlfragen: zuerst verwechselbare Zeichen, dann gleiche Reihe/Spalte,
 * dann zufällige Zeichen derselben Schrift. Keine doppelten Lesungen.
 */
export function chooseDistractors(
  target: Kana,
  candidates: readonly Kana[],
  count: number,
  random: Random,
): Kana[] {
  const sameScript = candidates.filter(
    (k) =>
      k.scriptType === target.scriptType &&
      k.character !== target.character &&
      k.romaji !== target.romaji,
  );
  const confusable = new Set(
    CONFUSION_SETS.filter((s) => s.characters.includes(target.character)).flatMap(
      (s) => s.characters,
    ),
  );
  const tiers = [
    sameScript.filter((k) => confusable.has(k.character)),
    shuffle(
      sameScript.filter(
        (k) => k.group === target.group && (k.row === target.row || k.column === target.column),
      ),
      random,
    ),
    shuffle(sameScript, random),
  ];
  const chosen: Kana[] = [];
  const romaji = new Set([target.romaji]);
  for (const tier of tiers) {
    for (const kana of tier) {
      if (chosen.length >= count) break;
      if (romaji.has(kana.romaji)) continue;
      romaji.add(kana.romaji);
      chosen.push(kana);
    }
  }
  return chosen;
}

/** Hiragana-Zeichen, die für die Lesbarkeit eines Wortes egal sind. */
const NEUTRAL = new Set(["ー", "っ", "ゃ", "ゅ", "ょ", "ぁ", "ぃ", "ぅ", "ぇ", "ぉ", " "]);

/**
 * Wählt ein Lesewort für ein Zeichen. Bevorzugt Wörter, deren übrige Zeichen
 * der Lernende bereits kennt oder gerade übt.
 */
export function pickReadingWord(
  kana: Kana,
  readable: ReadonlySet<string>,
  random: Random,
): KanaExample | null {
  const examples = getKanaExamples(kana.character);
  if (examples.length === 0) return null;
  const readableHira = new Set([...readable].map(toHiragana));
  const isReadable = (word: KanaExample) =>
    [...toHiragana(word.reading)].every((c) => NEUTRAL.has(c) || readableHira.has(c));
  const preferred = examples.filter(isReadable);
  const pool = preferred.length > 0 ? preferred : examples;
  return pool[Math.floor(random() * pool.length)];
}

export type SessionOptions = {
  pool: readonly Kana[];
  /** Für Ablenker – meist alle Kana. */
  allKana: readonly Kana[];
  mode: PracticeMode;
  length: number;
  progress: ReadonlyMap<string, ProgressRecord>;
  /** Zeichen, die der Lernende lesen kann (für Lesewörter). */
  readable: ReadonlySet<string>;
  now?: Date;
  random?: Random;
};

const SINGLE_MODES = ["recognition", "reverse", "listening", "reading"] as const;

export function buildSession(options: SessionOptions): Question[] {
  const { allKana, mode, length, progress, readable } = options;
  const random = options.random ?? Math.random;
  const now = options.now ?? new Date();
  let pool = [...options.pool];

  if (mode === "confusion") {
    const confusable = new Set(CONFUSION_SETS.flatMap((s) => s.characters));
    const inPool = pool.filter((k) => confusable.has(k.character));
    pool =
      inPool.length > 0
        ? inPool
        : allKana.filter(
            (k) => confusable.has(k.character) && pool.some((p) => p.scriptType === k.scriptType),
          );
  }
  if (pool.length === 0) return [];

  const weight = (k: Kana) => selectionWeight(progress.get(k.id), now);
  const picked = pickWeighted(pool, weight, length, random);
  const readableWithPool = new Set([...readable, ...pool.map((k) => k.character)]);

  return picked.map((kana): Question => {
    const effective =
      mode === "mixed" ? SINGLE_MODES[Math.floor(random() * SINGLE_MODES.length)] : mode;
    switch (effective) {
      case "recognition":
        return { kind: "type-romaji", kana, taskType: "kana-recognition" };
      case "reverse":
      case "listening":
        return {
          kind: "choose-kana",
          kana,
          prompt: effective === "reverse" ? "romaji" : "audio",
          options: shuffle([kana, ...chooseDistractors(kana, allKana, 5, random)], random),
          taskType: effective === "reverse" ? "kana-reverse" : "kana-listening",
        };
      case "reading": {
        const word = pickReadingWord(kana, readableWithPool, random);
        if (!word) return { kind: "type-romaji", kana, taskType: "kana-recognition" };
        return {
          kind: "read-word",
          kana,
          word,
          accepted: [word.romaji, toRomaji(word.reading)],
          taskType: "kana-reading",
        };
      }
      case "confusion": {
        const set = CONFUSION_SETS.find((s) => s.characters.includes(kana.character))!;
        const options = set.characters
          .map((c) => allKana.find((k) => k.character === c))
          .filter((k): k is Kana => Boolean(k));
        return {
          kind: "confusion",
          kana,
          options: shuffle(options, random),
          tipDe: set.tipDe,
          taskType: "kana-confusion",
        };
      }
    }
  });
}

/** Antwortqualität → SRS-Bewertung. „Fast richtig“ zählt als „schwer“, nicht als Fehler. */
export function verdictToRating(verdict: AnswerVerdict): ReviewRating {
  return verdict === "correct" ? "good" : verdict === "almost" ? "hard" : "again";
}

export function acceptedRomaji(kana: Kana): string[] {
  return [kana.romaji, ...kana.alternatives];
}
