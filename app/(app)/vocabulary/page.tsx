import type { Metadata } from "next";
import { Suspense } from "react";
import { PageHeader } from "@/components/layout/page-header";
import { LoadingState } from "@/components/ui/states";
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
      <Suspense fallback={<LoadingState />}>
        <VocabularyBrowser />
      </Suspense>
    </>
  );
}
