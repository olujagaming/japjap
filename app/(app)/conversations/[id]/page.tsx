import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ConversationView } from "@/components/conversation/conversation-view";
import { BackLink } from "@/components/layout/back-link";
import { SectionHeader } from "@/components/layout/page-header";
import { DifficultyBadge } from "@/components/learning/badges";
import { ConversationCard } from "@/components/learning/content-cards";
import { Badge } from "@/components/ui/badge";
import { conversationLookups, summarizeConversation } from "@/lib/content/conversation-data";
import {
  conversationMinutes,
  conversationsForSituation,
  getConversation,
  getSituation,
  listConversations,
} from "@/lib/content";

export function generateStaticParams() {
  return listConversations().map((c) => ({ id: c.id }));
}

export async function generateMetadata({
  params,
}: PageProps<"/conversations/[id]">): Promise<Metadata> {
  const conversation = getConversation((await params).id);
  return conversation ? { title: `${conversation.titleJa} – ${conversation.titleDe}` } : {};
}

export default async function ConversationPage({ params }: PageProps<"/conversations/[id]">) {
  const conversation = getConversation((await params).id);
  if (!conversation) notFound();

  const situation = getSituation(conversation.situationId)!;
  const { words, grammar } = conversationLookups(conversation);
  const more = conversationsForSituation(situation.id).filter((c) => c.id !== conversation.id);

  return (
    <article className="mx-auto flex max-w-3xl flex-col gap-10">
      <BackLink href="/conversations">Alle Gespräche</BackLink>
      <header className="flex flex-col gap-3">
        <h1 lang="ja" className="font-jp text-3xl font-medium sm:text-4xl">
          {conversation.titleJa}
        </h1>
        <p className="text-xl text-fg/90">{conversation.titleDe}</p>
        <p className="max-w-2xl text-[0.95rem] leading-relaxed text-muted">
          {conversation.descriptionDe}
        </p>
        <div className="flex flex-wrap items-center gap-2">
          <Link href={`/situations/${situation.slug}`}>
            <Badge tone="accent">
              <span lang="ja">{situation.titleJa}</span> {situation.titleDe}
            </Badge>
          </Link>
          <DifficultyBadge difficulty={conversation.difficulty} />
          {conversation.jlptEstimate ? <Badge>≈ {conversation.jlptEstimate}</Badge> : null}
          <Badge>{conversationMinutes(conversation)} min</Badge>
          <Badge tone={conversation.register === "casual" ? "kohaku" : "neutral"}>
            {conversation.register === "casual" ? "locker" : "höflich"}
          </Badge>
        </div>
      </header>

      <ConversationView conversation={conversation} words={words} grammar={grammar} />

      {more.length > 0 ? (
        <section>
          <SectionHeader title="Weitere Gespräche in dieser Situation" />
          <ul className="grid gap-3 sm:grid-cols-2">
            {more.map((c) => (
              <li key={c.id}>
                <ConversationCard summary={summarizeConversation(c)} />
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </article>
  );
}
