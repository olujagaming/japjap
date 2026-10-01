"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Button, ButtonLink } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ProgressBar } from "@/components/ui/progress-bar";
import { EmptyState } from "@/components/ui/states";
import { KANA, ROW_LABELS } from "@/data/kana";
import { getUserDataStore, useProgressList } from "@/hooks/use-user-data";
import { useSettings } from "@/hooks/use-settings";
import {
  buildSession,
  PRACTICE_MODE_META,
  PRACTICE_MODES,
  verdictToRating,
  type PracticeMode,
  type Question,
} from "@/lib/kana/practice";
import { applyRating, isKnownStatus } from "@/lib/learning/progress";
import { emptyProgress } from "@/lib/store/types";
import { cn } from "@/lib/utils";
import { useAudio } from "@/providers/audio-provider";
import type { Kana, KanaGroup, ScriptType } from "@/types/content";
import { PracticeQuestion, type AnswerResult } from "./practice-question";

type ScriptChoice = ScriptType | "both";

const GROUP_OPTIONS: { value: KanaGroup; label: string }[] = [
  { value: "basic", label: "Grundzeichen" },
  { value: "dakuten", label: "Dakuten" },
  { value: "handakuten", label: "Handakuten" },
  { value: "yoon", label: "Kombinationen" },
  { value: "extended", label: "Erweitert" },
];

const BASIC_ROWS = ["vowel", "k", "s", "t", "n", "h", "m", "y", "r", "w", "nn"];
const ROW_SAMPLE: Record<string, string> = {
  vowel: "あ",
  k: "か",
  s: "さ",
  t: "た",
  n: "な",
  h: "は",
  m: "ま",
  y: "や",
  r: "ら",
  w: "わ",
  nn: "ん",
};

function Chip({
  checked,
  onChange,
  children,
  type = "checkbox",
  name,
}: {
  checked: boolean;
  onChange: () => void;
  children: React.ReactNode;
  type?: "checkbox" | "radio";
  name: string;
}) {
  return (
    <label
      className={cn(
        "inline-flex h-9 cursor-pointer items-center gap-1.5 rounded-full border px-3.5 text-sm transition-colors has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-accent/40",
        checked
          ? "border-accent bg-accent-soft font-medium text-fg"
          : "border-line bg-surface text-muted hover:text-fg",
      )}
    >
      <input type={type} name={name} checked={checked} onChange={onChange} className="sr-only" />
      {children}
    </label>
  );
}

function Fieldset({ legend, children }: { legend: string; children: React.ReactNode }) {
  return (
    <fieldset>
      <legend className="mb-2.5 text-sm font-medium text-fg">{legend}</legend>
      <div className="flex flex-wrap gap-2">{children}</div>
    </fieldset>
  );
}

type Answered = { question: Question; result: AnswerResult };

