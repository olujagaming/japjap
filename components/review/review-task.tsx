"use client";

import Link from "next/link";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { AudioButton } from "@/components/japanese/audio-button";
import { FuriganaText } from "@/components/japanese/furigana-text";
import { JapaneseText } from "@/components/japanese/japanese-text";
import { FeedbackPanel } from "@/components/learning/feedback-panel";
import { Button } from "@/components/ui/button";
import { SpeakerIcon } from "@/components/ui/icons";
import { evaluateRoleplayAnswer } from "@/lib/conversation/roleplay";
import { checkRomajiAnswer, toRomaji } from "@/lib/japanese/romaji";
import { checkGermanAnswer, checkJapaneseAnswer } from "@/lib/review/answers";
import type { ReviewTask } from "@/lib/review/tasks";
import { speakerPitch } from "@/lib/learning/conversation";
import { useAudio } from "@/providers/audio-provider";

/** „open“: freie Formulierung, die der Nutzer selbst einschätzt. */
export type TaskVerdict = "correct" | "almost" | "incorrect" | "open";
export type TaskResult = { verdict: TaskVerdict; answer: string };

const inputClass =
  "h-14 w-full max-w-md rounded-lg border border-line-strong bg-surface px-4 text-center text-xl text-fg placeholder:text-faint focus:border-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/25 disabled:opacity-70";

function AnswerInput({
  label,
  placeholder,
  lang,
  disabled,
  onSubmit,
}: {
  label: string;
  placeholder: string;
  lang: "de" | "ja";
  disabled: boolean;
  onSubmit: (value: string) => void;
}) {
  const [value, setValue] = useState("");
  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (!disabled) onSubmit(value);
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
        lang={lang}
        placeholder={placeholder}
        className={inputClass}
      />
      {!disabled ? (
        <div className="flex gap-2">
          <Button type="submit">{value.trim() ? "Prüfen" : "Lösung zeigen"}</Button>
        </div>
      ) : null}
    </form>
  );
}

const FEEDBACK_VERDICT = {
  correct: "correct",
  almost: "almost",
  incorrect: "incorrect",
  open: "almost",
} as const;

function Feedback({
  result,
  children,
  hint,
}: {
  result: TaskResult;
  children: React.ReactNode;
  hint?: React.ReactNode;
}) {
  if (result.verdict === "open") {
    return (
      <div
        role="status"
        className="animate-in w-full max-w-md rounded-lg border border-line bg-surface p-4"
      >
        <p className="text-sm text-muted">
          {result.answer
            ? "Deine Formulierung weicht von der Musterantwort ab – das kann trotzdem passen."
            : "Musterantwort:"}
        </p>
        <div className="mt-3">{children}</div>
        {hint ? <p className="mt-2 text-sm text-muted">{hint}</p> : null}
      </div>
    );
  }
  return (
    <FeedbackPanel verdict={FEEDBACK_VERDICT[result.verdict]} hint={hint}>
      {children}
    </FeedbackPanel>
  );
}

function Prompt({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center gap-4 text-center">
      <p className="text-sm text-muted">{label}</p>
      {children}
    </div>
  );
}

