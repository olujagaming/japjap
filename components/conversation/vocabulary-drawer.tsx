"use client";

import Link from "next/link";
import { JapaneseText } from "@/components/japanese/japanese-text";
import { LearningActions } from "@/components/learning/learning-actions";
import { Badge } from "@/components/ui/badge";
import { Drawer } from "@/components/ui/dialog";
import type { Vocabulary } from "@/types/content";

export type DrawerWord = Pick<
  Vocabulary,
  "id" | "japanese" | "reading" | "furigana" | "romaji" | "german" | "noteDe" | "jlpt"
> & { partOfSpeechLabel: string };

/** Wort aus einem Gespräch nachschlagen, ohne den Lesefluss zu verlassen. */
export function VocabularyDrawer({
  word,
  onClose,
}: {
  word: DrawerWord | null;
  onClose: () => void;
}) {
  return (
    <Drawer
      open={word !== null}
      onClose={onClose}
      title={word ? `${word.japanese} – ${word.german[0]}` : "Wort"}
    >
      {word ? (
        <div className="flex flex-col gap-6">
          <JapaneseText
            japanese={word.japanese}
            furigana={word.furigana}
            reading={word.reading}
            romaji={word.romaji}
            showReading
            size="xl"
            translationMode="off"
          />
          <div>
            <p className="text-lg">{word.german.join(", ")}</p>
            <div className="mt-2 flex flex-wrap gap-1.5">
              <Badge>{word.partOfSpeechLabel}</Badge>
              {word.jlpt ? <Badge>{word.jlpt}</Badge> : null}
            </div>
          </div>
          {word.noteDe ? (
            <p className="rounded-md bg-accent-soft/40 px-4 py-3 text-sm leading-relaxed">
              {word.noteDe}
            </p>
          ) : null}
          <LearningActions
            contentType="vocabulary"
            contentId={word.id}
            label={word.japanese}
            showDifficulty={false}
          />
          <Link
            href={`/vocabulary/${word.id}`}
            className="text-sm text-accent underline-offset-4 hover:underline"
          >
            Alle Details und Beispielsätze →
          </Link>
        </div>
      ) : null}
    </Drawer>
  );
}
