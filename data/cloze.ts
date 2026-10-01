import { readingFromFurigana, stripFurigana } from "@/lib/japanese/furigana";

/**
 * Lückensätze für Grammatik-Wiederholungen. `___` markiert die Lücke; in Klammern steht
 * bei Bedarf die Grundform, die eingesetzt werden soll. Antworten in Japanisch (Kana/Kanji)
 * und akzeptierte Romaji-Schreibweisen.
 */
export type Cloze = {
  id: string;
  grammarId: string;
  /** Satz mit Lücke, Furigana-Notation erlaubt. */
  japanese: string;
  furigana?: string;
  reading: string;
  answers: string[];
  romaji: string[];
  german: string;
  /** Aufgabenhinweis, z. B. Grundform des Verbs. */
  hintDe?: string;
  /** Vollständiger Satz zum Anhören nach der Antwort. */
  solution: string;
};

type Def = [
  id: string,
  grammarId: string,
  notation: string,
  answers: string[],
  romaji: string[],
  german: string,
  hintDe?: string,
];

const cloze = ([id, grammarId, notation, answers, romaji, german, hintDe]: Def): Cloze => {
  const japanese = stripFurigana(notation);
  return {
    id,
    grammarId,
    japanese,
    furigana: japanese !== notation ? notation : undefined,
    reading: readingFromFurigana(notation),
    answers,
    romaji,
    german,
    hintDe,
    solution: japanese.replace("___", answers[0]),
  };
};

export const CLOZES: readonly Cloze[] = [
  ["c-desu-1", "desu", "これは本[ほん]___。", ["です"], ["desu"], "Das ist ein Buch."],
  ["c-desu-2", "desu", "私[わたし]は学生[がくせい]___。", ["です"], ["desu"], "Ich bin Student."],
  [
    "c-wa-1",
    "wa-topic",
    "私[わたし]___シュミットです。",
    ["は"],
    ["wa"],
    "Ich bin Schmidt.",
    "Partikel für das Thema",
  ],
  [
    "c-wa-2",
    "wa-topic",
    "駅[えき]___どこですか。",
    ["は"],
    ["wa"],
    "Wo ist der Bahnhof?",
    "Partikel für das Thema",
  ],
  [
    "c-wo-1",
    "wo-object",
    "水[みず]___飲[の]みます。",
    ["を"],
    ["o", "wo"],
    "Ich trinke Wasser.",
    "Partikel für das Objekt",
  ],
  [
    "c-wo-2",
    "wo-object",
    "本[ほん]___読[よ]みます。",
    ["を"],
    ["o", "wo"],
    "Ich lese ein Buch.",
    "Partikel für das Objekt",
  ],
  [
    "c-masu-1",
    "masu",
    "明日[あした]東京[とうきょう]に___。",
    ["行きます", "いきます"],
    ["ikimasu"],
    "Morgen fahre ich nach Tokio.",
    "行く – höflich",
  ],
  [
    "c-masu-2",
    "masu",
    "毎朝[まいあさ]コーヒーを___。",
    ["飲みます", "のみます"],
    ["nomimasu"],
    "Jeden Morgen trinke ich Kaffee.",
    "飲む – höflich",
  ],
  [
    "c-kudasai-1",
    "wo-kudasai",
    "お水[みず]を___。",
    ["ください", "お願いします", "おねがいします"],
    ["kudasai", "onegaishimasu", "onegai shimasu"],
    "Ein Wasser, bitte.",
  ],
  [
    "c-kudasai-2",
    "wo-kudasai",
    "コーヒーを二[ふた]つ___。",
    ["ください", "お願いします", "おねがいします"],
    ["kudasai", "onegaishimasu", "onegai shimasu"],
    "Zwei Kaffee, bitte.",
  ],
  [
    "c-te-kudasai-1",
    "te-kudasai",
    "ちょっと___ください。",
    ["待って", "まって"],
    ["matte"],
    "Einen Moment, bitte.",
    "待つ – て-Form",
  ],
  [
    "c-te-kudasai-2",
    "te-kudasai",
    "ゆっくり___ください。",
    ["話して", "はなして"],
    ["hanashite"],
    "Sprechen Sie bitte langsam.",
    "話す – て-Form",
  ],
  [
    "c-tai-1",
    "tai",
    "日本[にほん]に___です。",
    ["行きたい", "いきたい"],
    ["ikitai"],
    "Ich möchte nach Japan reisen.",
    "行く + Wunsch",
  ],
  [
    "c-tai-2",
    "tai",
    "ラーメンが___です。",
    ["食べたい", "たべたい"],
    ["tabetai"],
    "Ich hätte Lust auf Ramen.",
    "食べる + Wunsch",
  ],
  [
    "c-te-mo-ii-1",
    "te-mo-ii",
    "ここに___もいいですか。",
    ["座って", "すわって"],
    ["suwatte"],
    "Darf ich mich hier hinsetzen?",
    "座る – て-Form",
  ],
  [
    "c-te-mo-ii-2",
    "te-mo-ii",
    "写真[しゃしん]を___もいいですか。",
    ["撮って", "とって"],
    ["totte"],
    "Darf ich ein Foto machen?",
    "撮る – て-Form",
  ],
  [
    "c-mashou-1",
    "mashou",
    "一緒[いっしょ]に___。",
    ["行きましょう", "いきましょう"],
    ["ikimashou", "ikimashō"],
    "Lass uns zusammen gehen!",
    "行く – Vorschlag",
  ],
  [
    "c-mashou-2",
    "mashou",
    "週末[しゅうまつ]、映画[えいが]を見[み]___か。",
    ["ません"],
    ["masen"],
    "Wollen wir am Wochenende einen Film schauen?",
    "Einladung",
  ],
  [
    "c-kara-1",
    "kara-reason",
    "雨[あめ]だ___、タクシーで行[い]きます。",
    ["から"],
    ["kara"],
    "Weil es regnet, nehme ich ein Taxi.",
    "Grund",
  ],
  [
    "c-kara-2",
    "kara-reason",
    "お腹[なか]が空[す]いた___、何[なに]か食[た]べましょう。",
    ["から"],
    ["kara"],
    "Ich habe Hunger – lass uns etwas essen.",
    "Grund",
  ],
  [
    "c-nagara-1",
    "nagara",
    "音楽[おんがく]を聞[き]き___勉強[べんきょう]します。",
    ["ながら"],
    ["nagara"],
    "Ich lerne und höre dabei Musik.",
    "gleichzeitig",
  ],
  [
    "c-nagara-2",
    "nagara",
    "テレビを見[み]___ご飯[はん]を食[た]べます。",
    ["ながら"],
    ["nagara"],
    "Ich esse und schaue dabei fern.",
    "gleichzeitig",
  ],
  [
    "c-ni-iku-1",
    "ni-iku",
    "デパートへ買[か]い物[もの]___行[い]きます。",
    ["に"],
    ["ni"],
    "Ich gehe zum Einkaufen ins Kaufhaus.",
    "Zweck der Bewegung",
  ],
  [
    "c-ni-iku-2",
    "ni-iku",
    "駅[えき]へ友達[ともだち]を迎[むか]え___行[い]きます。",
    ["に"],
    ["ni"],
    "Ich hole einen Freund vom Bahnhof ab.",
    "Zweck der Bewegung",
  ],
].map((def) => cloze(def as Def));

export function clozesForGrammar(grammarId: string): Cloze[] {
  return CLOZES.filter((c) => c.grammarId === grammarId);
}
