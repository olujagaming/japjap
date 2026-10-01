import { readingFromFurigana, stripFurigana } from "@/lib/japanese/furigana";
import type { FrequencyTier, JlptLevel, PartOfSpeech, Vocabulary } from "@/types/content";

/**
 * Grundwortschatz für Alltag und Reisen. Japanisch und Lesung werden aus der
 * Furigana-Notation abgeleitet (`食[た]べる`), damit beide nie auseinanderlaufen.
 * Deutsche Bedeutungen in der Reihenfolge ihrer Häufigkeit.
 */

type Extra = { noteDe?: string; related?: string[]; english?: string[] };

function v(
  id: string,
  notation: string,
  romaji: string,
  german: string[],
  partOfSpeech: PartOfSpeech,
  jlpt: JlptLevel | null,
  frequency: FrequencyTier,
  tags: string[],
  extra: Extra = {},
): Vocabulary {
  const japanese = stripFurigana(notation);
  return {
    id,
    japanese,
    reading: readingFromFurigana(notation),
    furigana: japanese !== notation ? notation : undefined,
    romaji,
    german,
    english: extra.english,
    partOfSpeech,
    jlpt: jlpt ?? undefined,
    frequency,
    tags,
    noteDe: extra.noteDe,
    related: extra.related ?? [],
  };
}

