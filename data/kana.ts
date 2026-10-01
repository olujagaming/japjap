import type { Kana, KanaGroup, ScriptType } from "@/types/content";

/**
 * Vollständige Hiragana- und Katakana-Daten: Grundzeichen, Dakuten, Handakuten,
 * Yōon (Kombinationen mit kleinem ゃゅょ) und erweiterte Katakana für Lehnwörter.
 * Die Einträge werden aus kompakten Tabellen erzeugt, damit Beziehungen
 * (Varianten, Gegenstücke, Kombinationen) konsistent bleiben.
 */

/** [Hiragana, Katakana, Romaji, Schlüssel für die ID?, alternative Eingaben?] */
type Cell = readonly [string, string, string, string?, string[]?];
type TableRow = { row: string; cells: (Cell | null)[] };

const BASIC: TableRow[] = [
  {
    row: "vowel",
    cells: [
      ["あ", "ア", "a"],
      ["い", "イ", "i"],
      ["う", "ウ", "u"],
      ["え", "エ", "e"],
      ["お", "オ", "o"],
    ],
  },
  {
    row: "k",
    cells: [
      ["か", "カ", "ka"],
      ["き", "キ", "ki"],
      ["く", "ク", "ku"],
      ["け", "ケ", "ke"],
      ["こ", "コ", "ko"],
    ],
  },
  {
    row: "s",
    cells: [
      ["さ", "サ", "sa"],
      ["し", "シ", "shi", undefined, ["si"]],
      ["す", "ス", "su"],
      ["せ", "セ", "se"],
      ["そ", "ソ", "so"],
    ],
  },
  {
    row: "t",
    cells: [
      ["た", "タ", "ta"],
      ["ち", "チ", "chi", undefined, ["ti"]],
      ["つ", "ツ", "tsu", undefined, ["tu"]],
      ["て", "テ", "te"],
      ["と", "ト", "to"],
    ],
  },
  {
    row: "n",
    cells: [
      ["な", "ナ", "na"],
      ["に", "ニ", "ni"],
      ["ぬ", "ヌ", "nu"],
      ["ね", "ネ", "ne"],
      ["の", "ノ", "no"],
    ],
  },
  {
    row: "h",
    cells: [
      ["は", "ハ", "ha"],
      ["ひ", "ヒ", "hi"],
      ["ふ", "フ", "fu", undefined, ["hu"]],
      ["へ", "ヘ", "he"],
      ["ほ", "ホ", "ho"],
    ],
  },
  {
    row: "m",
    cells: [
      ["ま", "マ", "ma"],
      ["み", "ミ", "mi"],
      ["む", "ム", "mu"],
      ["め", "メ", "me"],
      ["も", "モ", "mo"],
    ],
  },
  { row: "y", cells: [["や", "ヤ", "ya"], null, ["ゆ", "ユ", "yu"], null, ["よ", "ヨ", "yo"]] },
  {
    row: "r",
    cells: [
      ["ら", "ラ", "ra"],
      ["り", "リ", "ri"],
      ["る", "ル", "ru"],
      ["れ", "レ", "re"],
      ["ろ", "ロ", "ro"],
    ],
  },
  { row: "w", cells: [["わ", "ワ", "wa"], null, null, null, ["を", "ヲ", "wo", "wo", ["o"]]] },
  { row: "nn", cells: [["ん", "ン", "n", "n", ["nn", "n'"]], null, null, null, null] },
];

const DAKUTEN: TableRow[] = [
  {
    row: "g",
    cells: [
      ["が", "ガ", "ga"],
      ["ぎ", "ギ", "gi"],
      ["ぐ", "グ", "gu"],
      ["げ", "ゲ", "ge"],
      ["ご", "ゴ", "go"],
    ],
  },
  {
    row: "z",
    cells: [
      ["ざ", "ザ", "za"],
      ["じ", "ジ", "ji", undefined, ["zi"]],
      ["ず", "ズ", "zu"],
      ["ぜ", "ゼ", "ze"],
      ["ぞ", "ゾ", "zo"],
    ],
  },
  {
    row: "d",
    cells: [
      ["だ", "ダ", "da"],
      ["ぢ", "ヂ", "ji", "dji", ["di"]],
      ["づ", "ヅ", "zu", "dzu", ["du"]],
      ["で", "デ", "de"],
      ["ど", "ド", "do"],
    ],
  },
  {
    row: "b",
    cells: [
      ["ば", "バ", "ba"],
      ["び", "ビ", "bi"],
      ["ぶ", "ブ", "bu"],
      ["べ", "ベ", "be"],
      ["ぼ", "ボ", "bo"],
    ],
  },
];

