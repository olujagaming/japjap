import type { Metadata } from "next";
import { PageHeader } from "@/components/layout/page-header";
import { UpcomingSection } from "@/components/layout/upcoming-section";

export const metadata: Metadata = { title: "Vokabeln" };

export default function VocabularyPage() {
  return (
    <>
      <PageHeader
        title="Vokabeln"
        ja="語彙"
        description="Dein Wortschatz – durchsuchbar, verknüpft mit Kanji, Sätzen und Gesprächen."
      />
      <UpcomingSection
        ja="語彙"
        title="Dieser Bereich wird gerade aufgebaut."
        description="Die Grundlagen der App stehen. Die Inhalte für diesen Bereich folgen in einem der nächsten Schritte."
        fallback={{ href: "/search", label: "Zur Suche" }}
        features={[
          "Wörter mit Lesung, Romaji, Deutsch und Audio",
          "Filter nach JLPT, Wortart, Situation und Status",
          "Beispielsätze und Gespräche, in denen das Wort vorkommt",
          "Favoriten und Aufnahme in die Wiederholung",
        ]}
      />
    </>
  );
}
