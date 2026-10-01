"use client";

import { useState } from "react";
import { GrammarCard, KanjiCard, VocabularyCard } from "@/components/learning/content-cards";
import { JapaneseText } from "@/components/japanese/japanese-text";
import { FavoriteButton } from "@/components/learning/favorite-button";
import { ButtonLink } from "@/components/ui/button";
import { EmptyState, ErrorState, LoadingState } from "@/components/ui/states";
import { Tabs } from "@/components/ui/tabs";
import { getGrammar } from "@/data/grammar";
import { getKanji } from "@/data/kanji";
import { getSentence } from "@/data/sentences";
import { getVocabulary } from "@/data/vocabulary";
import { useFavorites } from "@/hooks/use-user-data";
import type { ContentType } from "@/types/content";

type Tab = Extract<ContentType, "vocabulary" | "kanji" | "grammar" | "conversation" | "sentence">;

const TABS: {
  value: Tab;
  label: string;
  empty: string;
  browse?: { href: string; label: string };
}[] = [
  {
    value: "vocabulary",
    label: "Vokabeln",
    empty: "Speichere Wörter auf ihrer Detailseite.",
    browse: { href: "/vocabulary", label: "Vokabeln entdecken" },
  },
  {
    value: "kanji",
    label: "Kanji",
    empty: "Speichere Kanji auf ihrer Detailseite.",
    browse: { href: "/kanji", label: "Kanji entdecken" },
  },
  {
    value: "grammar",
    label: "Grammatik",
    empty: "Speichere Grammatik, die du nachschlagen möchtest.",
    browse: { href: "/grammar", label: "Grammatik ansehen" },
  },
  { value: "conversation", label: "Gespräche", empty: "Gespeicherte Gespräche erscheinen hier." },
  {
    value: "sentence",
    label: "Sätze",
    empty: "Markiere Beispielsätze mit dem Stern, um sie hier zu sammeln.",
    browse: { href: "/vocabulary", label: "Zu den Vokabeln" },
  },
];

export function FavoritesView() {
  const [tab, setTab] = useState<Tab>("vocabulary");
  const { data: favorites, loading, error } = useFavorites(tab);
  const meta = TABS.find((t) => t.value === tab)!;

  let content: React.ReactNode;
  if (error) content = <ErrorState />;
  else if (loading) content = <LoadingState />;
  else if (favorites.length === 0)
    content = (
      <EmptyState
        ja="☆"
        title={`Noch keine ${meta.label} gespeichert.`}
        description={meta.empty}
        action={
          meta.browse ? (
            <ButtonLink href={meta.browse.href} variant="secondary">
              {meta.browse.label}
            </ButtonLink>
          ) : undefined
        }
      />
    );
  else
    content = (
      <ul
        className={
          tab === "sentence" ? "flex flex-col gap-3" : "grid gap-3 sm:grid-cols-2 lg:grid-cols-3"
        }
      >
        {favorites.map(({ contentId }) => {
          if (tab === "vocabulary") {
            const word = getVocabulary(contentId);
            return word ? (
              <li key={contentId}>
                <VocabularyCard word={word} />
              </li>
            ) : null;
          }
          if (tab === "kanji") {
            const kanji = getKanji(contentId);
            return kanji ? (
              <li key={contentId}>
                <KanjiCard kanji={kanji} />
              </li>
            ) : null;
          }
          if (tab === "grammar") {
            const point = getGrammar(contentId);
            return point ? (
              <li key={contentId}>
                <GrammarCard point={point} />
              </li>
            ) : null;
          }
          if (tab === "sentence") {
            const sentence = getSentence(contentId);
            return sentence ? (
              <li key={contentId} className="relative rounded-lg border border-line bg-surface p-4">
                <FavoriteButton
                  contentType="sentence"
                  contentId={contentId}
                  label="Satz"
                  className="absolute top-3 right-3"
                />
                <JapaneseText
                  japanese={sentence.japanese}
                  furigana={sentence.furigana}
                  reading={sentence.reading}
                  romaji={sentence.romaji}
                  german={sentence.german}
                />
              </li>
            ) : null;
          }
          return null;
        })}
      </ul>
    );

  return (
    <Tabs<Tab>
      label="Art der Favoriten"
      value={tab}
      onChange={setTab}
      items={TABS.map(({ value, label }) => ({ value, label }))}
    >
      {content}
    </Tabs>
  );
}
