import type { Metadata } from "next";
import { PageHeader } from "@/components/layout/page-header";
import { UpcomingSection } from "@/components/layout/upcoming-section";

export const metadata: Metadata = { title: "Kana" };

export default function KanaPage() {
  return (
    <>
      <PageHeader
        title="Kana"
        ja="かな"
        description="Hiragana und Katakana: die beiden Silbenschriften, mit denen alles beginnt."
      />
      <UpcomingSection
        ja="かな"
        title="Dieser Bereich wird gerade aufgebaut."
        description="Die Grundlagen der App stehen. Die Inhalte für diesen Bereich folgen in einem der nächsten Schritte."
        fallback={{ href: "/", label: "Erste Ausdrücke ansehen" }}
        features={[
          "Vollständige Tabellen inkl. Dakuten, Handakuten und Kombinationen",
          "Detailseite je Zeichen mit Audio, Beispielwörtern und Verwechslungen",
          "Übungen: Erkennen, Abrufen, Hören, Lesen, Verwechslungstraining",
          "Persönlicher Lernstatus und Problemzeichen",
        ]}
      />
    </>
  );
}
