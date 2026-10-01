import type { Metadata } from "next";
import { PageHeader } from "@/components/layout/page-header";
import { UpcomingSection } from "@/components/layout/upcoming-section";

export const metadata: Metadata = { title: "Suche" };

export default function SearchPage() {
  return (
    <>
      <PageHeader
        title="Suche"
        ja="検索"
        description="Suche auf Japanisch, in Kana, Romaji oder Deutsch."
      />
      <UpcomingSection
        ja="検索"
        title="Dieser Bereich wird gerade aufgebaut."
        description="Die Grundlagen der App stehen. Die Inhalte für diesen Bereich folgen in einem der nächsten Schritte."
        fallback={{ href: "/", label: "Zur Startseite" }}
        features={[
          "Ergebnisse gruppiert nach Kana, Kanji, Vokabeln, Grammatik, Gesprächen",
          "Eingabe in Kanji, Hiragana, Katakana, Romaji oder Deutsch",
          "Schnellzugriff mit Cmd/Strg + K",
          "Direkter Sprung zu jeder Detailseite",
        ]}
      />
    </>
  );
}