export const VOCABULARY: readonly Vocabulary[] = [
  // ---------- Essen und Trinken ----------
  v("taberu", "食[た]べる", "taberu", ["essen"], "verb-ichidan", "N5", 1, ["food", "restaurant"], {
    english: ["to eat"],
    related: ["shokuji", "tabemono", "choushoku", "nomu"],
  }),
  v("nomu", "飲[の]む", "nomu", ["trinken"], "verb-godan", "N5", 1, ["food", "cafe"], {
    english: ["to drink"],
    noteDe: "Auch für das Einnehmen von Medikamenten: 薬を飲む.",
    related: ["nomimono", "mizu", "taberu"],
  }),
  v("mizu", "水[みず]", "mizu", ["Wasser"], "noun", "N5", 1, ["food", "restaurant"], {
    noteDe: "Im Restaurant oft höflich お水. Kaltes Leitungswasser wird meist ungefragt serviert.",
    related: ["nomu", "nomimono"],
  }),
  v("ocha", "お茶[ちゃ]", "ocha", ["Tee (meist grüner Tee)"], "noun", "N5", 1, ["food", "cafe"], {
    related: ["kohii", "nomimono"],
  }),
  v("kohii", "コーヒー", "kōhī", ["Kaffee"], "noun", "N5", 1, ["cafe"], {
    related: ["aisukoohii", "ocha"],
  }),
  v(
    "aisukoohii",
    "アイスコーヒー",
    "aisu kōhī",
    ["Eiskaffee (kalter Kaffee mit Eiswürfeln)"],
    "noun",
    null,
    2,
    ["cafe"],
    {
      noteDe: "Gemeint ist kalter schwarzer Kaffee auf Eis – nicht Kaffee mit Speiseeis.",
      related: ["kohii"],
    },
  ),
  v("gohan", "ご飯[はん]", "gohan", ["Reis (gekocht)", "Mahlzeit"], "noun", "N5", 1, ["food"], {
    related: ["asagohan", "shokuji"],
  }),
  v(
    "asagohan",
    "朝[あさ]ご飯[はん]",
    "asagohan",
    ["Frühstück"],
    "noun",
    "N5",
    1,
    ["food", "time"],
    {
      related: ["choushoku", "gohan", "asa"],
    },
  ),
  v("shokuji", "食事[しょくじ]", "shokuji", ["Mahlzeit", "Essen"], "noun", "N4", 2, ["food"], {
    related: ["taberu", "tabemono", "gohan"],
  }),
  v(
    "tabemono",
    "食[た]べ物[もの]",
    "tabemono",
    ["Essen", "Lebensmittel"],
    "noun",
    "N5",
    1,
    ["food"],
    {
      related: ["taberu", "nomimono", "shokuhin"],
    },
  ),
  v(
    "nomimono",
    "飲[の]み物[もの]",
    "nomimono",
    ["Getränk"],
    "noun",
    "N5",
    1,
    ["food", "restaurant"],
    {
      related: ["nomu", "tabemono"],
    },
  ),
  v(
    "choushoku",
    "朝[ちょう]食[しょく]",
    "chōshoku",
    ["Frühstück"],
    "noun",
    "N4",
    2,
    ["food", "hotel"],
    {
      noteDe: "Formeller als 朝ご飯 – typisch in Hotels und auf Schildern.",
      related: ["asagohan", "taberu"],
    },
  ),
  v(
    "shokuhin",
    "食品[しょくひん]",
    "shokuhin",
    ["Lebensmittel", "Nahrungsmittel"],
    "noun",
    "N3",
    3,
    ["food", "shopping"],
    {
      noteDe: "Eher schriftlich, z. B. auf Schildern im Supermarkt.",
      related: ["tabemono"],
    },
  ),
  v("sushi", "寿司[すし]", "sushi", ["Sushi"], "noun", null, 2, ["food", "restaurant"]),
  v(
    "oishii",
    "おいしい",
    "oishii",
    ["lecker", "köstlich"],
    "adj-i",
    "N5",
    1,
    ["food", "restaurant"],
    {
      noteDe: "Wird meist in Hiragana geschrieben (selten 美味しい).",
    },
  ),
  v("menyu", "メニュー", "menyū", ["Speisekarte", "Menü"], "noun", null, 2, ["restaurant", "cafe"]),
  v(
    "okaikei",
    "お会計[かいけい]",
    "okaikei",
    ["Rechnung (beim Bezahlen)"],
    "noun",
    null,
    2,
    ["restaurant"],
    {
      noteDe: "Im Restaurant: お会計をお願いします。 Bezahlt wird meist vorne an der Kasse.",
    },
  ),
  v("ohashi", "お箸[はし]", "ohashi", ["Essstäbchen"], "noun", "N5", 2, ["food", "konbini"]),
  v("bentou", "お弁当[べんとう]", "obentō", ["Bento", "Lunchbox"], "noun", "N5", 2, [
    "food",
    "konbini",
  ]),
  v(
    "atatameru",
    "温[あたた]める",
    "atatameru",
    ["aufwärmen", "erwärmen"],
    "verb-ichidan",
    "N4",
    3,
    ["konbini"],
    {
      noteDe: "Im Konbini fragt man: お弁当を温めますか。 – „Soll ich das Bento aufwärmen?“",
    },
  ),
  v(
    "hitotsu",
    "一[ひと]つ",
    "hitotsu",
    ["eins, ein Stück"],
    "counter",
    "N5",
    1,
    ["shopping", "restaurant"],
    {
      noteDe: "Allgemeines Zählwort für Dinge – beim Bestellen sehr praktisch.",
      related: ["futatsu"],
    },
  ),
  v(
    "futatsu",
    "二[ふた]つ",
    "futatsu",
    ["zwei, zwei Stück"],
    "counter",
    "N5",
    1,
    ["shopping", "restaurant"],
    {
      related: ["hitotsu"],
    },
  ),

  // ---------- Einkaufen und Konbini ----------
  v("kau", "買[か]う", "kau", ["kaufen"], "verb-godan", "N5", 1, ["shopping"], {
    related: ["kaimono", "mise"],
  }),
  v(
    "kaimono",
    "買[か]い物[もの]",
    "kaimono",
    ["Einkauf", "Einkaufen"],
    "noun",
    "N5",
    1,
    ["shopping"],
    {
      related: ["kau", "mise"],
    },
  ),
  v("mise", "店[みせ]", "mise", ["Laden", "Geschäft"], "noun", "N5", 1, ["shopping"], {
    noteDe: "Höflich auch お店.",
    related: ["kaimono"],
  }),
  v("ikura", "いくら", "ikura", ["wie viel (kostet …)"], "question", "N5", 1, ["shopping"], {
    related: ["en"],
  }),
  v("en", "円[えん]", "en", ["Yen"], "noun", "N5", 1, ["shopping"], { related: ["ikura"] }),
  v("takai", "高[たか]い", "takai", ["teuer", "hoch"], "adj-i", "N5", 1, ["shopping"], {
    related: ["yasui"],
  }),
  v("yasui", "安[やす]い", "yasui", ["billig", "günstig"], "adj-i", "N5", 1, ["shopping"], {
    related: ["takai"],
  }),
  v(
    "fukuro",
    "袋[ふくろ]",
    "fukuro",
    ["Tüte", "Beutel"],
    "noun",
    "N4",
    2,
    ["konbini", "shopping"],
    {
      noteDe: "Plastiktüten kosten in Japan meist ein paar Yen extra.",
    },
  ),
  v("reji", "レジ", "reji", ["Kasse"], "noun", null, 2, ["konbini", "shopping"]),
  v("genkin", "現金[げんきん]", "genkin", ["Bargeld"], "noun", "N3", 2, ["konbini", "shopping"], {
    related: ["kaado"],
  }),
  v(
    "kaado",
    "カード",
    "kādo",
    ["Karte (z. B. Kreditkarte)"],
    "noun",
    "N5",
    1,
    ["konbini", "shopping"],
    {
      related: ["genkin"],
    },
  ),
  v(
    "irasshaimase",
    "いらっしゃいませ",
    "irasshaimase",
    ["Herzlich willkommen! (im Geschäft)"],
    "expression",
    null,
    1,
    ["konbini", "shopping", "restaurant"],
    {
      noteDe:
        "Begrüßung durch das Personal. Kunden antworten darauf nicht – ein kurzes Nicken genügt.",
    },
  ),

  // ---------- Unterwegs ----------
  v("eki", "駅[えき]", "eki", ["Bahnhof", "Station"], "noun", "N5", 1, ["station", "directions"], {
    related: ["densha", "kippu"],
  }),
  v("densha", "電車[でんしゃ]", "densha", ["Zug", "Bahn"], "noun", "N5", 1, ["station"], {
    related: ["eki", "kippu"],
  }),
  v("kippu", "切符[きっぷ]", "kippu", ["Fahrkarte", "Ticket"], "noun", "N5", 2, ["station"], {
    related: ["eki", "densha"],
  }),
  v("kuruma", "車[くるま]", "kuruma", ["Auto", "Wagen"], "noun", "N5", 1, ["travel"]),
  v("hoteru", "ホテル", "hoteru", ["Hotel"], "noun", "N5", 1, ["hotel", "travel"], {
    related: ["heya", "yoyaku"],
  }),
  v("heya", "部屋[へや]", "heya", ["Zimmer", "Raum"], "noun", "N5", 1, ["hotel"], {
    related: ["hoteru"],
  }),
  v(
    "yoyaku",
    "予約[よやく]",
    "yoyaku",
    ["Reservierung", "Buchung"],
    "noun",
    "N4",
    2,
    ["hotel", "restaurant"],
    {
      noteDe: "Mit する als Verb: 予約する – reservieren.",
    },
  ),
  v("nimotsu", "荷物[にもつ]", "nimotsu", ["Gepäck"], "noun", "N4", 2, ["hotel", "travel"]),
  v("michi", "道[みち]", "michi", ["Weg", "Straße"], "noun", "N5", 1, ["directions"]),
  v("migi", "右[みぎ]", "migi", ["rechts"], "noun", "N5", 1, ["directions"], {
    related: ["hidari"],
  }),
  v("hidari", "左[ひだり]", "hidari", ["links"], "noun", "N5", 1, ["directions"], {
    related: ["migi"],
  }),
  v("massugu", "まっすぐ", "massugu", ["geradeaus"], "adverb", "N5", 2, ["directions"]),
  v("chikai", "近[ちか]い", "chikai", ["nah"], "adj-i", "N5", 1, ["directions"], {
    related: ["tooi"],
  }),
  v("tooi", "遠[とお]い", "tōi", ["weit (entfernt)"], "adj-i", "N5", 1, ["directions"], {
    related: ["chikai"],
  }),
  v("toire", "トイレ", "toire", ["Toilette"], "noun", "N5", 1, ["directions", "restaurant"]),
  v("ryokou", "旅行[りょこう]", "ryokō", ["Reise"], "noun", "N5", 1, ["travel"]),
  v("tokyo", "東京[とうきょう]", "Tōkyō", ["Tokio"], "noun", null, 1, ["travel"]),
  v(
    "iku",
    "行[い]く",
    "iku",
    ["gehen", "fahren (hin)"],
    "verb-godan",
    "N5",
    1,
    ["travel", "directions"],
    {
      noteDe: "Ausnahme in der て-Form: 行って (nicht 行いて).",
      related: ["kuru", "kaeru"],
    },
  ),
  v("kuru", "来[く]る", "kuru", ["kommen"], "verb-irregular", "N5", 1, ["travel"], {
    noteDe: "Unregelmäßig: 来ます（きます）, 来ない（こない）.",
    related: ["iku", "kaeru"],
  }),
  v(
    "kaeru",
    "帰[かえ]る",
    "kaeru",
    ["nach Hause gehen", "zurückkehren"],
    "verb-godan",
    "N5",
    1,
    ["travel"],
    {
      noteDe: "Sieht aus wie ein Ichidan-Verb, wird aber wie Godan gebeugt: 帰ります.",
      related: ["iku", "kuru"],
    },
  ),

  // ---------- Zeit ----------
  v("kyou", "今日[きょう]", "kyō", ["heute"], "noun", "N5", 1, ["time"], {
    related: ["ashita", "kinou"],
  }),
  v("ashita", "明日[あした]", "ashita", ["morgen"], "noun", "N5", 1, ["time"], {
    related: ["kyou", "kinou"],
  }),
  v("kinou", "昨日[きのう]", "kinō", ["gestern"], "noun", "N5", 1, ["time"], {
    related: ["kyou", "ashita"],
  }),
  v("ima", "今[いま]", "ima", ["jetzt"], "noun", "N5", 1, ["time"]),
  v("asa", "朝[あさ]", "asa", ["Morgen"], "noun", "N5", 1, ["time"], { related: ["asagohan"] }),
  v("jikan", "時間[じかん]", "jikan", ["Zeit", "Stunde(n)"], "noun", "N5", 1, ["time"], {
    related: ["nanji"],
  }),
  v(
    "nanji",
    "何時[なんじ]",
    "nanji",
    ["wie spät", "um wie viel Uhr"],
    "question",
    "N5",
    1,
    ["time"],
    {
      related: ["jikan"],
    },
  ),
  v("shuumatsu", "週末[しゅうまつ]", "shūmatsu", ["Wochenende"], "noun", "N4", 2, [
    "time",
    "friends",
  ]),

  // ---------- Menschen und Kennenlernen ----------
  v("watashi", "私[わたし]", "watashi", ["ich"], "pronoun", "N5", 1, ["introduction"], {
    noteDe: "Wird oft weggelassen, wenn klar ist, wer spricht.",
  }),
  v("namae", "名前[なまえ]", "namae", ["Name"], "noun", "N5", 1, ["introduction"], {
    noteDe: "Nach dem Namen anderer fragt man höflich mit お名前.",
  }),
  v("hito", "人[ひと]", "hito", ["Mensch", "Person"], "noun", "N5", 1, ["introduction"]),
  v("tomodachi", "友達[ともだち]", "tomodachi", ["Freund", "Freundin"], "noun", "N5", 1, [
    "friends",
  ]),
  v(
    "sensei",
    "先生[せんせい]",
    "sensei",
    ["Lehrer, Lehrerin", "Arzt, Ärztin (als Anrede)"],
    "noun",
    "N5",
    1,
    ["introduction"],
    {
      noteDe:
        "Auch respektvolle Anrede für Ärzte, Anwälte und Lehrende. Nie für sich selbst verwenden.",
      related: ["gakusei"],
    },
  ),
  v(
    "gakusei",
    "学生[がくせい]",
    "gakusei",
    ["Student, Studentin", "Schüler, Schülerin"],
    "noun",
    "N5",
    1,
    ["introduction"],
    {
      related: ["sensei", "benkyou"],
    },
  ),
  v("nihon", "日本[にほん]", "Nihon", ["Japan"], "noun", "N5", 1, ["introduction", "travel"], {
    related: ["nihongo"],
  }),
  v(
    "nihongo",
    "日本語[にほんご]",
    "nihongo",
    ["Japanisch (Sprache)"],
    "noun",
    "N5",
    1,
    ["introduction"],
    {
      related: ["nihon", "eigo"],
    },
  ),
  v("eigo", "英語[えいご]", "eigo", ["Englisch (Sprache)"], "noun", "N5", 1, ["introduction"], {
    related: ["nihongo"],
  }),
  v("doitsu", "ドイツ", "Doitsu", ["Deutschland"], "noun", "N5", 2, ["introduction"]),
  v("shigoto", "仕事[しごと]", "shigoto", ["Arbeit", "Beruf"], "noun", "N5", 1, ["work"], {
    related: ["kaisha"],
  }),
  v("kaisha", "会社[かいしゃ]", "kaisha", ["Firma", "Unternehmen"], "noun", "N5", 1, ["work"], {
    related: ["shigoto"],
  }),
  v("shumi", "趣味[しゅみ]", "shumi", ["Hobby"], "noun", "N4", 2, ["friends"], {
    related: ["ongaku", "eiga"],
  }),
  v("ongaku", "音楽[おんがく]", "ongaku", ["Musik"], "noun", "N5", 1, ["friends"], {
    related: ["shumi"],
  }),
  v("eiga", "映画[えいが]", "eiga", ["Film", "Kino"], "noun", "N5", 1, ["friends"], {
    related: ["miru", "shumi"],
  }),
  v("hon", "本[ほん]", "hon", ["Buch"], "noun", "N5", 1, ["friends"], { related: ["yomu"] }),
  v("shashin", "写真[しゃしん]", "shashin", ["Foto"], "noun", "N5", 1, ["travel"]),
  v("suki", "好[す]き", "suki", ["mögen", "gern haben"], "adj-na", "N5", 1, ["friends"], {
    noteDe: "Grammatisch ein Adjektiv: Das Gemochte steht mit が – 音楽が好きです。",
  }),
  v("issho", "一緒[いっしょ]に", "issho ni", ["zusammen", "gemeinsam"], "adverb", "N5", 1, [
    "friends",
  ]),

  // ---------- Häufige Verben ----------
  v("suru", "する", "suru", ["machen", "tun"], "verb-irregular", "N5", 1, ["basics"], {
    noteDe: "Macht viele Nomen zu Verben: 勉強する, 予約する.",
  }),
  v(
    "benkyou",
    "勉強[べんきょう]する",
    "benkyō suru",
    ["lernen", "studieren"],
    "verb-suru",
    "N5",
    1,
    ["basics"],
    {
      related: ["gakusei", "suru"],
    },
  ),
  v("hanasu", "話[はな]す", "hanasu", ["sprechen", "reden"], "verb-godan", "N5", 1, ["basics"]),
  v("miru", "見[み]る", "miru", ["sehen", "anschauen"], "verb-ichidan", "N5", 1, ["basics"], {
    related: ["eiga"],
  }),
  v("yomu", "読[よ]む", "yomu", ["lesen"], "verb-godan", "N5", 1, ["basics"], { related: ["hon"] }),
  v("wakaru", "分[わ]かる", "wakaru", ["verstehen", "wissen"], "verb-godan", "N5", 1, ["basics"], {
    noteDe: "Das Verstandene steht mit が: 日本語が分かります。",
  }),
  v(
    "aru",
    "ある",
    "aru",
    ["vorhanden sein", "es gibt (Dinge)"],
    "verb-godan",
    "N5",
    1,
    ["basics"],
    {
      noteDe: "Für Dinge und Pflanzen; für Menschen und Tiere: いる.",
      related: ["iru"],
    },
  ),
  v("iru", "いる", "iru", ["da sein", "es gibt (Lebewesen)"], "verb-ichidan", "N5", 1, ["basics"], {
    noteDe:
      "Für Menschen und Tiere; für Dinge: ある. Nicht verwechseln mit 要る（いる）„brauchen“.",
    related: ["aru"],
  }),
  v("matsu", "待[ま]つ", "matsu", ["warten"], "verb-godan", "N5", 1, ["basics"]),
  v("suwaru", "座[すわ]る", "suwaru", ["sich setzen", "sitzen"], "verb-godan", "N5", 2, ["basics"]),

  // ---------- Adjektive ----------
  v("ookii", "大[おお]きい", "ōkii", ["groß"], "adj-i", "N5", 1, ["basics"], {
    related: ["chiisai"],
  }),
  v("chiisai", "小[ちい]さい", "chiisai", ["klein"], "adj-i", "N5", 1, ["basics"], {
    related: ["ookii"],
  }),
  v(
    "daijoubu",
    "大丈夫[だいじょうぶ]",
    "daijōbu",
    ["in Ordnung", "alles gut", "nein danke (Ablehnung)"],
    "adj-na",
    "N4",
    1,
    ["konbini", "basics"],
    {
      noteDe:
        "Sehr vielseitig: „Geht es dir gut?“ – 大丈夫？ An der Kasse bedeutet 大丈夫です meist eine höfliche Ablehnung: „Nein danke, passt so.“",
    },
  ),

  // ---------- Fragewörter und Hinweise ----------
  v("nani", "何[なに]", "nani", ["was"], "question", "N5", 1, ["basics"], {
    noteDe: "Vor です, の und Zählwörtern meist なん gelesen: 何ですか（なんですか）.",
  }),
  v("doko", "どこ", "doko", ["wo"], "question", "N5", 1, ["directions"]),
  v("kore", "これ", "kore", ["dies (hier, beim Sprecher)"], "pronoun", "N5", 1, ["shopping"]),

  // ---------- Feste Ausdrücke ----------
  v(
    "konnichiwa",
    "こんにちは",
    "konnichiwa",
    ["Guten Tag", "Hallo"],
    "expression",
    "N5",
    1,
    ["greeting"],
    {
      noteDe: "Das letzte は wird „wa“ gesprochen.",
    },
  ),
  v(
    "arigatou",
    "ありがとうございます",
    "arigatō gozaimasu",
    ["Vielen Dank"],
    "expression",
    "N5",
    1,
    ["greeting"],
  ),
  v(
    "sumimasen",
    "すみません",
    "sumimasen",
    ["Entschuldigung", "Verzeihung", "Danke (für Mühe)"],
    "expression",
    "N5",
    1,
    ["greeting", "restaurant"],
    {
      noteDe: "Auch, um im Restaurant das Personal zu rufen.",
    },
  ),
  v(
    "onegaishimasu",
    "お願[ねが]いします",
    "onegai shimasu",
    ["bitte (bei einer Bitte)"],
    "expression",
    "N5",
    1,
    ["restaurant", "hotel"],
    {
      related: ["kudasai"],
    },
  ),
  v(
    "kudasai",
    "ください",
    "kudasai",
    ["bitte geben Sie mir …", "bitte (tun Sie …)"],
    "expression",
    "N5",
    1,
    ["restaurant", "shopping"],
    {
      related: ["onegaishimasu"],
    },
  ),
  v(
    "hajimemashite",
    "はじめまして",
    "hajimemashite",
    ["Freut mich (beim ersten Treffen)"],
    "expression",
    "N5",
    1,
    ["introduction"],
    {
      noteDe: "Nur beim allerersten Kennenlernen, meist am Anfang der Vorstellung.",
      related: ["yoroshiku"],
    },
  ),
  v(
    "yoroshiku",
    "よろしくお願[ねが]いします",
    "yoroshiku onegai shimasu",
    ["Freut mich", "Auf gute Zusammenarbeit"],
    "expression",
    "N5",
    1,
    ["introduction", "work"],
    {
      noteDe:
        "Kein direktes deutsches Gegenstück: drückt die Bitte um ein gutes Miteinander aus – am Ende einer Vorstellung oder vor einer Zusammenarbeit.",
      related: ["hajimemashite"],
    },
  ),
];