const HANDAKUTEN: TableRow[] = [
  {
    row: "p",
    cells: [
      ["ぱ", "パ", "pa"],
      ["ぴ", "ピ", "pi"],
      ["ぷ", "プ", "pu"],
      ["ぺ", "ペ", "pe"],
      ["ぽ", "ポ", "po"],
    ],
  },
];

/** Yōon: Grundzeichen der i-Spalte + kleines ゃ/ゅ/ょ. [Hiragana-Basis, Katakana-Basis, Konsonant(en), alternative Präfixe] */
const YOON_BASES: readonly [string, string, string, string[]][] = [
  ["き", "キ", "ky", []],
  ["し", "シ", "sh", ["sy"]],
  ["ち", "チ", "ch", ["ty", "cy"]],
  ["に", "ニ", "ny", []],
  ["ひ", "ヒ", "hy", []],
  ["み", "ミ", "my", []],
  ["り", "リ", "ry", []],
  ["ぎ", "ギ", "gy", []],
  ["じ", "ジ", "j", ["zy", "jy"]],
  ["び", "ビ", "by", []],
  ["ぴ", "ピ", "py", []],
];

const YOON_SMALL = [
  ["ゃ", "ャ", "a"],
  ["ゅ", "ュ", "u"],
  ["ょ", "ョ", "o"],
] as const;

/** Erweiterte Katakana für Lehnwörter: [Zeichen, Romaji, Grundzeichen] */
const EXTENDED: readonly [string, string, string][] = [
  ["ファ", "fa", "フ"],
  ["フィ", "fi", "フ"],
  ["フェ", "fe", "フ"],
  ["フォ", "fo", "フ"],
  ["ティ", "ti", "テ"],
  ["ディ", "di", "デ"],
  ["トゥ", "tu", "ト"],
  ["デュ", "dyu", "デ"],
  ["ウィ", "wi", "ウ"],
  ["ウェ", "we", "ウ"],
  ["ウォ", "wo", "ウ"],
  ["シェ", "she", "シ"],
  ["ジェ", "je", "ジ"],
  ["チェ", "che", "チ"],
  ["ヴ", "vu", "ウ"],
];

const STROKE_COUNTS: Record<string, number> = {
  あ: 3,
  い: 2,
  う: 2,
  え: 2,
  お: 3,
  か: 3,
  き: 4,
  く: 1,
  け: 3,
  こ: 2,
  さ: 3,
  し: 1,
  す: 2,
  せ: 3,
  そ: 1,
  た: 4,
  ち: 2,
  つ: 1,
  て: 1,
  と: 2,
  な: 4,
  に: 3,
  ぬ: 2,
  ね: 2,
  の: 1,
  は: 3,
  ひ: 1,
  ふ: 4,
  へ: 1,
  ほ: 4,
  ま: 3,
  み: 2,
  む: 3,
  め: 2,
  も: 3,
  や: 3,
  ゆ: 2,
  よ: 2,
  ら: 2,
  り: 2,
  る: 1,
  れ: 2,
  ろ: 1,
  わ: 2,
  を: 3,
  ん: 1,
  ア: 2,
  イ: 2,
  ウ: 3,
  エ: 3,
  オ: 3,
  カ: 2,
  キ: 3,
  ク: 2,
  ケ: 3,
  コ: 2,
  サ: 3,
  シ: 3,
  ス: 2,
  セ: 2,
  ソ: 2,
  タ: 3,
  チ: 3,
  ツ: 3,
  テ: 3,
  ト: 2,
  ナ: 2,
  ニ: 2,
  ヌ: 2,
  ネ: 4,
  ノ: 1,
  ハ: 2,
  ヒ: 2,
  フ: 1,
  ヘ: 1,
  ホ: 4,
  マ: 2,
  ミ: 3,
  ム: 2,
  メ: 2,
  モ: 3,
  ヤ: 2,
  ユ: 2,
  ヨ: 3,
  ラ: 2,
  リ: 2,
  ル: 2,
  レ: 1,
  ロ: 3,
  ワ: 2,
  ヲ: 3,
  ン: 2,
};

