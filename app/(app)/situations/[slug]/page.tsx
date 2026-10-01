import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { FuriganaText } from "@/components/japanese/furigana-text";
import { JapaneseText } from "@/components/japanese/japanese-text";
import { BackLink } from "@/components/layout/back-link";
import { SectionHeader } from "@/components/layout/page-header";
import { DifficultyBadge } from "@/components/learning/badges";
import { ConversationCard, VocabularyCard } from "@/components/learning/content-cards";
import { Badge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { SITUATION_CATEGORY_LABELS } from "@/data/situations";
import {
  conversationsForSituation,
  getSituation,
  listSituations,
  situationVocabulary,
} from "@/lib/content";
import { summarizeConversation } from "@/lib/content/conversation-data";

export function generateStaticParams() {
  return listSituations().map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({
  params,
}: PageProps<"/situations/[slug]">): Promise<Metadata> {
  const situation = getSituation((await params).slug);
  return situation ? { title: `${situation.titleJa} – ${situation.titleDe}` } : {};
}

export default async function SituationPage({ params }: PageProps<"/situations/[slug]">) {
  const situation = getSituation((await params).slug);
  if (!situation) notFound();

  const conversations = conversationsForSituation(situation.id);
  const words = situationVocabulary(situation);

  return (
    <article className="flex flex-col gap-12">
      <BackLink href="/situations">Alle Situationen</BackLink>

      <header className="flex flex-col gap-4 border-b border-line pb-8">
        <h1 lang="ja" className="jp-text font-jp text-5xl font-medium sm:text-6xl">
          <FuriganaText japanese={situation.titleJa} reading={situation.titleReading} />
        </h1>
        <p className="text-2xl font-semibold tracking-tight">{situation.titleDe}</p>
        <p className="max-w-2xl text-[0.95rem] leading-relaxed text-muted">
          {situation.descriptionDe}
        </p>
        <div className="flex flex-wrap gap-2">
          <DifficultyBadge difficulty={situation.difficulty} />
          <Badge>{SITUATION_CATEGORY_LABELS[situation.category]}</Badge>
          <Badge>
            {conversations.length} {conversations.length === 1 ? "Gespräch" : "Gespräche"}
          </Badge>
        </div>
        {conversations[0] ? (
          <div className="flex flex-wrap gap-2 pt-2">
            <ButtonLink href={`/conversations/${conversations[0].id}/practice`} size="lg">
              Situation starten
            </ButtonLink>
            <ButtonLink
              href={`/conversations/${conversations[0].id}/listen`}
              size="lg"
              variant="secondary"
            >
              Erst nur hören
            </ButtonLink>
            <ButtonLink
              href={`/practice/conversation?situation=${situation.slug}`}
              size="lg"
              variant="ghost"
            >
              Frei mit AI üben
            </ButtonLink>
          </div>
        ) : null}
      </header>

      <section>
        <SectionHeader
          title="Schlüsselausdrücke"
          ja="表現"
          description="Diese Sätze hörst und brauchst du hier fast immer."
        />
        <ul className="grid gap-3 md:grid-cols-2">
          {situation.keyExpressions.map((e) => (
            <li key={e.japanese}>
              <Card className="flex h-full flex-col gap-3">
                <JapaneseText
                  japanese={e.japanese}
                  furigana={e.furigana}
                  reading={e.reading}
                  romaji={e.romaji}
                  german={e.german}
                  size="lg"
                />
                {e.noteDe ? (
                  <p className="border-t border-line pt-3 text-sm text-muted">{e.noteDe}</p>
                ) : null}
              </Card>
            </li>
          ))}
        </ul>
      </section>

      <section>
        <SectionHeader
          title="Gespräche"
          ja="会話"
          description="Lesen, hören, im Rollenspiel selbst sprechen."
        />
        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {conversations.map((c) => (
            <li key={c.id}>
              <ConversationCard summary={summarizeConversation(c)} />
            </li>
          ))}
        </ul>
      </section>

      <section>
        <SectionHeader
          title="Listening"
          ja="聞き取り"
          description="Erst hören, dann Schritt für Schritt Hilfen einblenden."
        />
        <ul className="flex flex-col divide-y divide-line rounded-lg border border-line bg-surface">
          {conversations.map((c) => (
            <li key={c.id} className="flex flex-wrap items-center justify-between gap-3 px-4 py-3">
              <span>
                <span lang="ja" className="mr-3 font-jp">
                  {c.titleJa}
                </span>
                <span className="text-sm text-muted">{c.titleDe}</span>
              </span>
              <Link
                href={`/conversations/${c.id}/listen`}
                className="text-sm font-medium text-accent underline-offset-4 hover:underline"
              >
                Hörübung starten →
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section>
        <SectionHeader title="Wortschatz" ja="語彙" />
        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {words.map((word) => (
            <li key={word.id}>
              <VocabularyCard word={word} />
            </li>
          ))}
        </ul>
      </section>

      <section>
        <SectionHeader title="Kulturelle Hinweise" ja="文化" />
        <ul className="flex max-w-3xl flex-col gap-3">
          {situation.culturalNotesDe.map((note) => (
            <li
              key={note}
              className="rounded-md border-l-2 border-kohaku/60 bg-kohaku-soft/30 px-4 py-3 text-[0.95rem] leading-relaxed"
            >
              {note}
            </li>
          ))}
        </ul>
      </section>
    </article>
  );
}
