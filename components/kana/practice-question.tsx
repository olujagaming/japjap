"use client";

import Link from "next/link";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { AudioButton } from "@/components/japanese/audio-button";
import { FeedbackPanel } from "@/components/learning/feedback-panel";
import { Button } from "@/components/ui/button";
import { SpeakerIcon } from "@/components/ui/icons";
import { acceptedRomaji, type Question } from "@/lib/kana/practice";
import { checkRomajiAnswer, type AnswerVerdict } from "@/lib/japanese/romaji";
import { cn } from "@/lib/utils";
import { useAudio } from "@/providers/audio-provider";
import type { Kana } from "@/types/content";

export type AnswerResult = { verdict: AnswerVerdict; answer: string };

const inputClass =
  "h-14 w-full max-w-xs rounded-lg border border-line-strong bg-surface px-4 text-center text-xl tracking-wide text-fg placeholder:text-faint focus:border-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/25 disabled:opacity-70";

function kanaHref(kana: Kana) {
  return `/kana/${encodeURIComponent(kana.character)}`;
}

function RomajiInput({
  onSubmit,
  disabled,
  label,
}: {
  onSubmit: (value: string) => void;
  disabled: boolean;
  label: string;
}) {
  const [value, setValue] = useState("");
  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (!disabled && value.trim()) onSubmit(value);
  };
  return (
    <form onSubmit={submit} className="flex w-full flex-col items-center gap-3">
      <input
        aria-label={label}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        disabled={disabled}
        autoFocus
        autoComplete="off"
        autoCapitalize="off"
        autoCorrect="off"
        spellCheck={false}
        lang="en"
        placeholder="Romaji eingeben"
        className={inputClass}
      />
      {!disabled ? (
        <Button type="submit" disabled={!value.trim()}>
          Prüfen
        </Button>
      ) : null}
    </form>
  );
}

function KanaChoices({
  options,
  answered,
  correct,
  chosen,
  onChoose,
  showRomaji = false,
}: {
  options: Kana[];
  answered: boolean;
  correct: Kana;
  chosen: string | null;
  onChoose: (kana: Kana) => void;
  showRomaji?: boolean;
}) {
  // Zifferntasten 1–9 wählen eine Option
  useEffect(() => {
    if (answered) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.target instanceof HTMLInputElement) return;
      const index = Number(event.key) - 1;
      if (index >= 0 && index < options.length) onChoose(options[index]);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [answered, options, onChoose]);

  return (
    <ul
      className={cn(
        "grid w-full max-w-md gap-2",
        options.length === 2 ? "grid-cols-2" : "grid-cols-3",
      )}
    >
      {options.map((option, index) => {
        const isCorrect = answered && option.character === correct.character;
        const isWrongChoice = answered && chosen === option.character && !isCorrect;
        return (
          <li key={option.id}>
            <button
              type="button"
              disabled={answered}
              onClick={() => onChoose(option)}
              aria-label={`${index + 1}: ${showRomaji ? option.romaji : option.character}`}
              className={cn(
                "relative flex h-20 w-full flex-col items-center justify-center rounded-lg border bg-surface transition-colors",
                !answered && "border-line hover:border-accent/60 hover:bg-surface-2/50",
                isCorrect && "border-matcha bg-matcha-soft/70",
                isWrongChoice && "border-akane bg-akane-soft/70",
                answered && !isCorrect && !isWrongChoice && "border-line opacity-50",
              )}
            >
              <span
                aria-hidden="true"
                className="absolute top-1.5 left-2 text-[0.65rem] text-faint"
              >
                {index + 1}
              </span>
              {showRomaji ? (
                <span className="text-xl font-medium">{option.romaji}</span>
              ) : (
                <span lang="ja" className="font-jp text-3xl">
                  {option.character}
                </span>
              )}
            </button>
          </li>
        );
      })}
    </ul>
  );
}

function BigKana({ children, small = false }: { children: string; small?: boolean }) {
  return (
    <p
      lang="ja"
      className={cn(
        "font-jp leading-none text-fg",
        small ? "text-6xl sm:text-7xl" : "text-8xl sm:text-9xl",
      )}
    >
      {children}
    </p>
  );
}

function Solution({ kana }: { kana: Kana }) {
  return (
    <div className="flex items-center gap-3">
      <Link href={kanaHref(kana)} lang="ja" className="font-jp text-3xl hover:underline">
        {kana.character}
      </Link>
      <span className="text-lg font-medium">{kana.romaji}</span>
      <AudioButton text={kana.character} size="sm" />
    </div>
  );
}

/**
 * Rendert eine Übungsfrage samt Rückmeldung. `onAnswer` wird genau einmal aufgerufen;
 * danach bleibt die Frage mit Lösung sichtbar, bis der Container weiterschaltet.
 */
