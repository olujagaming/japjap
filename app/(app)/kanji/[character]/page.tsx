import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AudioButton } from "@/components/japanese/audio-button";
import { StrokeOrder } from "@/components/kana/stroke-order";
import { BackLink } from "@/components/layout/back-link";
import { SectionHeader } from "@/components/layout/page-header";
import { SentenceItem, VocabularyCard } from "@/components/learning/content-cards";
import { LearningActions } from "@/components/learning/learning-actions";
import { Badge } from "@/components/ui/badge";
import {
  getKanji,
  grammarInSentence,
  listKanji,
  relatedKanji,
  sentencesForKanji,
  vocabularyForKanji,
  vocabularyInSentence,
} from "@/lib/content";
import { getStrokeOrder, STROKE_ORDER_ATTRIBUTION } from "@/lib/japanese/stroke-order";

function decodeParam(value: string) {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

export function generateStaticParams() {
  return listKanji().map((k) => ({ character: k.character }));
}

export async function generateMetadata({
  params,
}: PageProps<"/kanji/[character]">): Promise<Metadata> {
  const kanji = getKanji(decodeParam((await params).character));
  return kanji ? { title: `${kanji.character} – ${kanji.meaningsDe[0]}` } : {};
}

function Readings({ label, values, hint }: { label: string; values: string[]; hint: string }) {
  return (
    <div>
      <dt className="text-xs text-muted">
        {label} <span className="text-faint">· {hint}</span>
      </dt>
      <dd lang="ja" className="mt-1 font-jp text-xl">
        {values.length > 0 ? (
          values.map((reading, i) => {
            const [stem, okurigana] = reading.split(".");
            return (
              <span key={reading}>
                {i > 0 ? <span className="text-faint">、</span> : null}
                {stem}
                {okurigana ? <span className="text-muted">{okurigana}</span> : null}
              </span>
            );
          })
        ) : (
          <span className="text-base text-faint">–</span>
        )}
      </dd>
    </div>
  );
}

export default async function KanjiDetailPage({ params }: PageProps<"/kanji/[character]">) {
  const kanji = getKanji(decodeParam((await params).character));
  if (!kanji) notFound();

  const words = vocabularyForKanji(kanji.character);
  const sentences = sentencesForKanji(kanji.character).slice(0, 6);
  const related = relatedKanji(kanji);
  const strokes = getStrokeOrder(kanji.character);
  const firstKun = kanji.kunyomi[0]?.replace(".", "");

  return (
    <article className="flex flex-col gap-12">
      <BackLink href="/kanji">Alle Kanji</BackLink>

      <header className="grid gap-8 md:grid-cols-[auto_1fr] md:items-center md:gap-14">
        <div className="flex size-44 items-center justify-center rounded-xl border border-line bg-surface sm:size-56">
          <p lang="ja" className="font-jp text-[7rem] leading-none sm:text-[9rem]">
            {kanji.character}
          </p>
        </div>
        <div className="flex flex-col gap-5">
          <div className="flex items-center gap-4">
            <h1 className="text-3xl font-semibold tracking-tight">{kanji.meaningsDe.join(", ")}</h1>
            <AudioButton
              text={firstKun ?? kanji.character}
              size="lg"
              label={`Lesung anhören: ${kanji.character}`}
            />
          </div>
          <dl className="grid max-w-md grid-cols-2 gap-4">
            <Readings label="On-Lesung" hint="sino-japanisch" values={kanji.onyomi} />
            <Readings label="Kun-Lesung" hint="japanisch" values={kanji.kunyomi} />
          </dl>
          <div className="flex flex-wrap gap-2">
            {kanji.jlpt ? <Badge>{kanji.jlpt}</Badge> : null}
            {kanji.grade ? <Badge>{kanji.grade}. Schulklasse</Badge> : null}
            <Badge>{kanji.strokeCount} Striche</Badge>
          </div>
          <LearningActions contentType="kanji" contentId={kanji.id} label={kanji.character} />
        </div>
      </header>

      <div className="grid gap-12 lg:grid-cols-2">
        <section>
          <SectionHeader title="Aufbau" ja="構成" />
          <dl className="flex flex-col gap-4 text-sm">
            <div>
              <dt className="text-xs text-muted">Radikal</dt>
              <dd className="mt-1 flex items-baseline gap-2">
                <span lang="ja" className="font-jp text-2xl">
                  {kanji.radical}
                </span>
                <span className="text-muted">{kanji.radicalMeaningDe}</span>
              </dd>
            </div>
            {kanji.components.length > 0 ? (
              <div>
                <dt className="text-xs text-muted">Bestandteile</dt>
                <dd lang="ja" className="mt-1 font-jp text-2xl tracking-widest">
                  {kanji.components.join(" + ")}
                </dd>
              </div>
            ) : null}
            {kanji.noteDe ? (
              <div>
                <dt className="text-xs text-muted">Merkhilfe</dt>
                <dd className="mt-1 max-w-md leading-relaxed">{kanji.noteDe}</dd>
              </div>
            ) : null}
          </dl>
        </section>
        <section>
          <SectionHeader title="Strichreihenfolge" ja="書き順" />
          {strokes.length > 0 ? (
            <>
              <StrokeOrder glyphs={strokes} label={kanji.character} />
              <p className="mt-3 text-xs text-faint">
                <a
                  href={STROKE_ORDER_ATTRIBUTION.href}
                  className="underline underline-offset-2"
                  target="_blank"
                  rel="noreferrer"
                >
                  {STROKE_ORDER_ATTRIBUTION.label}
                </a>{" "}
                ({STROKE_ORDER_ATTRIBUTION.license})
              </p>
            </>
          ) : (
            <p className="text-sm text-muted">
              Für dieses Zeichen liegen noch keine Strichdaten vor.
            </p>
          )}
        </section>
      </div>

      <section>
        <SectionHeader title="Wörter mit diesem Kanji" ja="語彙" />
        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {words.map((word) => (
            <li key={word.id}>
              <VocabularyCard word={word} />
            </li>
          ))}
        </ul>
      </section>

      {sentences.length > 0 ? (
        <section>
          <SectionHeader title="Beispielsätze" ja="例文" />
          <ul className="grid gap-3 lg:grid-cols-2">
            {sentences.map((sentence) => (
              <li key={sentence.id}>
                <SentenceItem
                  sentence={sentence}
                  words={vocabularyInSentence(sentence)}
                  grammar={grammarInSentence(sentence)}
                />
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {related.length > 0 ? (
        <section>
          <SectionHeader title="Verwandte Kanji" ja="関連" />
          <ul className="flex flex-wrap gap-2">
            {related.map(({ character, entry }) => (
              <li key={character}>
                {entry ? (
                  <Link
                    href={`/kanji/${encodeURIComponent(character)}`}
                    className="flex min-w-20 flex-col items-center rounded-md border border-line bg-surface px-3 py-2 hover:border-line-strong"
                  >
                    <span lang="ja" className="font-jp text-3xl">
                      {character}
                    </span>
                    <span className="text-xs text-muted">{entry.meaningsDe[0]}</span>
                  </Link>
                ) : (
                  <span className="flex min-w-20 flex-col items-center rounded-md border border-dashed border-line px-3 py-2">
                    <span lang="ja" className="font-jp text-3xl text-muted">
                      {character}
                    </span>
                    <span className="text-xs text-faint">folgt</span>
                  </span>
                )}
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </article>
  );
}
