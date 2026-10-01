import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AudioButton } from "@/components/japanese/audio-button";
import { JapaneseText } from "@/components/japanese/japanese-text";
import { StrokeOrder } from "@/components/kana/stroke-order";
import { LearningActions } from "@/components/learning/learning-actions";
import { SectionHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeftIcon, ArrowRightIcon } from "@/components/ui/icons";
import { getConfusionSets, getKanaByCharacter, KANA } from "@/data/kana";
import { getKanaExamples } from "@/data/kana-examples";
import { findVocabularyByJapanese } from "@/lib/content";
import { getStrokeOrder, STROKE_ORDER_ATTRIBUTION } from "@/lib/japanese/stroke-order";
import type { Kana } from "@/types/content";

const GROUP_LABELS: Record<Kana["group"], string> = {
  basic: "Grundzeichen",
  dakuten: "Dakuten",
  handakuten: "Handakuten",
  yoon: "Kombination (Yōon)",
  extended: "Erweitertes Katakana",
};

function decodeParam(value: string) {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

export function generateStaticParams() {
  return KANA.map((k) => ({ character: k.character }));
}

export async function generateMetadata({
  params,
}: PageProps<"/kana/[character]">): Promise<Metadata> {
  const kana = getKanaByCharacter(decodeParam((await params).character));
  return kana ? { title: `${kana.character} (${kana.romaji})` } : {};
}

function neighbours(kana: Kana) {
  const sequence = KANA.filter((k) => k.scriptType === kana.scriptType);
  const index = sequence.findIndex((k) => k.id === kana.id);
  return { prev: sequence[index - 1], next: sequence[index + 1] };
}

function KanaLink({ kana, label }: { kana: Kana; label?: string }) {
  return (
    <Link
      href={`/kana/${encodeURIComponent(kana.character)}`}
      className="flex min-w-16 flex-col items-center rounded-md border border-line bg-surface px-3 py-2 transition-colors hover:border-line-strong"
    >
      <span lang="ja" className="font-jp text-2xl">
        {kana.character}
      </span>
      <span className="text-xs text-muted">{label ?? kana.romaji}</span>
    </Link>
  );
}

export default async function KanaDetailPage({ params }: PageProps<"/kana/[character]">) {
  const kana = getKanaByCharacter(decodeParam((await params).character));
  if (!kana) notFound();

  const examples = getKanaExamples(kana.character);
  const strokes = getStrokeOrder(kana.character);
  const confusions = getConfusionSets(kana.character);
  const related = kana.relatedCharacters
    .map((c) => getKanaByCharacter(c))
    .filter((k): k is Kana => k !== undefined);
  const { prev, next } = neighbours(kana);
  const scriptName = kana.scriptType === "hiragana" ? "Hiragana" : "Katakana";

  return (
    <article className="flex flex-col gap-12">
      <nav aria-label="Kana-Navigation" className="flex items-center justify-between gap-4 text-sm">
        <Link href="/kana" className="text-muted hover:text-fg">
          ← Alle Kana
        </Link>
        <div className="flex gap-1">
          {prev ? (
            <ButtonLink
              href={`/kana/${encodeURIComponent(prev.character)}`}
              variant="ghost"
              size="sm"
              aria-label={`Vorheriges Zeichen: ${prev.character}`}
            >
              <ArrowLeftIcon size={16} /> <span lang="ja">{prev.character}</span>
            </ButtonLink>
          ) : null}
          {next ? (
            <ButtonLink
              href={`/kana/${encodeURIComponent(next.character)}`}
              variant="ghost"
              size="sm"
              aria-label={`Nächstes Zeichen: ${next.character}`}
            >
              <span lang="ja">{next.character}</span> <ArrowRightIcon size={16} />
            </ButtonLink>
          ) : null}
        </div>
      </nav>

      <header className="grid gap-8 md:grid-cols-[auto_1fr] md:items-center md:gap-14">
        <div className="flex size-44 items-center justify-center rounded-xl border border-line bg-surface sm:size-56">
          <h1 lang="ja" className="font-jp text-[7rem] leading-none sm:text-[9rem]">
            {kana.character}
          </h1>
        </div>
        <div className="flex flex-col gap-5">
          <div className="flex items-center gap-4">
            <p className="text-4xl font-semibold tracking-tight">{kana.romaji}</p>
            <AudioButton
              text={kana.character}
              url={kana.audioUrl}
              size="lg"
              label={`Aussprache anhören: ${kana.character}`}
            />
          </div>
          <div className="flex flex-wrap gap-2">
            <Badge>{scriptName}</Badge>
            <Badge>{GROUP_LABELS[kana.group]}</Badge>
            {kana.strokeCount ? (
              <Badge>
                {kana.strokeCount} {kana.strokeCount === 1 ? "Strich" : "Striche"}
              </Badge>
            ) : null}
          </div>
          {kana.pronunciation ? (
            <p className="max-w-xl text-[0.95rem] leading-relaxed text-muted">
              {kana.pronunciation}
            </p>
          ) : null}
          <LearningActions
            contentType="kana"
            contentId={kana.id}
            label={kana.character}
            favorite={false}
            practiceHref={`/kana/practice?mode=mixed&chars=${encodeURIComponent(kana.character)}`}
          />
        </div>
      </header>

      <div className="grid gap-12 lg:grid-cols-2">
        <section>
          <SectionHeader title="Strichreihenfolge" ja="書き順" />
          {strokes.length > 0 ? (
            <>
              <StrokeOrder glyphs={strokes} label={kana.character} />
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

        <section>
          <SectionHeader title="Beispielwörter" ja="例" />
          {examples.length > 0 ? (
            <ul className="flex flex-col gap-3">
              {examples.map((word) => {
                const entry = findVocabularyByJapanese(word.japanese);
                return (
                  <li key={word.japanese}>
                    <Card className="flex items-start justify-between gap-4 py-4">
                      <JapaneseText
                        japanese={word.japanese}
                        reading={word.reading}
                        romaji={word.romaji}
                        german={word.german}
                      />
                      {entry ? (
                        <Link
                          href={`/vocabulary/${entry.id}`}
                          className="shrink-0 text-sm text-accent underline-offset-4 hover:underline"
                        >
                          Zum Wort →
                        </Link>
                      ) : null}
                    </Card>
                  </li>
                );
              })}
            </ul>
          ) : (
            <p className="text-sm text-muted">
              Dieses Zeichen kommt in alltäglichen Wörtern kaum vor.
            </p>
          )}
        </section>
      </div>

      {related.length > 0 ? (
        <section>
          <SectionHeader
            title="Verwandte Zeichen"
            ja="関連"
            description="Gegenstück in der anderen Schrift, Varianten mit Dakuten oder Handakuten und Kombinationen."
          />
          <ul className="flex flex-wrap gap-2">
            {related.map((k) => (
              <li key={k.id}>
                <KanaLink kana={k} />
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {confusions.length > 0 ? (
        <section>
          <SectionHeader title="Verwechslungsgefahr" ja="似ている字" />
          <div className="grid gap-3 md:grid-cols-2">
            {confusions.map((set) => (
              <Card key={set.id} className="flex flex-col gap-4">
                <ul className="flex gap-2">
                  {set.characters.map((c) => {
                    const k = getKanaByCharacter(c);
                    return k ? (
                      <li key={c}>
                        <KanaLink kana={k} />
                      </li>
                    ) : null;
                  })}
                </ul>
                <p className="text-sm leading-relaxed text-muted">{set.tipDe}</p>
                <ButtonLink
                  size="sm"
                  variant="secondary"
                  className="self-start"
                  href={`/kana/practice?mode=confusion&chars=${encodeURIComponent(set.characters.join(","))}`}
                >
                  Unterscheiden üben
                </ButtonLink>
              </Card>
            ))}
          </div>
        </section>
      ) : null}
    </article>
  );
}
