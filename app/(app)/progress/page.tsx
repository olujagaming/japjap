import type { Metadata } from "next";
import { PageHeader } from "@/components/layout/page-header";
import { UpcomingSection } from "@/components/layout/upcoming-section";

export const metadata: Metadata = { title: "Fortschritt" };

export default function ProgressPage() {
  return (
    <>
      <PageHeader
        title="Fortschritt"
        ja="進歩"
        description="Wie dein Wissen wächst – ruhig dargestellt, ohne Punkte und Ranglisten."
      />
      <UpcomingSection
        ja="進歩"
        title="Dieser Bereich wird gerade aufgebaut."
        description="Die Grundlagen der App stehen. Die Inhalte für diesen Bereich folgen in einem der nächsten Schritte."
        fallback={{ href: "/", label: "Zur Startseite" }}
        features={[
          "Schriftsysteme: Hiragana und Katakana",
          "Vokabeln, Kanji und Grammatik nach Lernstatus",
          "Abgeschlossene Gespräche und Hörpraxis",
          "Dezenter Aktivitätsverlauf und persönliche Schwächen",
        ]}
      />
    </>
  );
}
