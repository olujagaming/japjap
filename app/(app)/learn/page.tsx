import type { Metadata } from "next";
import { PageHeader } from "@/components/layout/page-header";
import { UpcomingSection } from "@/components/layout/upcoming-section";

export const metadata: Metadata = { title: "Lernen" };

export default function LearnPage() {
  return (
    <>
      <PageHeader
        title="Lernen"
        ja="学ぶ"
        description="Geführte Lernpfade – frei kombinierbar, nie ein starrer Kurs."
      />
      <UpcomingSection
        ja="学ぶ"
        title="Dieser Bereich wird gerade aufgebaut."
        description="Die Grundlagen der App stehen. Die Inhalte für diesen Bereich folgen in einem der nächsten Schritte."
        fallback={{ href: "/settings", label: "Lesehilfen einstellen" }}
        features={[
          "Foundations: Hiragana, Katakana, Aussprache, erste Wörter",
          "Everyday Japanese: Begrüßen, Einkaufen, Restaurant, Verkehr",
          "Travel: Flughafen, Hotel, Bahnhof, Orientierung",
          "Social und Advanced: Freunde, Pläne, Arbeitsplatz, formelle Sprache",
        ]}
      />
    </>
  );
}
