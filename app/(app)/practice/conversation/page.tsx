import type { Metadata } from "next";
import { AIConversation } from "@/components/ai/ai-conversation";
import { PageHeader } from "@/components/layout/page-header";
import { isAIConfigured } from "@/lib/ai";
import { conversationsForSituation, listSituations } from "@/lib/content";

export const metadata: Metadata = { title: "Gespräch üben" };

// Ob ein API-Schlüssel hinterlegt ist, entscheidet sich zur Laufzeit.
export const dynamic = "force-dynamic";

export default async function PracticeConversationPage({
  searchParams,
}: PageProps<"/practice/conversation">) {
  const situationParam = (await searchParams).situation;
  const situations = listSituations().map((s) => ({
    slug: s.slug,
    titleDe: s.titleDe,
    titleJa: s.titleJa,
    firstConversationId: conversationsForSituation(s.id)[0]?.id,
  }));
  const initial =
    typeof situationParam === "string" && situations.some((s) => s.slug === situationParam)
      ? situationParam
      : undefined;

  return (
    <>
      <PageHeader
        title="Gespräch üben"
        ja="会話練習"
        description="Freie Gespräche mit einem AI-Partner – in deinem Tempo, auf deinem Niveau und in der passenden Höflichkeitsstufe."
      />
      <AIConversation
        aiAvailable={isAIConfigured()}
        situations={situations}
        initialSituation={initial}
      />
    </>
  );
}
