import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ListeningMode } from "@/components/conversation/listening-mode";
import { BackLink } from "@/components/layout/back-link";
import { PageHeader } from "@/components/layout/page-header";
import { getConversation, listConversations } from "@/lib/content";
import { conversationLookups } from "@/lib/content/conversation-data";

export function generateStaticParams() {
  return listConversations().map((c) => ({ id: c.id }));
}

export async function generateMetadata({
  params,
}: PageProps<"/conversations/[id]/listen">): Promise<Metadata> {
  const conversation = getConversation((await params).id);
  return conversation ? { title: `Hören: ${conversation.titleDe}` } : {};
}

export default async function ListenPage({ params }: PageProps<"/conversations/[id]/listen">) {
  const conversation = getConversation((await params).id);
  if (!conversation) notFound();
  const { words, grammar } = conversationLookups(conversation);

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6">
      <BackLink href={`/conversations/${conversation.id}`}>Zum Gespräch</BackLink>
      <PageHeader
        title={`Hören: ${conversation.titleDe}`}
        ja="聞き取り"
        description="Erst nur hören. Hilfen kommen Schritt für Schritt dazu – so trainierst du echtes Hörverstehen."
      />
      <ListeningMode conversation={conversation} words={words} grammar={grammar} />
    </div>
  );
}