/** Aussprachehinweise für deutschsprachige Lernende (beide Schriften). */
const PRONUNCIATION: Record<string, string> = {
  a: "Offenes „a“ wie in „Vater“, aber kurz.",
  u: "Ungerundetes „u“ – die Lippen bleiben locker. Nach stimmlosen Konsonanten oft kaum hörbar (です ≈ „dess“).",
  e: "Wie das „e“ in „Bett“.",
  sa: "Stimmloses „s“ wie in „Bus“ – nicht wie das weiche „s“ in „Sonne“.",
  shi: "Wie „schi“, etwas weicher als im Deutschen.",
  su: "Stimmloses „s“; das „u“ ist oft kaum zu hören.",
  se: "Stimmloses „s“ wie in „Bus“.",
  so: "Stimmloses „s“ wie in „Bus“.",
  chi: "Wie „tschi“ in „Tschüss“.",
  tsu: "Wie „z“ im deutschen „Zug“ + „u“.",
  hi: "Das „h“ klingt fast wie das „ch“ in „ich“.",
  fu: "Zwischen „fu“ und „hu“: Die Lippen berühren sich nicht, die Luft strömt sanft zwischen ihnen hindurch.",
  ya: "Wie „ja“ – das romaji „y“ entspricht dem deutschen „j“.",
  yu: "Wie „ju“ in „Jugend“.",
  yo: "Wie „jo“ in „Joghurt“.",
  ra: "Japanisches „r“: ein kurzer Schlag der Zungenspitze, zwischen „r“, „l“ und „d“.",
  ri: "Japanisches „r“: ein kurzer Schlag der Zungenspitze.",
  ru: "Japanisches „r“: ein kurzer Schlag der Zungenspitze.",
  re: "Japanisches „r“: ein kurzer Schlag der Zungenspitze.",
  ro: "Japanisches „r“: ein kurzer Schlag der Zungenspitze.",
  wa: "Wie englisches „wa“ in „water“, mit ungerundeten Lippen.",
  wo: "Wird wie „o“ gesprochen und fast nur als Partikel (Objektmarker) verwendet.",
  n: "Silbischer Nasal – klingt je nach folgendem Laut wie „n“, „m“ oder „ng“ und bildet eine eigene Silbe.",
  za: "Stimmhaftes „s“ wie in „Sonne“, oft mit leichtem „d“ davor.",
  ji: "Wie „dschi“ in „Dschungel“.",
  zu: "Stimmhaftes „s“ wie in „Sonne“ + „u“, oft wie „dsu“.",
  ze: "Stimmhaftes „s“ wie in „Sonne“.",
  zo: "Stimmhaftes „s“ wie in „Sonne“.",
  ja: "Wie „dscha“.",
  ju: "Wie „dschu“.",
  jo: "Wie „dscho“.",
  sha: "Wie „scha“.",
  shu: "Wie „schu“.",
  sho: "Wie „scho“ in „Schokolade“.",
  cha: "Wie „tscha“.",
  chu: "Wie „tschu“.",
  cho: "Wie „tscho“.",
  vu: "Nähert das „v“ aus Fremdwörtern an; wird oft wie „bu“ gesprochen.",
};

const SPECIAL_NOTES: Record<string, string> = {
  は: "Als Partikel (Themenmarker) wird は „wa“ gelesen.",
  へ: "Als Partikel (Richtung) wird へ „e“ gelesen.",
  ぢ: "Klingt wie じ. Kommt nur in wenigen Wörtern vor, z. B. 鼻血（はなぢ）.",
  づ: "Klingt wie ず. Kommt nur in wenigen Wörtern vor, z. B. 続く（つづく）.",
  ヂ: "Klingt wie ジ und wird in modernen Lehnwörtern praktisch nicht verwendet.",
  ヅ: "Klingt wie ズ und wird in modernen Lehnwörtern praktisch nicht verwendet.",
  ヲ: "Wird in der modernen Sprache praktisch nie verwendet; der Partikel wird mit を geschrieben.",
};

const scriptPrefix = (script: ScriptType) => (script === "hiragana" ? "h" : "k");

const all: Kana[] = [];

function push(
  script: ScriptType,
  group: KanaGroup,
  row: string,
  column: number,
  character: string,
  counterpart: string | undefined,
  romaji: string,
  key: string,
  alternatives: string[],
  baseCharacter?: string,
) {
  const pronunciation = [PRONUNCIATION[romaji], SPECIAL_NOTES[character]].filter(Boolean).join(" ");
  all.push({
    id: `${scriptPrefix(script)}-${group === "extended" ? "ext-" : ""}${key}`,
    character,
    scriptType: script,
    romaji,
    alternatives,
    pronunciation: pronunciation || undefined,
    row,
    column,
    group,
    strokeCount: STROKE_COUNTS[character],
    baseCharacter,
    counterpart,
    relatedCharacters: [],
  });
}

