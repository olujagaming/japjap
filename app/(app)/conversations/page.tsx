import type { Metadata } from "next";
import { ConversationBrowser } from "@/components/conversation/conversation-browser";
import { PageHeader } from "@/components/layout/page-header";
import { ButtonLink } from "@/components/ui/button";
import { listConversations, listSituations } from "@/lib/content";
import { summarizeConversation } from "@/lib/content/conversation-data";

export const metadata: Metadata = { title: "Gespräche" };

export default function ConversationsPage() {
  return (
    <>
      <PageHeader
        title="Gespräche"
        ja="会話"
        description="Natürliche Dialoge aus dem Alltag – lesen, hören, Zeile für Zeile verstehen und im Rollenspiel selbst sprechen."
        actions={
          <ButtonLink href="/practice/conversation" variant="secondary">
            Freies Gespräch üben
          </ButtonLink>
        }
      />
      <ConversationBrowser
        conversations={listConversations().map(summarizeConversation)}
        situations={listSituations().map((s) => ({ id: s.id, titleDe: s.titleDe }))}
      />
    </>
  );
}
