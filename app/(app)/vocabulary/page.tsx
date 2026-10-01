import type { Metadata } from "next";
import { PageHeader } from "@/components/layout/page-header";
import { VocabularyBrowser } from "@/components/vocabulary/vocabulary-browser";
import { VOCABULARY } from "@/data/vocabulary";

export const metadata: Metadata = { title: "Vokabeln" };

export default function VocabularyPage() {
  return (
    <>
      <PageHeader
        title="Vokabeln"
        ja="語彙"
        description={`${VOCABULARY.length} Wörter für Alltag und Reisen – jedes verknüpft mit Kanji, Beispielsätzen und Grammatik.`}
      />
      <VocabularyBrowser />
    </>
  );
}