const BY_ID = new Map(VOCABULARY.map((word) => [word.id, word]));

export function getVocabulary(id: string): Vocabulary | undefined {
  return BY_ID.get(id);
}

export const PART_OF_SPEECH_LABELS: Record<PartOfSpeech, string> = {
  noun: "Nomen",
  pronoun: "Pronomen",
  "verb-godan": "Verb (Godan)",
  "verb-ichidan": "Verb (Ichidan)",
  "verb-irregular": "Verb (unregelmäßig)",
  "verb-suru": "Verb (mit する)",
  "adj-i": "i-Adjektiv",
  "adj-na": "na-Adjektiv",
  adverb: "Adverb",
  question: "Fragewort",
  counter: "Zählwort",
  expression: "Ausdruck",
};

export const TAG_LABELS: Record<string, string> = {
  food: "Essen & Trinken",
  restaurant: "Restaurant",
  cafe: "Café",
  konbini: "Konbini",
  shopping: "Einkaufen",
  station: "Bahnhof",
  hotel: "Hotel",
  travel: "Reisen",
  directions: "Weg fragen",
  time: "Zeit",
  introduction: "Vorstellen",
  friends: "Freunde",
  work: "Arbeit",
  greeting: "Begrüßung",
  basics: "Grundlagen",
};

export const FREQUENCY_LABELS: Record<FrequencyTier, string> = {
  1: "sehr häufig",
  2: "häufig",
  3: "gelegentlich",
};
