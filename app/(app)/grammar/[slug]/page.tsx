import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { JapaneseText } from "@/components/japanese/japanese-text";
import { BackLink } from "@/components/layout/back-link";
import { SectionHeader } from "@/components/layout/page-header";
import { GrammarCard, SentenceItem } from "@/components/learning/content-cards";
import { LearningActions } from "@/components/learning/learning-actions";
import { Badge } from "@/components/ui/badge";
import { GRAMMAR_CATEGORY_LABELS } from "@/data/grammar";
import {
  getGrammarBySlug,
  listGrammar,
  sentencesForGrammar,
  similarGrammar,
  vocabularyInSentence,
} from "@/lib/content";

export function generateStaticParams() {
  return listGrammar().map((g) => ({ slug: g.slug }));
}

export async function generateMetadata({
  params,
}: PageProps<"/grammar/[slug]">): Promise<Metadata> {
  const point = getGrammarBySlug((await params).slug);
  return point ? { title: `${point.pattern} – ${point.meaningDe}` } : {};
}

export default async function GrammarDetailPage({ params }: PageProps<"/grammar/[slug]">) {
  const point = getGrammarBySlug((await params).slug);
  if (!point) notFound();

  const [headline, ...examples] = sentencesForGrammar(point.id);
  const similar = similarGrammar(point);

  return (
    <article className="flex max-w-4xl flex-col gap-12">
      <BackLink href="/grammar">Alle Grammatik</BackLink>

      <header className="flex flex-col gap-4">
        <h1 lang="ja" className="font-jp text-4xl font-medium">
          {point.pattern}
        </h1>
        <p className="text-xl text-fg/90">{point.meaningDe}</p>
        <div className="flex flex-wrap gap-2">
          {point.jlpt ? <Badge>{point.jlpt}</Badge> : null}
          <Badge>{GRAMMAR_CATEGORY_LABELS[point.category]}</Badge>
          {point.common ? <Badge tone="accent">häufig verwendet</Badge> : null}
        </div>
      </header>

      <div className="grid gap-10 md:grid-cols-[1fr_18rem]">
        <div className="flex flex-col gap-10">
          <section>
            <SectionHeader title="Struktur" ja="形" />
            <p
              lang="ja"
              className="inline-block rounded-md border border-line bg-surface px-4 py-3 font-jp text-lg"
            >
              {point.structure}
            </p>
          </section>

          {headline ? (
            <section>
              <SectionHeader title="Beispiel" ja="例" />
              <div className="rounded-lg border border-line bg-surface p-5">
                <JapaneseText
                  japanese={headline.japanese}
                  furigana={headline.furigana}
                  reading={headline.reading}
                  romaji={headline.romaji}
                  german={headline.german}
                  size="lg"
                />
              </div>
            </section>
          ) : null}

          <section>
            <SectionHeader title="Bedeutung und Verwendung" ja="使い方" />
            <div className="flex max-w-2xl flex-col gap-3 text-[0.95rem] leading-relaxed">
              <p>{point.explanationDe}</p>
              {point.usageNotes ? <p className="text-muted">{point.usageNotes}</p> : null}
            </div>
          </section>

          {point.commonMistakes.length > 0 ? (
            <section>
              <SectionHeader title="Typische Fehler" ja="注意" />
              <ul className="flex max-w-2xl flex-col gap-2">
                {point.commonMistakes.map((mistake) => (
                  <li
                    key={mistake}
                    className="rounded-md border-l-2 border-akane/50 bg-akane-soft/30 px-4 py-2.5 text-sm leading-relaxed"
                  >
                    {mistake}
                  </li>
                ))}
              </ul>
            </section>
          ) : null}

          {examples.length > 0 ? (
            <section>
              <SectionHeader title="Natürliche Beispiele" ja="例文" />
              <ul className="flex flex-col gap-3">
                {examples.map((sentence) => (
                  <li key={sentence.id}>
                    <SentenceItem sentence={sentence} words={vocabularyInSentence(sentence)} />
                  </li>
                ))}
              </ul>
            </section>
          ) : null}
        </div>

        <aside className="flex flex-col gap-10">
          <LearningActions
            contentType="grammar"
            contentId={point.id}
            label={point.pattern}
            showDifficulty={false}
          />
          {similar.length > 0 ? (
            <section>
              <SectionHeader title="Ähnliche Grammatik" as="h3" />
              <ul className="flex flex-col gap-2">
                {similar.map((other) => (
                  <li key={other.id}>
                    <GrammarCard point={other} />
                  </li>
                ))}
              </ul>
            </section>
          ) : null}
        </aside>
      </div>
    </article>
  );
}
