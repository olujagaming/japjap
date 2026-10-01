import type { Metadata } from "next";
import { PageHeader } from "@/components/layout/page-header";
import { UpcomingSection } from "@/components/layout/upcoming-section";

export const metadata: Metadata = { title: "Favoriten" };

export default function FavoritesPage() {
  return (
    <>
      <PageHeader
        title="Favoriten"
        ja="お気に入り"
        description="Gespeicherte Wörter, Kanji, Grammatik, Gespräche und Sätze."
      />
      <UpcomingSection
        ja="お気に入り"
        title="Dieser Bereich wird gerade aufgebaut."
        description="Die Grundlagen der App stehen. Die Inhalte für diesen Bereich folgen in einem der nächsten Schritte."
        fallback={{ href: "/", label: "Zur Startseite" }}
        features={[
          "Tabs für Vokabeln, Kanji, Grammatik, Gespräche und Sätze",
          "Speichern mit einem Klick auf jeder Detailseite",
          "Direkte Aufnahme in die Wiederholung",
        ]}
      />
    </>
  );
}
