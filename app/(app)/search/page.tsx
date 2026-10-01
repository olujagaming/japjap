import type { Metadata } from "next";
import { Suspense } from "react";
import { PageHeader } from "@/components/layout/page-header";
import { GlobalSearch } from "@/components/search/global-search";
import { LoadingState } from "@/components/ui/states";

export const metadata: Metadata = { title: "Suche" };

export default function SearchPage() {
  return (
    <div className="max-w-3xl">
      <PageHeader
        title="Suche"
        ja="検索"
        description="Kana, Vokabeln, Kanji, Grammatik und Beispielsätze – auf Japanisch, in Romaji oder auf Deutsch."
      />
      <Suspense fallback={<LoadingState />}>
        <GlobalSearch />
      </Suspense>
    </div>
  );
}