export function PracticeQuestion({
  question,
  result,
  onAnswer,
}: {
  question: Question;
  result: AnswerResult | null;
  onAnswer: (result: AnswerResult) => void;
}) {
  const { play } = useAudio();
  const answered = result !== null;
  const playKana = () => play({ text: question.kana.character }).catch(() => undefined);

  // Hörfragen spielen den Laut beim Erscheinen automatisch ab.
  const autoplayed = useRef<Question | null>(null);
  useEffect(() => {
    if (
      question.kind === "choose-kana" &&
      question.prompt === "audio" &&
      autoplayed.current !== question
    ) {
      autoplayed.current = question;
      play({ text: question.kana.character }).catch(() => undefined);
    }
  }, [question, play]);

  switch (question.kind) {
    case "type-romaji":
      return (
        <div className="flex flex-col items-center gap-8">
          <p className="text-sm text-muted">Wie liest man dieses Zeichen?</p>
          <BigKana>{question.kana.character}</BigKana>
          <RomajiInput
            label="Lesung in Romaji"
            disabled={answered}
            onSubmit={(value) =>
              onAnswer({
                verdict: checkRomajiAnswer(value, acceptedRomaji(question.kana)),
                answer: value,
              })
            }
          />
          {result ? (
            <FeedbackPanel verdict={result.verdict} hint={question.kana.pronunciation}>
              <Solution kana={question.kana} />
            </FeedbackPanel>
          ) : null}
        </div>
      );

    case "choose-kana":
      return (
        <div className="flex flex-col items-center gap-8">
          {question.prompt === "romaji" ? (
            <>
              <p className="text-sm text-muted">Welches Zeichen ist das?</p>
              <p className="text-6xl font-semibold tracking-tight">{question.kana.romaji}</p>
            </>
          ) : (
            <>
              <p className="text-sm text-muted">Welches Zeichen hörst du?</p>
              <Button
                variant="secondary"
                size="lg"
                onClick={playKana}
                aria-label="Laut erneut abspielen"
              >
                <SpeakerIcon size={22} />
                Nochmal hören
              </Button>
            </>
          )}
          <KanaChoices
            options={question.options}
            answered={answered}
            correct={question.kana}
            chosen={result?.answer ?? null}
            onChoose={(kana) =>
              onAnswer({
                verdict: kana.character === question.kana.character ? "correct" : "incorrect",
                answer: kana.character,
              })
            }
          />
          {result ? (
            <FeedbackPanel verdict={result.verdict}>
              <Solution kana={question.kana} />
            </FeedbackPanel>
          ) : null}
        </div>
      );

    case "read-word":
      return (
        <div className="flex flex-col items-center gap-8">
          <p className="text-sm text-muted">Lies das Wort und tippe es in Romaji.</p>
          <BigKana small>{question.word.reading}</BigKana>
          <RomajiInput
            label="Wort in Romaji"
            disabled={answered}
            onSubmit={(value) =>
              onAnswer({ verdict: checkRomajiAnswer(value, question.accepted), answer: value })
            }
          />
          {result ? (
            <FeedbackPanel
              verdict={result.verdict}
              hint={
                result.verdict === "almost"
                  ? "Achte auf lange Vokale und verdoppelte Konsonanten."
                  : undefined
              }
            >
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                <span lang="ja" className="font-jp text-2xl">
                  {question.word.japanese}
                </span>
                <span className="text-lg font-medium">{question.word.romaji}</span>
                <AudioButton text={question.word.reading} size="sm" />
              </div>
              <p className="mt-1 text-sm text-fg/85">{question.word.german}</p>
            </FeedbackPanel>
          ) : null}
        </div>
      );

    case "confusion":
      return (
        <div className="flex flex-col items-center gap-8">
          <p className="text-sm text-muted">Welche Lesung hat dieses Zeichen?</p>
          <BigKana>{question.kana.character}</BigKana>
          <KanaChoices
            options={question.options}
            answered={answered}
            correct={question.kana}
            chosen={result?.answer ?? null}
            showRomaji
            onChoose={(kana) =>
              onAnswer({
                verdict: kana.character === question.kana.character ? "correct" : "incorrect",
                answer: kana.character,
              })
            }
          />
          {result ? (
            <FeedbackPanel verdict={result.verdict} hint={question.tipDe}>
              <ul className="flex gap-4">
                {question.options.map((k) => (
                  <li key={k.id} className="flex flex-col items-center">
                    <span
                      lang="ja"
                      className={cn(
                        "font-jp text-4xl",
                        k.id === question.kana.id ? "text-fg" : "text-muted",
                      )}
                    >
                      {k.character}
                    </span>
                    <span className="text-sm text-muted">{k.romaji}</span>
                  </li>
                ))}
              </ul>
            </FeedbackPanel>
          ) : null}
        </div>
      );
  }
}
