import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Roleplay } from "@/components/conversation/roleplay";
import { BackLink } from "@/components/layout/back-link";
import { PageHeader } from "@/components/layout/page-header";
import { getConversation, listConversations } from "@/lib/content";

export function generateStaticParams() {
  return listConversations().map((c) => ({ id: c.id }));
}

export async function generateMetadata({
  params,
}: PageProps<"/conversations/[id]/practice">): Promise<Metadata> {
  const conversation = getConversation((await params).id);
  return conversation ? { title: `Rollenspiel: ${conversation.titleDe}` } : {};
}

export default async function RoleplayPage({ params }: PageProps<"/conversations/[id]/practice">) {
  const conversation = getConversation((await params).id);
  if (!conversation) notFound();
  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6">
      <BackLink href={`/conversations/${conversation.id}`}>Zum Gespräch</BackLink>
      <PageHeader
        title={`Rollenspiel: ${conversation.titleDe}`}
        ja="ロールプレイ"
        description={conversation.descriptionDe}
      />
      <Roleplay conversation={conversation} />
    </div>
  );
}
