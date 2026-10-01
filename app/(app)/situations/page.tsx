import type { Metadata } from "next";
import { PageHeader } from "@/components/layout/page-header";
import { SituationBrowser } from "@/components/situations/situation-browser";
import { conversationsForSituation, listSituations } from "@/lib/content";

export const metadata: Metadata = { title: "Situationen" };

export default function SituationsPage() {
  const situations = listSituations().map((s) => ({
    slug: s.slug,
    titleJa: s.titleJa,
    titleDe: s.titleDe,
    difficulty: s.difficulty,
    category: s.category,
    conversationIds: conversationsForSituation(s.id).map((c) => c.id),
  }));
  return (
    <>
      <PageHeader
        title="Situationen"
        ja="場面"
        description="Japanisch dort lernen, wo du es brauchst: Ausdrücke, Wörter, Gespräche und kulturelle Hinweise für jede Situation."
      />
      <SituationBrowser situations={situations} />
    </>
  );
}
