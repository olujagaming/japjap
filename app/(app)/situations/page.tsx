import type { Metadata } from "next";
import { PageHeader } from "@/components/layout/page-header";
import { UpcomingSection } from "@/components/layout/upcoming-section";

export const metadata: Metadata = { title: "Situationen" };

export default function SituationsPage() {
  return (
    <>
      <PageHeader
        title="Situationen"
        ja="場面"
        description="Japanisch dort lernen, wo du es brauchst: Konbini, Café, Bahnhof, Hotel."
      />
      <UpcomingSection
        ja="場面"
        title="Dieser Bereich wird gerade aufgebaut."
        description="Die Grundlagen der App stehen. Die Inhalte für diesen Bereich folgen in einem der nächsten Schritte."
        fallback={{ href: "/", label: "Erste Ausdrücke ansehen" }}
        features={[
          "Zehn Alltagssituationen mit Schlüsselausdrücken",
          "Vokabeln und kulturelle Hinweise je Situation",
          "Mehrere typische Dialoge pro Situation",
          "Rollenspiel zum Üben",
        ]}
      />
    </>
  );
}
