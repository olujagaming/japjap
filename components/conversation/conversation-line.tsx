"use client";

import Link from "next/link";
import { useState } from "react";
import { JapaneseText } from "@/components/japanese/japanese-text";
import { PronunciationCheck } from "@/components/speech/pronunciation-check";
import { useSettings } from "@/hooks/use-settings";
import { cn } from "@/lib/utils";
import type { ConversationLine as Line, Speaker } from "@/types/content";
import type { DrawerWord } from "./vocabulary-drawer";

export type LineGrammar = { id: string; slug: string; pattern: string; meaningDe: string };

function Toggle({
  pressed,
  onClick,
  children,
}: {
  pressed: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-pressed={pressed}
      onClick={onClick}
      className={cn(
        "h-7 rounded-full border px-2.5 text-xs transition-colors",
        pressed
          ? "border-accent/40 bg-accent-soft text-accent"
          : "border-line text-muted hover:text-fg",
      )}
    >
      {children}
    </button>
  );
}

/**
 * Eine Gesprächszeile mit allen Hilfen: Audio, Furigana- und Übersetzungsschalter,
 * Wort- und Grammatik-Aufschlüsselung. Wörter öffnen den Vokabel-Drawer.
 */
export function ConversationLineView({
  line,
  speaker,
  pitch,
  active,
  words,
  grammar,
  onWord,
}: {
  line: Line;
  speaker: Speaker;
  pitch: number;
  active: boolean;
  words: DrawerWord[];
  grammar: LineGrammar[];
  onWord: (word: DrawerWord) => void;
}) {
  const [settings] = useSettings();
  const [furigana, setFurigana] = useState<boolean | null>(null);
  const [translation, setTranslation] = useState<boolean | null>(null);
  const [breakdown, setBreakdown] = useState(false);

  const furiganaOn = furigana ?? settings.furigana !== "off";
  const translationOn = translation ?? settings.translation === "always";

  return (
    <li
      aria-current={active ? "true" : undefined}
      className={cn(
        "grid gap-x-4 gap-y-1 rounded-lg border p-4 transition-colors sm:grid-cols-[7rem_1fr]",
        speaker.isLearner ? "bg-surface-2/50" : "bg-surface",
        active ? "border-accent shadow-soft" : "border-line",
      )}
    >
      <div className="flex items-baseline gap-2 sm:flex-col sm:gap-0.5">
        <span lang="ja" className="font-jp text-sm text-fg">
          {speaker.nameJa}
        </span>
        <span className="text-xs text-faint">{speaker.nameDe}</span>
      </div>
      <div className="flex min-w-0 flex-col gap-3">
        <JapaneseText
          japanese={line.japanese}
          furigana={line.furigana}
          reading={line.reading}
          romaji={line.romaji}
          german={line.german}
          audioUrl={line.audioUrl}
          audioPitch={pitch}
          furiganaMode={furigana === null ? undefined : furiganaOn ? "always" : "off"}
          translationMode={translation === null ? undefined : translationOn ? "always" : "off"}
        />
        <div className="flex flex-wrap gap-1.5" role="group" aria-label="Hilfen für diese Zeile">
          <Toggle pressed={furiganaOn} onClick={() => setFurigana(!furiganaOn)}>
            Furigana
          </Toggle>
          <Toggle pressed={translationOn} onClick={() => setTranslation(!translationOn)}>
            Deutsch
          </Toggle>
          <Toggle pressed={breakdown} onClick={() => setBreakdown(!breakdown)}>
            Aufschlüsselung
          </Toggle>
        </div>
        {breakdown ? (
          <div className="animate-in flex flex-col gap-3 border-t border-line pt-3">
            {words.length > 0 ? (
              <div>
                <p className="mb-1.5 text-xs text-muted">Wörter</p>
                <ul className="flex flex-wrap gap-1.5">
                  {words.map((word) => (
                    <li key={word.id}>
                      <button
                        type="button"
                        onClick={() => onWord(word)}
                        className="inline-flex h-8 items-center gap-1.5 rounded-full border border-line bg-surface px-3 text-xs text-muted hover:border-line-strong hover:text-fg"
                      >
                        <span lang="ja" className="font-jp text-sm text-fg">
                          {word.japanese}
                        </span>
                        {word.german[0]}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
            {grammar.length > 0 ? (
              <div>
                <p className="mb-1.5 text-xs text-muted">Grammatik</p>
                <ul className="flex flex-wrap gap-1.5">
                  {grammar.map((g) => (
                    <li key={g.id}>
                      <Link
                        href={`/grammar/${g.slug}`}
                        className="inline-flex h-8 items-center gap-1.5 rounded-full border border-accent/30 bg-accent-soft/50 px-3 text-xs text-accent hover:border-accent/60"
                      >
                        <span lang="ja" className="font-jp text-sm">
                          {g.pattern.split(" / ")[0]}
                        </span>
                        {g.meaningDe}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
            {line.noteDe ? (
              <p className="text-sm leading-relaxed text-muted">{line.noteDe}</p>
            ) : null}
            <PronunciationCheck japanese={line.japanese} reading={line.reading} compact />
          </div>
        ) : null}
      </div>
    </li>
  );
}
