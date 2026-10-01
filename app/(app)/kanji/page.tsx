import type { Metadata } from "next";
import { PageHeader } from "@/components/layout/page-header";
import { UpcomingSection } from "@/components/layout/upcoming-section";

export const metadata: Metadata = { title: "Kanji" };

export default function KanjiPage() {
  return (
    <>
      <PageHeader
        title="Kanji"
        ja="漢字"
        description="Schriftzeichen mit Bedeutung, Lesungen und Bestandteilen erkunden."
      />
      <UpcomingSection
        ja="漢字"
        title="Dieser Bereich wird gerade aufgebaut."
        description="Die Grundlagen der App stehen. Die Inhalte für diesen Bereich folgen in einem der nächsten Schritte."
        fallback={{ href: "/kana", label: "Erst Kana festigen" }}
        features={[
          "Kanji-Raster mit Filtern nach JLPT, Strichzahl und Radikal",
          "On- und Kun-Lesungen mit Beispielwörtern",
          "Bestandteile, Radikal und Strichreihenfolge",
          "Verwandte Kanji und Lernstatus",
        ]}
      />
    </>
  );
}
