import { readingFromFurigana, stripFurigana } from "@/lib/japanese/furigana";
import type { Difficulty, KeyExpression, Situation, SituationCategory } from "@/types/content";

/**
 * Alltagssituationen als Einstieg in echtes Japanisch. Jede Situation bündelt
 * Schlüsselausdrücke, Wortschatz, Gespräche und kulturelle Hinweise.
 */

type Expr = [notation: string, romaji: string, german: string, noteDe?: string];

const expr = ([notation, romaji, german, noteDe]: Expr): KeyExpression => {
  const japanese = stripFurigana(notation);
  return {
    japanese,
    furigana: japanese !== notation ? notation : undefined,
    reading: readingFromFurigana(notation),
    romaji,
    german,
    noteDe,
  };
};

type Definition = {
  slug: string;
  title: string;
  titleDe: string;
  descriptionDe: string;
  difficulty: Difficulty;
  category: SituationCategory;
  expressions: Expr[];
  culturalNotesDe: string[];
  vocabularyIds: string[];
};

const situation = (def: Definition): Situation => ({
  id: def.slug,
  slug: def.slug,
  titleJa: stripFurigana(def.title),
  titleReading: readingFromFurigana(def.title),
  titleDe: def.titleDe,
  descriptionDe: def.descriptionDe,
  difficulty: def.difficulty,
  category: def.category,
  keyExpressions: def.expressions.map(expr),
  culturalNotesDe: def.culturalNotesDe,
  vocabularyIds: def.vocabularyIds,
});

