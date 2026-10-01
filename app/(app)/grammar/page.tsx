import type { Metadata } from "next";
import { GrammarBrowser } from "@/components/grammar/grammar-browser";
import { PageHeader } from "@/components/layout/page-header";

export const metadata: Metadata = { title: "Grammatik" };

export default function GrammarPage() {
  return (
    <>
      <PageHeader
        title="Grammatik"
        ja="文法"
        description="Zum Nachschlagen, wenn dir ein Muster in einem Satz begegnet: kurz erklärt und immer mit echten Beispielen. Gelernt wird Grammatik am besten im Kontext."
      />
      <GrammarBrowser />
    </>
  );
}
