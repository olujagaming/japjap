import type { Metadata } from "next";
import { PageHeader } from "@/components/layout/page-header";
import { UpcomingSection } from "@/components/layout/upcoming-section";

export const metadata: Metadata = { title: "Gespräch üben" };

export default function PracticeConversationPage() {
  return (
    <>
      <PageHeader
        title="Gespräch üben"
        ja="練習"
        description="Freie Gespräche mit einem AI-Partner – in deinem Tempo und deiner Höflichkeitsstufe."
      />
      <UpcomingSection
        ja="練習"
        title="Dieser Bereich wird gerade aufgebaut."
        description="Die Grundlagen der App stehen. Die Inhalte für diesen Bereich folgen in einem der nächsten Schritte."
        fallback={{ href: "/settings", label: "Niveau einstellen" }}
        features={[
          "Situation, Partner und Höflichkeitsstufe wählen",
          "Der Partner spricht Japanisch, angepasst an dein Niveau",
          "Übersetzung, Lesung und Worterklärung auf Abruf",
          "Feedback zu Grammatik, Natürlichkeit und Höflichkeit",
        ]}
      />
    </>
  );
}
