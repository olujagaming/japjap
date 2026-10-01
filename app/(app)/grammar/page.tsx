import type { Metadata } from "next";
import { PageHeader } from "@/components/layout/page-header";
import { UpcomingSection } from "@/components/layout/upcoming-section";

export const metadata: Metadata = { title: "Grammatik" };

export default function GrammarPage() {
  return (
    <>
      <PageHeader
        title="Grammatik"
        ja="文法"
        description="Grammatik als Nachschlagewerk – kompakt erklärt, immer mit Beispielen aus echten Gesprächen."
      />
      <UpcomingSection
        ja="文法"
        title="Dieser Bereich wird gerade aufgebaut."
        description="Die Grundlagen der App stehen. Die Inhalte für diesen Bereich folgen in einem der nächsten Schritte."
        fallback={{ href: "/search", label: "Zur Suche" }}
        features={[
          "Muster mit Bedeutung, Struktur und Verwendung",
          "Natürliche Beispiele und typische Fehler",
          "Ähnliche Grammatik im Vergleich",
          "Gespräche, in denen das Muster vorkommt",
        ]}
      />
    </>
  );
}
