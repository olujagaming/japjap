import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { JapaneseText } from "@/components/japanese/japanese-text";
import { BackLink } from "@/components/layout/back-link";
import { SectionHeader } from "@/components/layout/page-header";
import {
  ConversationCard,
  SentenceItem,
  VocabularyCard,
} from "@/components/learning/content-cards";
import { summarizeConversation } from "@/lib/content/conversation-data";
import { LearningActions } from "@/components/learning/learning-actions";
import { Badge } from "@/components/ui/badge";
import { FREQUENCY_LABELS, PART_OF_SPEECH_LABELS, TAG_LABELS } from "@/data/vocabulary";
import {
  getVocabulary,
  grammarInSentence,
  kanjiCharacters,
  getKanji,
  listVocabulary,
  conversationsForVocabulary,
  relatedVocabulary,
  sentencesForVocabulary,
  vocabularyInSentence,
} from "@/lib/content";

export function generateStaticParams() {
  return listVocabulary().map((word) => ({ id: word.id }));
}

export async function generateMetadata({
  params,
}: PageProps<"/vocabulary/[id]">): Promise<Metadata> {
  const word = getVocabulary((await params).id);
  return word ? { title: `${word.japanese} – ${word.german[0]}` } : {};
}

export default async function VocabularyDetailPage({ params }: PageProps<"/vocabulary/[id]">) {
  const word = getVocabulary((await params).id);
  if (!word) notFound();

  const sentences = sentencesForVocabulary(word.id);
  const related = relatedVocabulary(word);
  const conversations = conversationsForVocabulary(word.id);
  const kanji = kanjiCharacters(word.japanese).map((character) => ({
    character,
    entry: getKanji(character),
  }));

  return (
    <article className="flex flex-col gap-12">
      <BackLink href="/vocabulary">Alle Vokabeln</BackLink>

      <header className="grid gap-8 lg:grid-cols-[1fr_auto] lg:items-start">
        <div className="flex flex-col gap-4">
          <JapaneseText
            japanese={word.japanese}
            furigana={word.furigana}
            reading={word.reading}
            romaji={word.romaji}
            audioUrl={word.audioUrl}
            showReading
            size="xl"
          />
          <h1 className="text-2xl font-semibold tracking-tight">{word.german.join(", ")}</h1>
          <div className="flex flex-wrap gap-2">
            <Badge>{PART_OF_SPEECH_LABELS[word.partOfSpeech]}</Badge>
            {word.jlpt ? <Badge>{word.jlpt}</Badge> : null}
            <Badge>{FREQUENCY_LABELS[word.frequency]}</Badge>
            {word.tags.map((tag) => (
              <Badge key={tag} tone="accent">
                {TAG_LABELS[tag]}
              </Badge>
            ))}
          </div>
        </div>
        <div className="lg:w-96">
          <LearningActions contentType="vocabulary" contentId={word.id} label={word.japanese} />
        </div>
      </header>

      <div className="grid gap-12 lg:grid-cols-[1fr_20rem]">
        <div className="flex flex-col gap-12">
          <section>
            <SectionHeader title="Bedeutung" ja="意味" />
            <ol className="list-inside list-decimal space-y-1 text-[0.95rem]">
              {word.german.map((meaning) => (
                <li key={meaning}>{meaning}</li>
              ))}
            </ol>
            {word.english ? (
              <p className="mt-2 text-sm text-faint">Englisch: {word.english.join(", ")}</p>
            ) : null}
            {word.noteDe ? (
              <p className="mt-4 max-w-2xl rounded-md border-l-2 border-accent/50 bg-accent-soft/40 px-4 py-3 text-sm leading-relaxed">
                {word.noteDe}
              </p>
            ) : null}
          </section>

          <section id="sentences">
            <SectionHeader title="Beispielsätze" ja="例文" />
            {sentences.length > 0 ? (
              <ul className="flex flex-col gap-3">
                {sentences.map((sentence) => (
                  <li key={sentence.id}>
                    <SentenceItem
                      sentence={sentence}
                      words={vocabularyInSentence(sentence).filter((w) => w.id !== word.id)}
                      grammar={grammarInSentence(sentence)}
                    />
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted">
                Für dieses Wort gibt es noch keine Beispielsätze.
              </p>
            )}
          </section>

          {conversations.length > 0 ? (
            <section>
              <SectionHeader
                title="In Gesprächen"
                ja="会話"
                description="Hier begegnet dir das Wort im Zusammenhang."
              />
              <ul className="grid gap-3 sm:grid-cols-2">
                {conversations.map((c) => (
                  <li key={c.id}>
                    <ConversationCard summary={summarizeConversation(c)} />
                  </li>
                ))}
              </ul>
            </section>
          ) : null}
        </div>

        <aside className="flex flex-col gap-12">
          {kanji.length > 0 ? (
            <section>
              <SectionHeader title="Kanji" ja="漢字" as="h3" />
              <ul className="flex flex-wrap gap-2">
                {kanji.map(({ character, entry }) => (
                  <li key={character}>
                    {entry ? (
                      <Link
                        href={`/kanji/${encodeURIComponent(character)}`}
                        className="flex min-w-24 flex-col items-center rounded-md border border-line bg-surface px-3 py-2 hover:border-line-strong"
                      >
                        <span lang="ja" className="font-jp text-3xl">
                          {character}
                        </span>
                        <span className="text-xs text-muted">{entry.meaningsDe[0]}</span>
                      </Link>
                    ) : (
                      <span className="flex min-w-24 flex-col items-center rounded-md border border-dashed border-line px-3 py-2">
                        <span lang="ja" className="font-jp text-3xl text-muted">
                          {character}
                        </span>
                        <span className="text-xs text-faint">noch kein Eintrag</span>
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            </section>
          ) : null}

          {related.length > 0 ? (
            <section>
              <SectionHeader title="Verwandte Wörter" ja="関連語" as="h3" />
              <ul className="flex flex-col gap-2">
                {related.map((other) => (
                  <li key={other.id}>
                    <VocabularyCard word={other} />
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
