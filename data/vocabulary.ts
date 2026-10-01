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

  // ---------- Aus den Gesprächen ----------
  v(
    "ohayou",
    "おはようございます",
    "ohayō gozaimasu",
    ["Guten Morgen"],
    "expression",
    "N5",
    1,
    ["greeting"],
    {
      noteDe:
        "Unter Freunden reicht おはよう. Am Arbeitsplatz oft den ganzen Tag über als erste Begrüßung.",
      related: ["konnichiwa"],
    },
  ),
  v("tenki", "天気[てんき]", "tenki", ["Wetter"], "noun", "N5", 1, ["greeting"]),
  v("atatakai", "暖[あたた]かい", "atatakai", ["warm (Wetter, Temperatur)"], "adj-i", "N5", 1, [
    "greeting",
  ]),
  v(
    "itterasshai",
    "いってらっしゃい",
    "itterasshai",
    ["Bis später! (zu jemandem, der weggeht)"],
    "expression",
    "N5",
    2,
    ["greeting"],
    {
      noteDe: "Antwort auf いってきます – wörtlich „Geh und komm wieder“.",
      related: ["ittekimasu"],
    },
  ),
  v(
    "ittekimasu",
    "いってきます",
    "ittekimasu",
    ["Bis später! (beim Weggehen)"],
    "expression",
    "N5",
    2,
    ["greeting"],
    {
      noteDe:
        "Sagt man beim Verlassen des Hauses oder Büros – wörtlich „Ich gehe und komme wieder“.",
      related: ["itterasshai"],
    },
  ),
  v(
    "jouzu",
    "上手[じょうず]",
    "jōzu",
    ["gut (in etwas)", "geschickt"],
    "adj-na",
    "N5",
    1,
    ["introduction"],
    {
      noteDe:
        "Über andere höflich お上手. Ein Kompliment wehrt man bescheiden ab: いいえ、まだまだです。",
    },
  ),
  v("hajimete", "初[はじ]めて", "hajimete", ["zum ersten Mal"], "adverb", "N5", 1, [
    "introduction",
  ]),
  v(
    "kochirakoso",
    "こちらこそ",
    "kochira koso",
    ["ganz meinerseits", "ich habe zu danken"],
    "expression",
    "N5",
    2,
    ["introduction"],
    {
      related: ["yoroshiku"],
    },
  ),
  v("daigaku", "大学[だいがく]", "daigaku", ["Universität"], "noun", "N5", 1, ["introduction"], {
    related: ["gakusei"],
  }),
  v("sugoi", "すごい", "sugoi", ["toll", "beeindruckend", "unglaublich"], "adj-i", "N4", 1, [
    "friends",
  ]),
  v("ryouri", "料理[りょうり]", "ryōri", ["Kochen", "Gericht, Küche"], "noun", "N5", 1, [
    "friends",
    "food",
  ]),
  v("boku", "僕[ぼく]", "boku", ["ich (männlich, locker)"], "pronoun", "N5", 2, ["friends"], {
    noteDe: "Lockeres „ich“, vor allem von Männern verwendet. Neutral und höflich ist 私.",
    related: ["watashi"],
  }),
  v("denchi", "電池[でんち]", "denchi", ["Batterie"], "noun", "N3", 3, ["konbini", "shopping"]),
  v("iriguchi", "入[い]り口[ぐち]", "iriguchi", ["Eingang"], "noun", "N5", 2, [
    "directions",
    "shopping",
  ]),
  v(
    "chuumon",
    "注文[ちゅうもん]",
    "chūmon",
    ["Bestellung"],
    "noun",
    "N4",
    2,
    ["restaurant", "cafe"],
    {
      noteDe: "Das Personal fragt höflich: ご注文はお決まりですか。",
    },
  ),
  v("saizu", "サイズ", "saizu", ["Größe"], "noun", null, 2, ["cafe", "shopping"]),
  v(
    "tennai",
    "店内[てんない]",
    "tennai",
    ["im Laden", "vor Ort (zum Hieressen)"],
    "noun",
    null,
    2,
    ["cafe"],
    {
      related: ["mochikaeri"],
    },
  ),
  v(
    "mochikaeri",
    "持[も]ち帰[かえ]り",
    "mochikaeri",
    ["zum Mitnehmen"],
    "noun",
    null,
    2,
    ["cafe", "restaurant"],
    {
      noteDe:
        "Auf die Frage 店内でお召し上がりですか antwortet man: 持ち帰りで。 („Zum Mitnehmen.“)",
      related: ["tennai"],
    },
  ),
  v(
    "kashikomarimashita",
    "かしこまりました",
    "kashikomarimashita",
    ["Sehr gern.", "Verstanden. (Personal zu Kunden)"],
    "expression",
    null,
    2,
    ["cafe", "restaurant", "hotel"],
    {
      noteDe:
        "Sehr höfliche Bestätigung, die du vom Personal hörst. Selbst sagst du einfach 分かりました.",
    },
  ),
  v("osusume", "おすすめ", "osusume", ["Empfehlung"], "noun", "N4", 2, ["cafe", "restaurant"]),
  v("matcha", "抹茶[まっちゃ]", "matcha", ["Matcha (Grüntee-Pulver)"], "noun", null, 3, ["cafe"]),
  v(
    "shoushou",
    "少々[しょうしょう]",
    "shōshō",
    ["ein wenig (sehr höflich)"],
    "adverb",
    "N4",
    2,
    ["restaurant", "cafe"],
    {
      noteDe: "Fast immer in 少々お待ちください – „Einen Moment, bitte.“",
    },
  ),
  v(
    "futari",
    "二人[ふたり]",
    "futari",
    ["zwei Personen", "zu zweit"],
    "counter",
    "N5",
    1,
    ["restaurant"],
    {
      noteDe:
        "Personen zählt man: 一人（ひとり）, 二人（ふたり）, ab drei mit 人（にん）: 三人（さんにん）.",
    },
  ),
  v(
    "teishoku",
    "定食[ていしょく]",
    "teishoku",
    ["Menü, Tagesgericht (mit Reis und Suppe)"],
    "noun",
    null,
    2,
    ["restaurant"],
  ),
  v("biiru", "ビール", "bīru", ["Bier"], "noun", "N5", 2, ["restaurant"]),
  v("zenbu", "全部[ぜんぶ]", "zenbu", ["alles", "insgesamt"], "noun", "N5", 1, [
    "shopping",
    "restaurant",
  ]),
  v(
    "harau",
    "払[はら]う",
    "harau",
    ["bezahlen"],
    "verb-godan",
    "N5",
    1,
    ["shopping", "restaurant"],
    {
      related: ["genkin", "kaado"],
    },
  ),
  v("betsubetsu", "別々[べつべつ]", "betsubetsu", ["getrennt", "einzeln"], "adj-na", "N3", 3, [
    "restaurant",
  ]),
  v(
    "gochisousama",
    "ごちそうさまでした",
    "gochisōsama deshita",
    ["Danke für das Essen (nach dem Essen)"],
    "expression",
    "N5",
    1,
    ["restaurant", "food"],
    {
      noteDe:
        "Nach dem Essen, auch beim Verlassen eines Restaurants zum Personal. Vor dem Essen: いただきます.",
    },
  ),
  v("tsukau", "使[つか]う", "tsukau", ["benutzen", "verwenden"], "verb-godan", "N5", 1, [
    "station",
    "basics",
  ]),
  v("kaisatsu", "改札[かいさつ]", "kaisatsu", ["Ticketsperre (im Bahnhof)"], "noun", null, 2, [
    "station",
  ]),
  v("tomaru", "止[と]まる", "tomaru", ["anhalten", "halten"], "verb-godan", "N5", 2, ["station"]),
  v(
    "noru",
    "乗[の]る",
    "noru",
    ["einsteigen", "fahren mit"],
    "verb-godan",
    "N5",
    1,
    ["station", "travel"],
    {
      noteDe: "Das Verkehrsmittel steht mit に: 電車に乗ります。",
    },
  ),
  v("tsugi", "次[つぎ]", "tsugi", ["nächste(r)", "folgende(r)"], "noun", "N5", 1, [
    "station",
    "directions",
  ]),
  v("kyuukou", "急行[きゅうこう]", "kyūkō", ["Eilzug (hält nicht überall)"], "noun", "N4", 3, [
    "station",
  ]),
  v(
    "tasukarimashita",
    "助[たす]かりました",
    "tasukarimashita",
    ["Das hat mir sehr geholfen."],
    "expression",
    null,
    2,
    ["directions", "station"],
    {
      noteDe: "Herzlicher als nur ありがとう – zeigt, dass die Hilfe wirklich etwas bewirkt hat.",
    },
  ),
  v("pasupooto", "パスポート", "pasupōto", ["Reisepass"], "noun", "N5", 2, ["hotel", "travel"]),
  v("mochiron", "もちろん", "mochiron", ["natürlich", "selbstverständlich"], "adverb", "N4", 1, [
    "basics",
  ]),
  v("shichaku", "試着[しちゃく]", "shichaku", ["Anprobe", "Anprobieren"], "noun", null, 3, [
    "shopping",
  ]),
  v("choudo", "ちょうど", "chōdo", ["genau", "gerade richtig"], "adverb", "N4", 2, ["shopping"]),
  v("hima", "暇[ひま]", "hima", ["frei", "Zeit haben"], "adj-na", "N5", 1, ["friends"]),
  v("doyoubi", "土曜日[どようび]", "doyōbi", ["Samstag"], "noun", "N5", 1, ["time", "friends"]),
  v("atarashii", "新[あたら]しい", "atarashii", ["neu"], "adj-i", "N5", 1, ["basics"]),
  v("au", "会[あ]う", "au", ["treffen", "sich treffen"], "verb-godan", "N5", 1, ["friends"], {
    noteDe: "Die Person steht mit に oder と: 友達に会う。",
    related: ["tomodachi"],
  }),
  v("mae", "前[まえ]", "mae", ["vor", "vorne", "vorher"], "noun", "N5", 1, ["directions", "time"]),
  v("shingou", "信号[しんごう]", "shingō", ["Ampel"], "noun", "N4", 2, ["directions"]),
  v("magaru", "曲[ま]がる", "magaru", ["abbiegen"], "verb-godan", "N5", 2, ["directions"], {
    related: ["migi", "hidari"],
  }),
  v("aruku", "歩[ある]く", "aruku", ["zu Fuß gehen", "laufen"], "verb-godan", "N5", 1, [
    "directions",
  ]),
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
