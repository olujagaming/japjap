import type { Metadata } from "next";
import { PageHeader } from "@/components/layout/page-header";
import { UpcomingSection } from "@/components/layout/upcoming-section";

export const metadata: Metadata = { title: "Gespräche" };

export default function ConversationsPage() {
  return (
    <>
      <PageHeader
        title="Gespräche"
        ja="会話"
        description="Natürliche Dialoge lesen, hören und Zeile für Zeile verstehen."
      />
      <UpcomingSection
        ja="会話"
        title="Dieser Bereich wird gerade aufgebaut."
        description="Die Grundlagen der App stehen. Die Inhalte für diesen Bereich folgen in einem der nächsten Schritte."
        fallback={{ href: "/", label: "Erste Ausdrücke ansehen" }}
        features={[
          "Dialoge mit Audio, Furigana, Romaji und Übersetzung je Zeile",
          "Anklickbare Vokabeln und Grammatik in jeder Zeile",
          "Listening-Modus: erst hören, dann schrittweise Hilfen",
          "Filter nach Niveau, Situation und Länge",
        ]}
      />
    </>
  );
}
