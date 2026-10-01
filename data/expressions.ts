/**
 * Erste feste Ausdrücke – erscheinen auf der Startseite.
 * Übersetzungen sind kontextbezogen, nicht wörtlich.
 */
export type Expression = {
  id: string;
  japanese: string;
  furigana?: string;
  reading: string;
  romaji: string;
  german: string;
  noteDe: string;
};

export const FIRST_EXPRESSIONS: Expression[] = [
  {
    id: "ohayou-gozaimasu",
    japanese: "おはようございます",
    reading: "おはようございます",
    romaji: "ohayō gozaimasu",
    german: "Guten Morgen.",
    noteDe: "Höfliche Form; unter Freunden reicht おはよう.",
  },
  {
    id: "arigatou-gozaimasu",
    japanese: "ありがとうございます",
    reading: "ありがとうございます",
    romaji: "arigatō gozaimasu",
    german: "Vielen Dank.",
    noteDe: "Die Standardform gegenüber Fremden, im Laden oder im Restaurant.",
  },
  {
    id: "sumimasen",
    japanese: "すみません",
    reading: "すみません",
    romaji: "sumimasen",
    german: "Entschuldigung. / Verzeihung.",
    noteDe: "Auch, um Aufmerksamkeit zu bekommen – etwa beim Kellner – oder als leises „Danke“.",
  },
  {
    id: "daijoubu-desu",
    japanese: "大丈夫です",
    furigana: "大丈夫[だいじょうぶ]です",
    reading: "だいじょうぶです",
    romaji: "daijōbu desu",
    german: "Nein danke, passt so.",
    noteDe:
      "Wörtlich „Es ist in Ordnung“. An der Kasse eine höfliche Ablehnung, etwa wenn nach einer Tüte gefragt wird.",
  },
];
