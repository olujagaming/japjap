/**
 * Kana → Romaji (Hepburn) und tolerante Antwortprüfung für Eingaben in Romaji.
 * Lange Vokale werden als Doppelvokal ausgegeben (コーヒー → koohii); die
 * Prüfung normalisiert ō/ou/oo usw., damit alle üblichen Schreibweisen gelten.
 */

const BASE: Record<string, string> = {
  あ: "a",
  い: "i",
  う: "u",
  え: "e",
  お: "o",
  か: "ka",
  き: "ki",
  く: "ku",
  け: "ke",
  こ: "ko",
  さ: "sa",
  し: "shi",
  す: "su",
  せ: "se",
  そ: "so",
  た: "ta",
  ち: "chi",
  つ: "tsu",
  て: "te",
  と: "to",
  な: "na",
  に: "ni",
  ぬ: "nu",
  ね: "ne",
  の: "no",
  は: "ha",
  ひ: "hi",
  ふ: "fu",
  へ: "he",
  ほ: "ho",
  ま: "ma",
  み: "mi",
  む: "mu",
  め: "me",
  も: "mo",
  や: "ya",
  ゆ: "yu",
  よ: "yo",
  ら: "ra",
  り: "ri",
  る: "ru",
  れ: "re",
  ろ: "ro",
  わ: "wa",
  を: "wo",
  ん: "n",
  が: "ga",
  ぎ: "gi",
  ぐ: "gu",
  げ: "ge",
  ご: "go",
  ざ: "za",
  じ: "ji",
  ず: "zu",
  ぜ: "ze",
  ぞ: "zo",
  だ: "da",
  ぢ: "ji",
  づ: "zu",
  で: "de",
  ど: "do",
  ば: "ba",
  び: "bi",
  ぶ: "bu",
  べ: "be",
  ぼ: "bo",
  ぱ: "pa",
  ぴ: "pi",
  ぷ: "pu",
  ぺ: "pe",
  ぽ: "po",
  ゔ: "vu",
  ぁ: "a",
  ぃ: "i",
  ぅ: "u",
  ぇ: "e",
  ぉ: "o",
  ゃ: "ya",
  ゅ: "yu",
  ょ: "yo",
};

/** Zweizeichen-Kombinationen (Yōon und erweiterte Katakana, hier in Hiragana-Form). */
const COMBOS: Record<string, string> = {
  きゃ: "kya",
  きゅ: "kyu",
  きょ: "kyo",
  しゃ: "sha",
  しゅ: "shu",
  しょ: "sho",
  しぇ: "she",
  ちゃ: "cha",
  ちゅ: "chu",
  ちょ: "cho",
  ちぇ: "che",
  にゃ: "nya",
  にゅ: "nyu",
  にょ: "nyo",
  ひゃ: "hya",
  ひゅ: "hyu",
  ひょ: "hyo",
  みゃ: "mya",
  みゅ: "myu",
  みょ: "myo",
  りゃ: "rya",
  りゅ: "ryu",
  りょ: "ryo",
  ぎゃ: "gya",
  ぎゅ: "gyu",
  ぎょ: "gyo",
  じゃ: "ja",
  じゅ: "ju",
  じょ: "jo",
  じぇ: "je",
  ぢゃ: "ja",
  ぢゅ: "ju",
  ぢょ: "jo",
  びゃ: "bya",
  びゅ: "byu",
  びょ: "byo",
  ぴゃ: "pya",
  ぴゅ: "pyu",
  ぴょ: "pyo",
  ふぁ: "fa",
  ふぃ: "fi",
  ふぇ: "fe",
  ふぉ: "fo",
  てぃ: "ti",
  でぃ: "di",
  とぅ: "tu",
  でゅ: "dyu",
  うぃ: "wi",
  うぇ: "we",
  うぉ: "wo",
  ゔぁ: "va",
  ゔぃ: "vi",
  ゔぇ: "ve",
  ゔぉ: "vo",
};

/** Katakana → Hiragana (gleicher Unicode-Abstand). ー bleibt erhalten. */
export function toHiragana(text: string): string {
  return text.replace(/[ァ-ヶ]/g, (char) => String.fromCharCode(char.charCodeAt(0) - 0x60));
}

export function toRomaji(kana: string): string {
  const text = toHiragana(kana);
  let out = "";
  let geminate = false;
  let afterN = false;
  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    if (char === "っ") {
      geminate = true;
      continue;
    }
    if (char === "ー") {
      const lastVowel = out.match(/[aeiou]$/);
      if (lastVowel) out += lastVowel[0];
      continue;
    }
    const pair = text.slice(i, i + 2);
    let syllable = COMBOS[pair];
    if (syllable) i++;
    else syllable = BASE[char] ?? char;

    if (geminate) {
      out += syllable.startsWith("ch") ? "t" : syllable[0];
      geminate = false;
    }
    // ん vor Vokal oder y: Apostroph zur Eindeutigkeit (kan'i vs. kani)
    if (afterN && /^[aeiouy]/.test(syllable)) out += "'";
    afterN = char === "ん";
    out += syllable;
  }
  return out;
}

const MACRONS: Record<string, string> = {
  ā: "aa",
  ī: "ii",
  ū: "uu",
  ē: "ee",
  ō: "oo",
  â: "aa",
  î: "ii",
  û: "uu",
  ê: "ee",
  ô: "oo",
};

/**
 * Bringt Romaji in eine Vergleichsform: Kleinschreibung, keine Leer-/Satzzeichen,
 * Längenstriche aufgelöst, Kunrei-Varianten → Hepburn, „ou“ → „oo“, „nn“ → „n“.
 */
export function normalizeRomaji(input: string): string {
  let s = input.toLowerCase().normalize("NFC");
  s = s.replace(/[āīūēōâîûêô]/g, (m) => MACRONS[m]);
  s = s.replace(/[\s'’\-.,!?。、！？]/g, "");
  s = s
    .replace(/sy/g, "sh")
    .replace(/ty|cy/g, "ch")
    .replace(/zy|jy/g, "j")
    .replace(/si/g, "shi")
    .replace(/ti/g, "chi")
    .replace(/tu/g, "tsu")
    .replace(/(?<![sc])hu/g, "fu")
    .replace(/zi|di/g, "ji")
    .replace(/du/g, "zu")
    .replace(/tch/g, "cch")
    .replace(/wo/g, "o")
    .replace(/oh(?![aeiouy])/g, "oo")
    .replace(/ou/g, "oo")
    .replace(/nn/g, "n")
    .replace(/m(?=[bmp])/g, "n");
  return s;
}

/** Entfernt Vokallängen ganz – für die Erkennung „fast richtig“. */
function collapseLongVowels(normalized: string): string {
  return normalized.replace(/([aeiou])\1+/g, "$1").replace(/ei/g, "e");
}

export type AnswerVerdict = "correct" | "almost" | "incorrect";

/**
 * Bewertet eine Romaji-Eingabe gegen eine oder mehrere akzeptierte Lösungen.
 * „almost“: richtig bis auf Vokallänge oder Verdopplung – kein voller Fehler.
 */
export function checkRomajiAnswer(input: string, accepted: string[]): AnswerVerdict {
  const answer = normalizeRomaji(input);
  if (!answer) return "incorrect";
  const targets = accepted.map(normalizeRomaji);
  if (targets.includes(answer)) return "correct";
  const loose = (s: string) => collapseLongVowels(s).replace(/([kstcpgzdbfhjmnr])\1/g, "$1");
  if (targets.some((t) => loose(t) === loose(answer))) return "almost";
  return "incorrect";
}