function addTable(rows: TableRow[], group: KanaGroup) {
  for (const { row, cells } of rows) {
    cells.forEach((cell, column) => {
      if (!cell) return;
      const [hira, kata, romaji, key = romaji, alternatives = []] = cell;
      push("hiragana", group, row, column, hira, kata, romaji, key, alternatives);
      push("katakana", group, row, column, kata, hira, romaji, key, alternatives);
    });
  }
}

addTable(BASIC, "basic");
addTable(DAKUTEN, "dakuten");
addTable(HANDAKUTEN, "handakuten");

for (const [hiraBase, kataBase, consonant, altPrefixes] of YOON_BASES) {
  YOON_SMALL.forEach(([hiraSmall, kataSmall, vowel], column) => {
    const romaji = consonant + vowel;
    const alternatives = altPrefixes.map((prefix) => prefix + vowel);
    const row = consonant;
    push(
      "hiragana",
      "yoon",
      row,
      column,
      hiraBase + hiraSmall,
      kataBase + kataSmall,
      romaji,
      romaji,
      alternatives,
      hiraBase,
    );
    push(
      "katakana",
      "yoon",
      row,
      column,
      kataBase + kataSmall,
      hiraBase + hiraSmall,
      romaji,
      romaji,
      alternatives,
      kataBase,
    );
  });
}

EXTENDED.forEach(([character, romaji, base], index) => {
  push("katakana", "extended", "ext", index, character, undefined, romaji, romaji, [], base);
});

// ---- Beziehungen ableiten -------------------------------------------------

const DAKUTEN_PAIRS: Record<string, string> = {};
const HANDAKUTEN_PAIRS: Record<string, string> = {};
for (const char of "かきくけこさしすせそたちつてとはひふへほカキクケコサシスセソタチツテトハヒフヘホウ") {
  const voiced = String.fromCharCode(char.charCodeAt(0) + 1);
  if (char === "ウ") DAKUTEN_PAIRS[char] = "ヴ";
  else DAKUTEN_PAIRS[char] = voiced;
}
for (const char of "はひふへほハヒフヘホ") {
  HANDAKUTEN_PAIRS[char] = String.fromCharCode(char.charCodeAt(0) + 2);
}

const byCharacter = new Map(all.map((k) => [k.character, k]));

for (const kana of all) {
  const dakuten = DAKUTEN_PAIRS[kana.character];
  if (dakuten && byCharacter.has(dakuten)) {
    kana.dakutenVariant = dakuten;
    const voiced = byCharacter.get(dakuten)!;
    if (voiced.group !== "extended") voiced.baseCharacter ??= kana.character;
  }
  const handakuten = HANDAKUTEN_PAIRS[kana.character];
  if (handakuten && byCharacter.has(handakuten)) {
    kana.handakutenVariant = handakuten;
    byCharacter.get(handakuten)!.baseCharacter ??= kana.character;
  }
}

for (const kana of all) {
  const related = new Set<string>();
  if (kana.counterpart) related.add(kana.counterpart);
  if (kana.baseCharacter) related.add(kana.baseCharacter);
  if (kana.dakutenVariant) related.add(kana.dakutenVariant);
  if (kana.handakutenVariant) related.add(kana.handakutenVariant);
  for (const other of all) {
    if (other !== kana && other.baseCharacter === kana.character) related.add(other.character);
  }
  related.delete(kana.character);
  kana.relatedCharacters = [...related].filter((c) => byCharacter.has(c));
}

export const KANA: readonly Kana[] = all;

