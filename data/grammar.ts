import type { GrammarCategory, GrammarPoint } from "@/types/content";

/**
 * Grammatik als Nachschlagewerk: kurz, praxisnah, immer mit Beispielen aus echten Sätzen.
 * Beispiele werden über `grammarIds` in data/sentences.ts verknüpft.
 */
export const GRAMMAR: readonly GrammarPoint[] = [
  {
    id: "desu",
    slug: "desu",
    pattern: "～です",
    meaningDe: "sein (höfliche Aussage)",
    structure: "Nomen / Adjektiv + です",
    explanationDe:
      "です steht am Satzende und macht eine Aussage höflich – oft entspricht es dem deutschen „sein“. Eine Frage entsteht einfach mit か am Ende: 学生ですか。",
    jlpt: "N5",
    category: "basics",
    common: true,
    usageNotes:
      "Gegenüber Fremden, im Laden und im Beruf. Unter Freunden fällt です oft weg oder wird zu だ.",
    commonMistakes: [
      "Ein Subjekt ist nicht nötig: 学生です。 heißt bereits „Ich bin Student.“",
      "Nach einer ます-Form steht kein です: ✗ 食べますです。",
    ],
    similar: ["wa-topic"],
  },
  {
    id: "wa-topic",
    slug: "wa-thema",
    pattern: "～は",
    meaningDe: "Thema des Satzes („was … betrifft“)",
    structure: "Thema + は + Aussage",
    explanationDe:
      "は markiert, worüber gesprochen wird. Als Partikel wird es „wa“ ausgesprochen. Das Thema ist oft, aber nicht immer, das Subjekt.",
    jlpt: "N5",
    category: "basics",
    common: true,
    usageNotes: "Ist das Thema aus dem Zusammenhang klar, lässt man es weg: (私は) 学生です。",
    commonMistakes: [
      "Als Partikel wird は „wa“ gesprochen, nicht „ha“.",
      "Fragewörter als Subjekt stehen mit が, nicht mit は: 誰が来ましたか。",
    ],
    similar: ["desu", "wo-object"],
  },
  {
    id: "wo-object",
    slug: "wo-objekt",
    pattern: "～を",
    meaningDe: "markiert das direkte Objekt",
    structure: "Objekt + を + Verb",
    explanationDe:
      "を steht hinter dem, worauf sich die Handlung richtet: Wasser trinken → 水を飲みます. Gesprochen wird es wie „o“.",
    jlpt: "N5",
    category: "basics",
    common: true,
    commonMistakes: [
      "を klingt wie „o“, auch wenn es manchmal „wo“ umschrieben wird.",
      "Bei 好き und 分かる steht が statt を: 音楽が好きです。",
    ],
    similar: ["wa-topic", "wo-kudasai"],
  },
  {
    id: "masu",
    slug: "masu-form",
    pattern: "～ます / ～ません",
    meaningDe: "höfliche Verbform (Gegenwart und Zukunft)",
    structure: "Verbstamm + ます / ません / ました / ませんでした",
    explanationDe:
      "Die ます-Form ist die neutral-höfliche Standardform. Sie steht für Gegenwart und Zukunft; ました ist Vergangenheit, ません die Verneinung.",
    jlpt: "N5",
    category: "basics",
    common: true,
    usageNotes: "Für Lernende ideal: Sie passt fast immer, wenn man mit Fremden spricht.",
    commonMistakes: [
      "Der Stamm hängt von der Verbgruppe ab: 飲む → 飲みます, 食べる → 食べます.",
      "Es gibt keine eigene Zukunftsform: 明日行きます heißt „Ich gehe morgen.“",
    ],
    similar: ["mashou", "tai"],
  },
  {
    id: "wo-kudasai",
    slug: "wo-kudasai",
    pattern: "～をください / ～をお願いします",
    meaningDe: "um etwas bitten („…, bitte“)",
    structure: "Nomen + を + ください / お願いします",
    explanationDe:
      "Mit ください bittest du um eine Sache. お願いします klingt etwas weicher und passt auch für Dienstleistungen: お会計をお願いします。",
    jlpt: "N5",
    category: "requests",
    common: true,
    usageNotes:
      "Beim Bestellen, an der Kasse, im Hotel. Mengen stehen direkt vor ください: 水を二つください。",
    commonMistakes: [
      "Für Handlungen braucht man die て-Form: 待ってください, nicht ✗ 待つをください.",
    ],
    similar: ["te-kudasai"],
  },
  {
    id: "te-kudasai",
    slug: "te-kudasai",
    pattern: "～てください",
    meaningDe: "bitten, etwas zu tun",
    structure: "Verb-て + ください",
    explanationDe:
      "Eine höfliche Bitte oder Anweisung. Die て-Form wird je nach Verbgruppe gebildet: 待つ → 待って, 話す → 話して, 食べる → 食べて.",
    jlpt: "N5",
    category: "requests",
    common: true,
    usageNotes:
      "Typisch auch in Wegbeschreibungen: まっすぐ行ってください。 Noch höflicher: ～てくださいませんか。",
    commonMistakes: ["Für Gegenstände nimmt man ～をください, nicht die て-Form."],
    similar: ["wo-kudasai", "te-mo-ii"],
  },
  {
    id: "tai",
    slug: "tai",
    pattern: "～たい",
    meaningDe: "etwas tun wollen / möchten",
    structure: "Verbstamm + たい(です)",
    explanationDe:
      "たい drückt einen eigenen Wunsch aus und wird wie ein i-Adjektiv gebeugt: 行きたくない (will nicht gehen), 行きたかった (wollte gehen).",
    jlpt: "N5",
    category: "wishes",
    common: true,
    usageNotes: "Das Gewünschte kann mit を oder が stehen: ラーメンが食べたい。",
    commonMistakes: [
      "Andere direkt mit ～たいですか zu fragen, kann aufdringlich wirken – freundlicher ist ～ませんか.",
      "Für Wünsche anderer Personen sagt man ～たがっている.",
    ],
    similar: ["mashou"],
  },
  {
    id: "te-mo-ii",
    slug: "te-mo-ii",
    pattern: "～てもいい",
    meaningDe: "dürfen / es ist in Ordnung, etwas zu tun",
    structure: "Verb-て + もいい(です)",
    explanationDe:
      "Mit ～てもいいですか fragst du um Erlaubnis. Als Zustimmung genügt はい、どうぞ。",
    jlpt: "N5",
    category: "requests",
    common: true,
    usageNotes:
      "Noch höflicher: ～てもよろしいですか。 Mit Verneinung „man muss nicht“: ～なくてもいい.",
    commonMistakes: [
      "Eine Ablehnung ist meist indirekt: すみません、ちょっと… statt eines klaren „Nein“.",
    ],
    similar: ["te-kudasai"],
  },
  {
    id: "mashou",
    slug: "mashou",
    pattern: "～ましょう / ～ませんか",
    meaningDe: "Vorschlag und Einladung („Lass uns …“, „Wollen wir …?“)",
    structure: "Verbstamm + ましょう / ませんか",
    explanationDe:
      "～ませんか lädt höflich ein („Wollen wir nicht …?“). ～ましょう schlägt etwas vor oder nimmt eine Einladung an.",
    jlpt: "N5",
    category: "wishes",
    common: true,
    usageNotes: "Typisch: 一緒に映画を見ませんか。 – いいですね、見ましょう。",
    commonMistakes: [
      "～ませんか ist trotz Verneinung keine negative Frage, sondern eine freundliche Einladung.",
    ],
    similar: ["tai", "masu"],
  },
  {
    id: "kara-reason",
    slug: "kara-grund",
    pattern: "～から",
    meaningDe: "weil, da (Grund)",
    structure: "Satz + から、Folge",
    explanationDe:
      "から nach einem Satz nennt den Grund – zuerst der Grund, dann die Folge. Nach Nomen und na-Adjektiven: だから bzw. ですから.",
    jlpt: "N5",
    category: "connecting",
    common: true,
    usageNotes:
      "Im Gespräch steht から oft allein am Satzende: 雨だから。 Etwas formeller und weicher ist ので.",
    commonMistakes: ["Nicht verwechseln mit から „ab, von“: 九時から (ab neun Uhr)."],
    similar: ["nagara"],
  },
  {
    id: "nagara",
    slug: "nagara",
    pattern: "～ながら",
    meaningDe: "während, gleichzeitig",
    structure: "Verbstamm + ながら、Haupthandlung",
    explanationDe:
      "ながら verbindet zwei gleichzeitige Handlungen derselben Person. Die wichtigere Handlung steht am Ende.",
    jlpt: "N4",
    category: "connecting",
    common: false,
    usageNotes:
      "音楽を聞きながら勉強します。 – Das Lernen ist die Hauptsache, die Musik läuft nebenbei.",
    commonMistakes: ["Nur für eine Person. Bei zwei verschiedenen Personen: ～間（あいだ）に."],
    similar: ["kara-reason"],
  },
  {
    id: "ni-iku",
    slug: "ni-iku",
    pattern: "～に行く",
    meaningDe: "gehen, um etwas zu tun",
    structure: "Verbstamm / Nomen + に + 行く・来る・帰る",
    explanationDe:
      "Der Zweck einer Bewegung steht mit に vor 行く: 買い物に行きます (einkaufen gehen). Bei Verben nimmt man den Stamm: 迎えに行きます (abholen gehen).",
    jlpt: "N5",
    category: "connecting",
    common: true,
    usageNotes: "Das Ziel steht zusätzlich mit へ oder に: デパートへ買い物に行きます。",
    commonMistakes: ["Nicht mit der Wörterbuchform: ✗ 買うに行く."],
    similar: ["tai"],
  },
];

const BY_SLUG = new Map(GRAMMAR.map((g) => [g.slug, g]));
const BY_ID = new Map(GRAMMAR.map((g) => [g.id, g]));

export function getGrammarBySlug(slug: string): GrammarPoint | undefined {
  return BY_SLUG.get(slug);
}

export function getGrammar(id: string): GrammarPoint | undefined {
  return BY_ID.get(id);
}

export const GRAMMAR_CATEGORY_LABELS: Record<GrammarCategory, string> = {
  basics: "Grundlagen",
  requests: "Bitten & Erlaubnis",
  wishes: "Wünsche & Vorschläge",
  connecting: "Sätze verbinden",
};