export const SITUATIONS: readonly Situation[] = [
  situation({
    slug: "greeting",
    title: "挨拶[あいさつ]",
    titleDe: "Begrüßung",
    descriptionDe:
      "Grüßen zur richtigen Tageszeit, Small Talk über das Wetter und die festen Formeln beim Gehen und Kommen.",
    difficulty: "beginner",
    category: "everyday",
    expressions: [
      ["おはようございます。", "ohayō gozaimasu.", "Guten Morgen."],
      ["こんにちは。", "konnichiwa.", "Guten Tag. / Hallo."],
      [
        "いい天気[てんき]ですね。",
        "ii tenki desu ne.",
        "Schönes Wetter, nicht wahr?",
        "Der klassische Gesprächseinstieg.",
      ],
      ["いってきます。", "ittekimasu.", "Bis später! (beim Gehen)"],
    ],
    culturalNotesDe: [
      "Zur Begrüßung verbeugt man sich leicht, statt die Hand zu geben. Je tiefer die Verbeugung, desto respektvoller.",
      "Small Talk über das Wetter oder die Jahreszeit ist kein Lückenfüller, sondern eine freundliche Geste.",
    ],
    vocabularyIds: [
      "ohayou",
      "konnichiwa",
      "tenki",
      "atatakai",
      "itterasshai",
      "ittekimasu",
      "kyou",
    ],
  }),
  situation({
    slug: "introduction",
    title: "自己紹介[じこしょうかい]",
    titleDe: "Sich vorstellen",
    descriptionDe:
      "Name, Herkunft, Studium oder Beruf und Hobbys – mit den passenden Formeln am Anfang und Ende.",
    difficulty: "beginner",
    category: "social",
    expressions: [
      ["はじめまして。", "hajimemashite.", "Freut mich (beim ersten Treffen)."],
      ["ドイツから来[き]ました。", "Doitsu kara kimashita.", "Ich komme aus Deutschland."],
      ["趣味[しゅみ]は何[なん]ですか。", "shumi wa nan desu ka.", "Was sind deine Hobbys?"],
      [
        "よろしくお願[ねが]いします。",
        "yoroshiku onegai shimasu.",
        "Freut mich. / Auf gute Zusammenarbeit.",
        "Gehört ans Ende jeder Vorstellung.",
      ],
    ],
    culturalNotesDe: [
      "In formellen Situationen nennt man zuerst den Familiennamen: „Schmidt desu“.",
      "Über sich selbst sagt man nie さん – das ist nur für andere.",
      "Ein Lob für dein Japanisch ist meist Freundlichkeit. Bescheiden antworten: いいえ、まだまだです。",
    ],
    vocabularyIds: [
      "hajimemashite",
      "yoroshiku",
      "kochirakoso",
      "namae",
      "watashi",
      "doitsu",
      "gakusei",
      "daigaku",
      "shigoto",
      "shumi",
      "jouzu",
    ],
  }),
  situation({
    slug: "konbini",
    title: "コンビニ",
    titleDe: "Convenience Store",
    descriptionDe:
      "Konbinis sind rund um die Uhr geöffnet – mit Essen, Getränken, Kopierer und Geldautomat. An der Kasse kommen immer dieselben Fragen.",
    difficulty: "beginner",
    category: "everyday",
    expressions: [
      ["袋[ふくろ]はいりますか。", "fukuro wa irimasu ka.", "Brauchen Sie eine Tüte?"],
      [
        "大丈夫[だいじょうぶ]です。",
        "daijōbu desu.",
        "Nein danke, passt so.",
        "An der Kasse eine höfliche Ablehnung.",
      ],
      ["温[あたた]めますか。", "atatamemasu ka.", "Soll ich es aufwärmen?"],
      ["カードでお願[ねが]いします。", "kādo de onegai shimasu.", "Mit Karte, bitte."],
    ],
    culturalNotesDe: [
      "Geld legt man in die kleine Schale auf dem Tresen, statt es direkt in die Hand zu geben.",
      "Mit いらっしゃいませ wirst du begrüßt – darauf antwortet man nicht, ein Nicken genügt.",
      "Tüten kosten meist ein paar Yen. Wer keine braucht, sagt einfach 大丈夫です。",
    ],
    vocabularyIds: [
      "irasshaimase",
      "fukuro",
      "bentou",
      "atatameru",
      "ohashi",
      "reji",
      "genkin",
      "kaado",
      "en",
      "denchi",
      "daijoubu",
    ],
  }),
  situation({
    slug: "cafe",
    title: "カフェ",
    titleDe: "Café",
    descriptionDe:
      "Bestellen an der Theke: Getränk, Größe, heiß oder kalt – und ob du hier trinkst oder mitnimmst.",
    difficulty: "beginner",
    category: "everyday",
    expressions: [
      [
        "アイスコーヒーをお願[ねが]いします。",
        "aisu kōhī o onegai shimasu.",
        "Einen Eiskaffee, bitte.",
      ],
      ["持[も]ち帰[かえ]りで。", "mochikaeri de.", "Zum Mitnehmen."],
      ["おすすめは何[なん]ですか。", "osusume wa nan desu ka.", "Was können Sie empfehlen?"],
      [
        "少々[しょうしょう]お待[ま]ちください。",
        "shōshō omachi kudasai.",
        "Einen Moment, bitte.",
        "Hörst du vom Personal.",
      ],
    ],
    culturalNotesDe: [
      "Saisonale Getränke (季節限定) wechseln mehrmals im Jahr – im Frühling gibt es fast überall etwas mit Kirschblüte.",
      "Trinkgeld ist in Japan unüblich und kann sogar verwirren.",
    ],
    vocabularyIds: [
      "kohii",
      "aisukoohii",
      "ocha",
      "matcha",
      "saizu",
      "tennai",
      "mochikaeri",
      "osusume",
      "chuumon",
      "kashikomarimashita",
      "shoushou",
    ],
  }),
  situation({
    slug: "restaurant",
    title: "レストラン",
    titleDe: "Restaurant",
    descriptionDe: "Einen Tisch bekommen, bestellen, das Personal rufen und an der Kasse bezahlen.",
    difficulty: "elementary",
    category: "everyday",
    expressions: [
      ["二人[ふたり]です。", "futari desu.", "Zu zweit, bitte.", "Antwort auf 何名様ですか。"],
      [
        "すみません、注文[ちゅうもん]をお願[ねが]いします。",
        "sumimasen, chūmon o onegai shimasu.",
        "Entschuldigung, wir möchten bestellen.",
      ],
      [
        "お会計[かいけい]をお願[ねが]いします。",
        "okaikei o onegai shimasu.",
        "Die Rechnung, bitte.",
      ],
      ["ごちそうさまでした。", "gochisōsama deshita.", "Danke, es war sehr lecker."],
    ],
    culturalNotesDe: [
      "Das Personal ruft man mit einem hörbaren すみません – das ist nicht unhöflich, sondern üblich. Manche Tische haben eine Klingel.",
      "Fast überall gibt es kostenlos Wasser oder Tee.",
      "Bezahlt wird meist vorne an der Kasse, nicht am Tisch.",
    ],
    vocabularyIds: [
      "futari",
      "menyu",
      "chuumon",
      "teishoku",
      "biiru",
      "mizu",
      "okaikei",
      "zenbu",
      "harau",
      "betsubetsu",
      "gochisousama",
      "oishii",
    ],
  }),
  situation({
    slug: "station",
    title: "駅[えき]",
    titleDe: "Bahnhof",
    descriptionDe:
      "Fahrkarten, Ticketsperren, Gleise und Zugarten – damit du sicher ans Ziel kommst.",
    difficulty: "elementary",
    category: "travel",
    expressions: [
      [
        "新宿[しんじゅく]までいくらですか。",
        "Shinjuku made ikura desu ka.",
        "Wie viel kostet es bis Shinjuku?",
      ],
      ["何番線[なんばんせん]ですか。", "nanbansen desu ka.", "Von welchem Gleis fährt der Zug?"],
      [
        "この電車[でんしゃ]は渋谷[しぶや]に止[と]まりますか。",
        "kono densha wa Shibuya ni tomarimasu ka.",
        "Hält dieser Zug in Shibuya?",
      ],
    ],
    culturalNotesDe: [
      "Mit einer IC-Karte (z. B. Suica) fährt man in fast ganz Japan – einfach an der Sperre auflegen.",
      "Im Zug wird nicht telefoniert und leise gesprochen.",
      "Eilzüge (急行) halten nicht an jeder Station – im Zweifel nimmt man den Nahverkehrszug (各駅停車).",
    ],
    vocabularyIds: [
      "eki",
      "densha",
      "kippu",
      "kaisatsu",
      "tomaru",
      "noru",
      "tsugi",
      "kyuukou",
      "tsukau",
      "kaado",
    ],
  }),
  situation({
    slug: "hotel",
    title: "ホテル",
    titleDe: "Hotel",
    descriptionDe: "Einchecken, Frühstückszeiten erfragen und Gepäck abgeben.",
    difficulty: "elementary",
    category: "travel",
    expressions: [
      ["予約[よやく]をしています。", "yoyaku o shite imasu.", "Ich habe reserviert."],
      [
        "チェックインをお願[ねが]いします。",
        "chekkuin o onegai shimasu.",
        "Ich möchte einchecken.",
      ],
      [
        "荷物[にもつ]を預[あず]けてもいいですか。",
        "nimotsu o azukete mo ii desu ka.",
        "Kann ich mein Gepäck hier lassen?",
      ],
    ],
    culturalNotesDe: [
      "Hotelpersonal spricht sehr höflich (敬語). Du selbst kommst mit です und ます bestens zurecht.",
      "In traditionellen Ryokan zieht man am Eingang die Schuhe aus.",
    ],
    vocabularyIds: [
      "hoteru",
      "yoyaku",
      "heya",
      "nimotsu",
      "pasupooto",
      "choushoku",
      "namae",
      "mochiron",
    ],
  }),
  situation({
    slug: "shopping",
    title: "買[か]い物[もの]",
    titleDe: "Einkaufen",
    descriptionDe:
      "Preise erfragen, anprobieren, nach einer anderen Größe fragen und sich entscheiden.",
    difficulty: "elementary",
    category: "travel",
    expressions: [
      ["これはいくらですか。", "kore wa ikura desu ka.", "Wie viel kostet das?"],
      [
        "試着[しちゃく]してもいいですか。",
        "shichaku shite mo ii desu ka.",
        "Darf ich das anprobieren?",
      ],
      [
        "もう少[すこ]し大[おお]きいのはありますか。",
        "mō sukoshi ōkii no wa arimasu ka.",
        "Haben Sie es eine Nummer größer?",
      ],
      ["これにします。", "kore ni shimasu.", "Ich nehme das."],
    ],
    culturalNotesDe: [
      "Feilschen ist in Geschäften unüblich – Preise gelten wie ausgeschildert.",
      "Viele Läden bieten Tax-free-Einkauf für Touristen ab einem Mindestbetrag; dafür braucht man den Reisepass.",
    ],
    vocabularyIds: [
      "kau",
      "kaimono",
      "mise",
      "ikura",
      "takai",
      "yasui",
      "shichaku",
      "saizu",
      "ookii",
      "chiisai",
      "choudo",
    ],
  }),
  situation({
    slug: "friends",
    title: "友達[ともだち]と会[あ]う",
    titleDe: "Freunde treffen",
    descriptionDe: "Lockere Umgangssprache unter Freunden: Pläne machen, vorschlagen, zusagen.",
    difficulty: "elementary",
    category: "social",
    expressions: [
      [
        "週末[しゅうまつ]、暇[ひま]？",
        "shūmatsu, hima?",
        "Hast du am Wochenende Zeit?",
        "Locker – höflich wäre 週末はお暇ですか。",
      ],
      ["一緒[いっしょ]に行[い]かない？", "issho ni ikanai?", "Kommst du mit?"],
      ["いいね！", "ii ne!", "Gute Idee!"],
      ["じゃあ、また！", "jā, mata!", "Bis dann!"],
    ],
    culturalNotesDe: [
      "Unter Freunden fallen です und ます weg – zu Fremden oder Älteren bleibt man höflich.",
      "Eine direkte Absage vermeidet man gern: 土曜日はちょっと… („Samstag ist etwas …“) reicht als freundliches Nein.",
    ],
    vocabularyIds: [
      "tomodachi",
      "shuumatsu",
      "hima",
      "doyoubi",
      "issho",
      "eiga",
      "au",
      "atarashii",
      "suki",
      "shumi",
    ],
  }),
  situation({
    slug: "directions",
    title: "道[みち]を聞[き]く",
    titleDe: "Nach dem Weg fragen",
    descriptionDe: "Fragen, zuhören, wiederholen: Richtungen, Ampeln, Entfernungen.",
    difficulty: "beginner",
    category: "travel",
    expressions: [
      ["駅[えき]はどこですか。", "eki wa doko desu ka.", "Wo ist der Bahnhof?"],
      ["まっすぐ行[い]ってください。", "massugu itte kudasai.", "Gehen Sie geradeaus."],
      ["右[みぎ]に曲[ま]がってください。", "migi ni magatte kudasai.", "Biegen Sie rechts ab."],
      [
        "歩[ある]いて何分[なんぷん]ぐらいですか。",
        "aruite nanpun gurai desu ka.",
        "Wie lange dauert es zu Fuß?",
      ],
    ],
    culturalNotesDe: [
      "Viele Straßen in Japan haben keine Namen – Wegbeschreibungen orientieren sich an Ampeln, Kreuzungen und auffälligen Gebäuden.",
      "Polizeiposten (交番) helfen gern weiter und haben oft Umgebungskarten.",
    ],
    vocabularyIds: [
      "michi",
      "eki",
      "doko",
      "massugu",
      "migi",
      "hidari",
      "magaru",
      "shingou",
      "chikai",
      "tooi",
      "aruku",
      "tasukarimashita",
    ],
  }),
];

const BY_SLUG = new Map(SITUATIONS.map((s) => [s.slug, s]));

export function getSituation(slug: string): Situation | undefined {
  return BY_SLUG.get(slug);
}

export const SITUATION_CATEGORY_LABELS: Record<SituationCategory, string> = {
  everyday: "Alltag",
  travel: "Reisen",
  social: "Social",
  work: "Arbeit",
};
