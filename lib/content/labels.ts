import { getKanaById } from "@/data/kana";
import type { ContentType } from "@/types/content";
import { getConversation, getGrammar, getKanji, getVocabulary } from "./index";
import { getSentence } from "@/data/sentences";

export type ContentLabel = { japanese: string; german: string; href: string; typeLabel: string };

export const CONTENT_TYPE_LABELS: Record<ContentType, string> = {
  kana: "Kana",
  vocabulary: "Vokabel",
  kanji: "Kanji",
  grammar: "Grammatik",
  sentence: "Satz",
  expression: "Ausdruck",
  conversation: "Gespräch",
};

/** Anzeigename und Link für einen beliebigen Inhalt – für Listen, Verlauf und Dashboard. */
export function contentLabel(type: ContentType, id: string): ContentLabel | null {
  const typeLabel = CONTENT_TYPE_LABELS[type];
  switch (type) {
    case "kana": {
      const k = getKanaById(id);
      return k
        ? {
            japanese: k.character,
            german: k.romaji,
            href: `/kana/${encodeURIComponent(k.character)}`,
            typeLabel,
          }
        : null;
    }
    case "vocabulary": {
      const w = getVocabulary(id);
      return w
        ? { japanese: w.japanese, german: w.german[0], href: `/vocabulary/${w.id}`, typeLabel }
        : null;
    }
    case "kanji": {
      const k = getKanji(id);
      return k
        ? {
            japanese: k.character,
            german: k.meaningsDe[0],
            href: `/kanji/${encodeURIComponent(k.character)}`,
            typeLabel,
          }
        : null;
    }
    case "grammar": {
      const g = getGrammar(id);
      return g
        ? {
            japanese: g.pattern.split(" / ")[0],
            german: g.meaningDe,
            href: `/grammar/${g.slug}`,
            typeLabel,
          }
        : null;
    }
    case "conversation": {
      const c = getConversation(id);
      return c
        ? { japanese: c.titleJa, german: c.titleDe, href: `/conversations/${c.id}`, typeLabel }
        : null;
    }
    case "sentence": {
      const s = getSentence(id);
      return s ? { japanese: s.japanese, german: s.german, href: `/favorites`, typeLabel } : null;
    }
    default:
      return null;
  }
}