export function KanaPractice() {
  const params = useSearchParams();
  const presetChars = useMemo(
    () =>
      (params.get("chars") ?? "")
        .split(",")
        .map((c) => c.trim())
        .filter(Boolean),
    [params],
  );
  const presetMode = PRACTICE_MODES.find((m) => m === params.get("mode"));

  const [mode, setMode] = useState<PracticeMode>(presetMode ?? "recognition");
  const [script, setScript] = useState<ScriptChoice>(
    params.get("script") === "katakana" ? "katakana" : "hiragana",
  );
  const [groups, setGroups] = useState<Set<KanaGroup>>(new Set(["basic"]));
  const [rows, setRows] = useState<Set<string>>(new Set(BASIC_ROWS));
  const [length, setLength] = useState(15);
  const [usePreset, setUsePreset] = useState(presetChars.length > 0);

  const [questions, setQuestions] = useState<Question[] | null>(null);
  const [index, setIndex] = useState(0);
  const [result, setResult] = useState<AnswerResult | null>(null);
  const [answered, setAnswered] = useState<Answered[]>([]);
  const nextButton = useRef<HTMLButtonElement>(null);

  const { data: records } = useProgressList("kana");
  const [settings] = useSettings();
  const { play } = useAudio();

  const pool = useMemo(() => {
    if (usePreset) return KANA.filter((k) => presetChars.includes(k.character));
    return KANA.filter(
      (k) =>
        (script === "both" || k.scriptType === script) &&
        groups.has(k.group) &&
        (k.group !== "basic" || rows.has(k.row)),
    );
  }, [usePreset, presetChars, script, groups, rows]);

  const toggle = <T,>(set: Set<T>, value: T) => {
    const next = new Set(set);
    if (next.has(value)) next.delete(value);
    else next.add(value);
    return next;
  };

  const start = (customPool?: Kana[]) => {
    const progress = new Map(records.map((r) => [r.contentId, r]));
    const readable = new Set(
      records
        .filter((r) => isKnownStatus(r.status))
        .map((r) => KANA.find((k) => k.id === r.contentId)?.character)
        .filter((c): c is string => Boolean(c)),
    );
    const session = buildSession({
      pool: customPool ?? pool,
      allKana: KANA,
      mode,
      length,
      progress,
      readable,
    });
    setQuestions(session);
    setIndex(0);
    setResult(null);
    setAnswered([]);
  };

  const onAnswer = useCallback(
    (answer: AnswerResult) => {
      if (!questions) return;
      const question = questions[index];
      setResult(answer);
      setAnswered((list) => [...list, { question, result: answer }]);
      if (settings.audioAutoplay) play({ text: question.kana.character }).catch(() => undefined);

      const store = getUserDataStore();
      const rating = verdictToRating(answer.verdict);
      void (async () => {
        const current =
          (await store.getProgress("kana", question.kana.id)) ??
          emptyProgress("kana", question.kana.id);
        await store.saveProgress(applyRating(current, rating));
        await store.recordReview({
          contentType: "kana",
          contentId: question.kana.id,
          taskType: question.taskType,
          rating,
          answer: answer.answer,
          reviewedAt: new Date().toISOString(),
        });
      })();
    },
    [questions, index, settings.audioAutoplay, play],
  );

  useEffect(() => {
    if (result) nextButton.current?.focus();
  }, [result]);

  const next = () => {
    if (!questions) return;
    setResult(null);
    setIndex((i) => i + 1);
  };

  // ---------- Zusammenfassung ----------
  if (questions && index >= questions.length) {
    const correct = answered.filter((a) => a.result.verdict === "correct").length;
    const mistakes = [
      ...new Map(
        answered
          .filter((a) => a.result.verdict !== "correct")
          .map((a) => [a.question.kana.id, a.question.kana]),
      ).values(),
    ];
    return (
      <div className="mx-auto flex max-w-xl flex-col gap-8">
        <div>
          <p className="text-sm text-muted">Runde abgeschlossen</p>
          <p className="mt-1 text-3xl font-semibold tracking-tight tabular-nums">
            {correct} von {answered.length} richtig
          </p>
        </div>
        {mistakes.length > 0 ? (
          <Card>
            <p className="text-sm font-medium">Noch einmal ansehen</p>
            <ul className="mt-3 flex flex-wrap gap-2">
              {mistakes.map((k) => (
                <li key={k.id}>
                  <Link
                    href={`/kana/${encodeURIComponent(k.character)}`}
                    className="flex min-w-14 flex-col items-center rounded-md border border-akane/30 bg-akane-soft/40 px-2.5 py-1.5"
                  >
                    <span lang="ja" className="font-jp text-2xl">
                      {k.character}
                    </span>
                    <span className="text-xs text-muted">{k.romaji}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </Card>
        ) : (
          <p className="text-muted">
            Alles richtig. Die Zeichen kommen zum passenden Zeitpunkt wieder.
          </p>
        )}
        <div className="flex flex-wrap gap-2">
          {mistakes.length > 0 ? (
            <Button onClick={() => start(mistakes)}>Fehler wiederholen</Button>
          ) : null}
          <Button variant={mistakes.length > 0 ? "secondary" : "primary"} onClick={() => start()}>
            Neue Runde
          </Button>
          <Button variant="ghost" onClick={() => setQuestions(null)}>
            Einstellungen ändern
          </Button>
        </div>
      </div>
    );
  }

  // ---------- Laufende Runde ----------
  if (questions) {
    const question = questions[index];
    return (
      <div className="mx-auto flex max-w-xl flex-col gap-10">
        <div className="flex items-center gap-4">
          <ProgressBar
            value={index}
            max={questions.length}
            label="Fortschritt der Runde"
            className="flex-1"
          />
          <span className="text-xs text-faint tabular-nums">
            {index + 1}/{questions.length}
          </span>
          <Button size="sm" variant="ghost" onClick={() => setQuestions(null)}>
            Beenden
          </Button>
        </div>
        <PracticeQuestion key={index} question={question} result={result} onAnswer={onAnswer} />
        {result ? (
          <div className="flex justify-center">
            <Button ref={nextButton} onClick={next} size="lg">
              {index + 1 < questions.length ? "Weiter" : "Auswertung"}
            </Button>
          </div>
        ) : null}
      </div>
    );
  }

  // ---------- Einrichtung ----------
  return (
    <div className="flex max-w-3xl flex-col gap-8">
      <Fieldset legend="Übungsart">
        <div className="grid w-full gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {PRACTICE_MODES.map((m) => (
            <label
              key={m}
              className={cn(
                "flex cursor-pointer flex-col rounded-lg border px-4 py-3 transition-colors has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-accent/40",
                mode === m
                  ? "border-accent bg-accent-soft"
                  : "border-line bg-surface hover:border-line-strong",
              )}
            >
              <input
                type="radio"
                name="mode"
                checked={mode === m}
                onChange={() => setMode(m)}
                className="sr-only"
              />
              <span className="text-sm font-medium">{PRACTICE_MODE_META[m].label}</span>
              <span className="mt-0.5 text-xs text-muted">{PRACTICE_MODE_META[m].description}</span>
            </label>
          ))}
        </div>
      </Fieldset>

      {usePreset ? (
        <Card className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm text-muted">Ausgewählte Zeichen</p>
            <p lang="ja" className="mt-1 font-jp text-2xl tracking-wider">
              {presetChars.join(" ")}
            </p>
          </div>
          <Button variant="ghost" onClick={() => setUsePreset(false)}>
            Eigene Auswahl
          </Button>
        </Card>
      ) : (
        <>
          <Fieldset legend="Schrift">
            {(["hiragana", "katakana", "both"] as const).map((value) => (
              <Chip
                key={value}
                type="radio"
                name="script"
                checked={script === value}
                onChange={() => setScript(value)}
              >
                {value === "hiragana" ? "Hiragana" : value === "katakana" ? "Katakana" : "Beide"}
              </Chip>
            ))}
          </Fieldset>
          <Fieldset legend="Zeichengruppen">
            {GROUP_OPTIONS.filter((g) => g.value !== "extended" || script !== "hiragana").map(
              (g) => (
                <Chip
                  key={g.value}
                  name="groups"
                  checked={groups.has(g.value)}
                  onChange={() => setGroups(toggle(groups, g.value))}
                >
                  {g.label}
                </Chip>
              ),
            )}
          </Fieldset>
          {groups.has("basic") ? (
            <Fieldset legend="Reihen der Grundzeichen">
              {BASIC_ROWS.map((row) => (
                <Chip
                  key={row}
                  name="rows"
                  checked={rows.has(row)}
                  onChange={() => setRows(toggle(rows, row))}
                >
                  <span lang="ja" className="font-jp">
                    {script === "katakana"
                      ? KANA.find(
                          (k) =>
                            k.scriptType === "katakana" && k.row === row && k.group === "basic",
                        )?.character
                      : ROW_SAMPLE[row]}
                  </span>
                  <span className="text-xs text-faint">
                    {row === "vowel" ? "Vokale" : ROW_LABELS[row]}
                  </span>
                </Chip>
              ))}
            </Fieldset>
          ) : null}
        </>
      )}

      <Fieldset legend="Länge">
        {[10, 15, 25].map((n) => (
          <Chip
            key={n}
            type="radio"
            name="length"
            checked={length === n}
            onChange={() => setLength(n)}
          >
            {n} Fragen
          </Chip>
        ))}
      </Fieldset>

      {pool.length === 0 ? (
        <EmptyState
          title="Keine Zeichen ausgewählt."
          description="Wähle mindestens eine Gruppe und eine Reihe aus."
        />
      ) : (
        <div className="flex flex-wrap items-center gap-4 border-t border-line pt-6">
          <Button size="lg" onClick={() => start()}>
            Übung starten
          </Button>
          <span className="text-sm text-muted">{pool.length} Zeichen in der Auswahl</span>
          <ButtonLink href="/kana" variant="ghost" className="ml-auto">
            Zur Übersicht
          </ButtonLink>
        </div>
      )}
    </div>
  );
}
