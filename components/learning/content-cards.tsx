import Link from "next/link";
import { JapaneseText } from "@/components/japanese/japanese-text";
import { Badge } from "@/components/ui/badge";
import { CardLink } from "@/components/ui/card";
import { GRAMMAR_CATEGORY_LABELS } from "@/data/grammar";
import { PART_OF_SPEECH_LABELS } from "@/data/vocabulary";
import { LEARNING_STATUS_META } from "@/lib/learning-status";
import { FavoriteButton } from "./favorite-button";
import type { GrammarPoint, Kanji, LearningStatus, Sentence, Vocabulary } from "@/types/content";

function StatusMark({ status }: { status?: LearningStatus }) {
  if (!status || status === "unseen") return null;
  const meta = LEARNING_STATUS_META[status];
  return (
    <Badge tone={meta.tone}>
      <span aria-hidden="true">{meta.mark}</span>
      {meta.label}
    </Badge>
  );
}

export function VocabularyCard({ word, status }: { word: Vocabulary; status?: LearningStatus }) {
  return (
    <CardLink href={`/vocabulary/${word.id}`} className="flex h-full flex-col gap-3">
      <div className="min-w-0">
        <p lang="ja" className="font-jp text-2xl leading-tight text-fg">
          {word.japanese}
        </p>
        {word.reading !== word.japanese ? (
          <p lang="ja" className="mt-1 font-jp text-sm text-muted">
            {word.reading}
          </p>
        ) : null}
        <p className="jp-romaji mt-0.5 text-sm text-faint">{word.romaji}</p>
      </div>
      <p className="text-[0.95rem] text-fg/85">{word.german.join(", ")}</p>
      <div className="mt-auto flex flex-wrap gap-1.5 pt-1">
        <Badge>{PART_OF_SPEECH_LABELS[word.partOfSpeech]}</Badge>
        {word.jlpt ? <Badge>{word.jlpt}</Badge> : null}
        <StatusMark status={status} />
      </div>
    </CardLink>
  );
}

export function KanjiCard({ kanji, status }: { kanji: Kanji; status?: LearningStatus }) {
  return (
    <CardLink
      href={`/kanji/${encodeURIComponent(kanji.character)}`}
      className="flex h-full flex-col items-center gap-2 text-center"
    >
      <p lang="ja" className="font-jp text-5xl leading-none text-fg">
        {kanji.character}
      </p>
      <p className="mt-1 text-sm text-fg/85">{kanji.meaningsDe.slice(0, 2).join(", ")}</p>
      <div className="mt-auto flex flex-wrap justify-center gap-1.5 pt-1">
        {kanji.jlpt ? <Badge>{kanji.jlpt}</Badge> : null}
        <StatusMark status={status} />
      </div>
    </CardLink>
  );
}

export function GrammarCard({ point, status }: { point: GrammarPoint; status?: LearningStatus }) {
  return (
    <CardLink href={`/grammar/${point.slug}`} className="flex h-full flex-col gap-2">
      <p lang="ja" className="font-jp text-xl text-fg">
        {point.pattern}
      </p>
      <p className="text-[0.95rem] text-fg/85">{point.meaningDe}</p>
      <div className="mt-auto flex flex-wrap gap-1.5 pt-2">
        {point.jlpt ? <Badge>{point.jlpt}</Badge> : null}
        <Badge>{GRAMMAR_CATEGORY_LABELS[point.category]}</Badge>
        <StatusMark status={status} />
      </div>
    </CardLink>
  );
}

/** Beispielsatz mit allen Lesehilfen und Links zu enthaltenen Wörtern und Grammatik. */
export function SentenceItem({
  sentence,
  words = [],
  grammar = [],
}: {
  sentence: Sentence;
  words?: Vocabulary[];
  grammar?: GrammarPoint[];
}) {
  return (
    <div className="relative flex flex-col gap-3 rounded-lg border border-line bg-surface p-4">
      <FavoriteButton
        contentType="sentence"
        contentId={sentence.id}
        label="Satz"
        className="absolute top-3 right-3"
      />
      <JapaneseText
        className="pr-8"
        japanese={sentence.japanese}
        furigana={sentence.furigana}
        reading={sentence.reading}
        romaji={sentence.romaji}
        german={sentence.german}
        audioUrl={sentence.audioUrl}
      />
      {sentence.contextDe ? (
        <p className="text-xs text-faint">Kontext: {sentence.contextDe}</p>
      ) : null}
      {words.length + grammar.length > 0 ? (
        <ul
          className="flex flex-wrap gap-1.5 border-t border-line pt-3"
          aria-label="In diesem Satz"
        >
          {words.map((w) => (
            <li key={w.id}>
              <Link
                href={`/vocabulary/${w.id}`}
                className="inline-flex h-7 items-center gap-1.5 rounded-full border border-line px-2.5 text-xs text-muted hover:border-line-strong hover:text-fg"
              >
                <span lang="ja" className="font-jp text-sm text-fg">
                  {w.japanese}
                </span>
                {w.german[0]}
              </Link>
            </li>
          ))}
          {grammar.map((g) => (
            <li key={g.id}>
              <Link
                href={`/grammar/${g.slug}`}
                className="inline-flex h-7 items-center gap-1.5 rounded-full border border-accent/30 bg-accent-soft/50 px-2.5 text-xs text-accent hover:border-accent/60"
              >
                <span lang="ja" className="font-jp text-sm">
                  {g.pattern.split(" / ")[0]}
                </span>
                Grammatik
              </Link>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
