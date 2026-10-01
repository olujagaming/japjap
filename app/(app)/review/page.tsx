import type { Metadata } from "next";
import { PageHeader } from "@/components/layout/page-header";
import { UpcomingSection } from "@/components/layout/upcoming-section";

export const metadata: Metadata = { title: "Wiederholen" };

export default function ReviewPage() {
  return (
    <>
      <PageHeader
        title="Wiederholen"
        ja="復習"
        description="Spaced Repetition: Inhalte kurz bevor du sie vergisst."
      />
      <UpcomingSection
        ja="復習"
        title="Dieser Bereich wird gerade aufgebaut."
        description="Die Grundlagen der App stehen. Die Inhalte für diesen Bereich folgen in einem der nächsten Schritte."
        fallback={{ href: "/kana", label: "Zu den Kana" }}
        features={[
          "Gemischte Sessions aus Kana, Vokabeln, Kanji und Sätzen",
          "Texteingabe statt Multiple Choice, wo sinnvoll",
          "Bewertung mit Nochmal / Schwer / Gut / Leicht",
          "Verlauf und schwierige Inhalte",
        ]}
      />
    </>
  );
}