/** Häufig verwechselte Zeichen mit kurzen Unterscheidungshilfen. */
export const CONFUSION_SETS: readonly { id: string; characters: string[]; tipDe: string }[] = [
  {
    id: "shi-tsu",
    characters: ["シ", "ツ"],
    tipDe:
      "シ: Die zwei Punkte stehen links übereinander, der lange Strich geht von unten links nach oben rechts. ツ: Die Punkte stehen oben nebeneinander, der lange Strich fällt von oben rechts nach unten links.",
  },
  {
    id: "so-n",
    characters: ["ソ", "ン"],
    tipDe:
      "ソ: Der Punkt steht oben, beide Striche fallen von oben nach unten. ン: Der Punkt steht links, der lange Strich steigt von unten links nach oben rechts.",
  },
  {
    id: "shi-n",
    characters: ["シ", "ン"],
    tipDe: "Beide steigen von unten nach oben. シ hat zwei Punkte, ン nur einen.",
  },
  {
    id: "tsu-so",
    characters: ["ツ", "ソ"],
    tipDe: "Beide fallen von oben. ツ hat zwei Punkte, ソ nur einen.",
  },
  {
    id: "ku-ke-ta",
    characters: ["ク", "ケ", "タ"],
    tipDe:
      "ク: zwei Striche, der zweite bildet oben einen Haken. タ: wie ク, aber mit einem zusätzlichen kurzen Strich im Inneren. ケ: Der waagerechte Strich ist gerade und ragt nach rechts hinaus, der dritte Strich fällt nach unten links.",
  },
  {
    id: "u-wa-fu",
    characters: ["ウ", "ワ", "フ"],
    tipDe:
      "ウ ist ワ mit einem zusätzlichen kurzen Strich oben. ワ hat links einen kurzen senkrechten Strich. フ besteht aus einem einzigen Strich – ohne senkrechten Strich links.",
  },
  {
    id: "chi-te",
    characters: ["チ", "テ"],
    tipDe:
      "チ beginnt oben mit einem schrägen Strich. テ beginnt mit einem geraden waagerechten Strich – oben stehen also zwei parallele Linien.",
  },
  {
    id: "yu-ko",
    characters: ["ユ", "コ"],
    tipDe:
      "コ ist rechts geschlossen und links offen. Bei ユ ragt der lange untere Strich nach rechts über den senkrechten Strich hinaus.",
  },
  {
    id: "ma-a",
    characters: ["マ", "ア"],
    tipDe:
      "マ endet mit einem kurzen Strich nach unten rechts. ア hat einen langen Strich, der nach unten links ausläuft.",
  },
  {
    id: "nu-su",
    characters: ["ヌ", "ス"],
    tipDe:
      "Bei ヌ kreuzt der zweite Strich die Diagonale. Bei ス beginnt er an der Diagonale und läuft nach rechts unten aus.",
  },
  {
    id: "sa-chi",
    characters: ["さ", "ち"],
    tipDe: "Spiegelbildlich: Der Bogen von さ öffnet sich nach rechts, der von ち nach links.",
  },
  {
    id: "ki-sa",
    characters: ["き", "さ"],
    tipDe: "き hat zwei waagerechte Striche, さ nur einen.",
  },
  {
    id: "nu-me",
    characters: ["ぬ", "め"],
    tipDe: "ぬ endet mit einer kleinen Schlaufe unten rechts, め nicht.",
  },
  {
    id: "ne-re-wa",
    characters: ["ね", "れ", "わ"],
    tipDe:
      "Gleicher linker Strich. ね endet mit einer Schlaufe, れ mit einem nach außen schwingenden Strich, わ mit einem runden Bogen.",
  },
  { id: "ru-ro", characters: ["る", "ろ"], tipDe: "る hat unten eine Schlaufe, ろ ist offen." },
  {
    id: "ha-ho",
    characters: ["は", "ほ"],
    tipDe: "ほ hat oben einen zusätzlichen waagerechten Strich.",
  },
  {
    id: "i-ri",
    characters: ["い", "り"],
    tipDe:
      "い: zwei kurze Striche nebeneinander. り: Der rechte Strich ist deutlich länger und zieht nach unten.",
  },
  {
    id: "a-o",
    characters: ["あ", "お"],
    tipDe:
      "あ hat einen senkrechten Strich, der den Querstrich kreuzt. お hat rechts oben einen kleinen Punkt.",
  },
];

const KANA_BY_CHARACTER = byCharacter;

export function getKanaByCharacter(character: string): Kana | undefined {
  return KANA_BY_CHARACTER.get(character);
}

export function getKanaById(id: string): Kana | undefined {
  return all.find((k) => k.id === id);
}

export function getConfusionSets(character: string) {
  return CONFUSION_SETS.filter((set) => set.characters.includes(character));
}

/** IDs der 46 Grundzeichen je Schrift – Basis für Fortschrittsanzeigen. */
export const BASIC_KANA_IDS: ReadonlySet<string> = new Set(
  all.filter((k) => k.group === "basic").map((k) => k.id),
);

export const BASIC_COUNT = 46;

export const ROW_LABELS: Record<string, string> = {
  vowel: "Vokale",
  k: "k",
  s: "s",
  t: "t",
  n: "n",
  h: "h",
  m: "m",
  y: "y",
  r: "r",
  w: "w",
  nn: "n",
  g: "g",
  z: "z",
  d: "d",
  b: "b",
  p: "p",
};