/** Rendert eine Review-Aufgabe und ihre Rückmeldung. `onAnswer` wird genau einmal aufgerufen. */
export function ReviewTaskView({
  task,
  result,
  onAnswer,
}: {
  task: ReviewTask;
  result: TaskResult | null;
  onAnswer: (result: TaskResult) => void;
}) {
  const { play } = useAudio();
  const answered = result !== null;
  const autoplayed = useRef<ReviewTask | null>(null);

  useEffect(() => {
    if (task.kind === "vocab-listening" && autoplayed.current !== task) {
      autoplayed.current = task;
      play({ text: task.word.reading }).catch(() => undefined);
    }
  }, [task, play]);

  switch (task.kind) {
    case "kana-reading": {
      const accepted = [task.kana.romaji, ...task.kana.alternatives];
      return (
        <div className="flex flex-col items-center gap-8">
          <Prompt label="Wie liest man dieses Zeichen?">
            <p lang="ja" className="font-jp text-8xl leading-none">
              {task.kana.character}
            </p>
          </Prompt>
          <AnswerInput
            label="Lesung in Romaji"
            placeholder="Romaji"
            lang="ja"
            disabled={answered}
            onSubmit={(v) => onAnswer({ verdict: checkRomajiAnswer(v, accepted), answer: v })}
          />
          {result ? (
            <Feedback result={result} hint={task.kana.pronunciation}>
              <div className="flex items-center gap-3">
                <span lang="ja" className="font-jp text-3xl">
                  {task.kana.character}
                </span>
                <span className="text-lg font-medium">{task.kana.romaji}</span>
                <AudioButton text={task.kana.character} size="sm" />
              </div>
            </Feedback>
          ) : null}
        </div>
      );
    }

    case "vocab-meaning":
      return (
        <div className="flex flex-col items-center gap-8">
          <Prompt label="Was bedeutet dieses Wort?">
            <JapaneseText
              japanese={task.word.japanese}
              furigana={task.word.furigana}
              reading={task.word.reading}
              size="xl"
              romajiVisible={false}
              align="center"
            />
          </Prompt>
          <AnswerInput
            label="Deutsche Bedeutung"
            placeholder="Auf Deutsch"
            lang="de"
            disabled={answered}
            onSubmit={(v) =>
              onAnswer({ verdict: checkGermanAnswer(v, task.word.german), answer: v })
            }
          />
          {result ? (
            <Feedback result={result} hint={task.word.noteDe}>
              <p className="text-lg">{task.word.german.join(", ")}</p>
              <p className="mt-1 text-sm text-muted">
                <span lang="ja" className="font-jp">
                  {task.word.reading}
                </span>{" "}
                · {task.word.romaji}
              </p>
            </Feedback>
          ) : null}
        </div>
      );

    case "vocab-recall":
    case "vocab-listening": {
      const target = {
        japanese: [task.word.japanese, task.word.reading],
        romaji: [task.word.romaji, toRomaji(task.word.reading)],
      };
      return (
        <div className="flex flex-col items-center gap-8">
          {task.kind === "vocab-recall" ? (
            <Prompt label="Wie heißt das auf Japanisch?">
              <p className="text-3xl font-semibold tracking-tight">{task.word.german.join(", ")}</p>
            </Prompt>
          ) : (
            <Prompt label="Welches Wort hörst du?">
              <Button
                variant="secondary"
                size="lg"
                onClick={() => play({ text: task.word.reading }).catch(() => undefined)}
              >
                <SpeakerIcon size={22} /> Nochmal hören
              </Button>
            </Prompt>
          )}
          <AnswerInput
            label="Japanisch oder Romaji"
            placeholder="Kana, Kanji oder Romaji"
            lang="ja"
            disabled={answered}
            onSubmit={(v) => onAnswer({ verdict: checkJapaneseAnswer(v, target), answer: v })}
          />
          {result ? (
            <Feedback result={result} hint={task.word.noteDe}>
              <JapaneseText
                japanese={task.word.japanese}
                furigana={task.word.furigana}
                reading={task.word.reading}
                romaji={task.word.romaji}
                german={task.word.german.join(", ")}
                translationMode="always"
                romajiVisible
                furiganaMode="always"
              />
            </Feedback>
          ) : null}
        </div>
      );
    }

    case "kanji-meaning":
      return (
        <div className="flex flex-col items-center gap-8">
          <Prompt label="Was bedeutet dieses Kanji?">
            <p lang="ja" className="font-jp text-8xl leading-none">
              {task.kanji.character}
            </p>
          </Prompt>
          <AnswerInput
            label="Deutsche Bedeutung"
            placeholder="Auf Deutsch"
            lang="de"
            disabled={answered}
            onSubmit={(v) =>
              onAnswer({ verdict: checkGermanAnswer(v, task.kanji.meaningsDe), answer: v })
            }
          />
          {result ? (
            <Feedback result={result} hint={task.kanji.noteDe}>
              <p className="text-lg">{task.kanji.meaningsDe.join(", ")}</p>
              <p lang="ja" className="mt-1 font-jp text-sm text-muted">
                {[...task.kanji.onyomi, ...task.kanji.kunyomi].join("・")}
              </p>
            </Feedback>
          ) : null}
        </div>
      );

    case "grammar-cloze": {
      const { cloze, point } = task;
      return (
        <div className="flex flex-col items-center gap-8">
          <Prompt label="Setze die passende Form ein.">
            <p lang="ja" className="jp-text font-jp text-2xl sm:text-3xl" data-furigana="always">
              <FuriganaText japanese={cloze.japanese} furigana={cloze.furigana} />
            </p>
            <p className="text-fg/85">{cloze.german}</p>
            {cloze.hintDe ? <p className="text-sm text-muted">Hinweis: {cloze.hintDe}</p> : null}
          </Prompt>
          <AnswerInput
            label="Fehlender Teil"
            placeholder="Japanisch oder Romaji"
            lang="ja"
            disabled={answered}
            onSubmit={(v) =>
              onAnswer({
                verdict: checkJapaneseAnswer(v, { japanese: cloze.answers, romaji: cloze.romaji }),
                answer: v,
              })
            }
          />
          {result ? (
            <Feedback
              result={result}
              hint={
                <>
                  <span lang="ja" className="font-jp">
                    {point.pattern}
                  </span>
                  : {point.meaningDe}.{" "}
                  <Link
                    href={`/grammar/${point.slug}`}
                    className="text-accent underline-offset-4 hover:underline"
                  >
                    Erklärung
                  </Link>
                </>
              }
            >
              <div className="flex items-center gap-3">
                <p lang="ja" className="font-jp text-xl">
                  {cloze.solution}
                </p>
                <AudioButton text={cloze.solution} size="sm" />
              </div>
              {cloze.answers.length > 1 ? (
                <p className="mt-1 text-sm text-muted">
                  Auch richtig:{" "}
                  <span lang="ja" className="font-jp">
                    {cloze.answers.slice(1).join("、")}
                  </span>
                </p>
              ) : null}
            </Feedback>
          ) : null}
        </div>
      );
    }

    case "grammar-meaning":
      return (
        <div className="flex flex-col items-center gap-8">
          <Prompt label="Was drückt dieses Muster aus?">
            <p lang="ja" className="font-jp text-4xl">
              {task.point.pattern}
            </p>
          </Prompt>
          <AnswerInput
            label="Bedeutung"
            placeholder="Auf Deutsch"
            lang="de"
            disabled={answered}
            onSubmit={(v) =>
              onAnswer({ verdict: checkGermanAnswer(v, [task.point.meaningDe]), answer: v })
            }
          />
          {result ? (
            <Feedback result={result} hint={task.point.explanationDe}>
              <p className="text-lg">{task.point.meaningDe}</p>
            </Feedback>
          ) : null}
        </div>
      );

    case "situational": {
      const { line, previous, conversation } = task;
      return (
        <div className="flex flex-col items-center gap-8">
          <Prompt label={`Situation: ${task.situationTitleDe} – ${conversation.titleDe}`}>
            {previous ? (
              <div className="w-full max-w-md rounded-lg border border-line bg-surface p-4 text-left">
                <JapaneseText
                  japanese={previous.japanese}
                  furigana={previous.furigana}
                  reading={previous.reading}
                  romaji={previous.romaji}
                  german={previous.german}
                  audioPitch={speakerPitch(conversation, previous.speaker)}
                />
              </div>
            ) : null}
            <p className="text-xl">
              Wie sagst du: <span className="font-semibold">„{line.german}“</span>?
            </p>
          </Prompt>
          <AnswerInput
            label="Deine Antwort"
            placeholder="Japanisch oder Romaji"
            lang="ja"
            disabled={answered}
            onSubmit={(v) => {
              const verdict = evaluateRoleplayAnswer(v, line);
              onAnswer({
                verdict: verdict === "match" ? "correct" : verdict === "close" ? "almost" : "open",
                answer: v,
              });
            }}
          />
          {result ? (
            <Feedback result={result} hint={line.noteDe}>
              <JapaneseText
                japanese={line.japanese}
                furigana={line.furigana}
                reading={line.reading}
                romaji={line.romaji}
                german={line.german}
                translationMode="always"
              />
            </Feedback>
          ) : null}
        </div>
      );
    }
  }
}
