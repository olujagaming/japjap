"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState, type FormEvent, type KeyboardEvent } from "react";
import { evaluateAction, partnerTurnAction } from "@/app/(app)/practice/conversation/actions";
import { JapaneseText } from "@/components/japanese/japanese-text";
import { MicButton } from "@/components/speech/mic-button";
import { Badge } from "@/components/ui/badge";
import { Button, ButtonLink } from "@/components/ui/button";
import { getGrammar } from "@/data/grammar";
import { getVocabulary } from "@/data/vocabulary";
import { useSettings } from "@/hooks/use-settings";
import { useProgressList } from "@/hooks/use-user-data";
import { PARTNER_LABELS, POLITENESS_LABELS } from "@/lib/ai/labels";
import type {
  ConversationTurn,
  PartnerRole,
  Politeness,
  ResponseEvaluation,
} from "@/lib/ai/schemas";
import { FREE_TOPIC } from "@/lib/ai/topics";
import { isKnownStatus } from "@/lib/learning/progress";
import { LEVELS, type Level } from "@/lib/settings/schema";
import { cn } from "@/lib/utils";

type SituationOption = {
  slug: string;
  titleDe: string;
  titleJa: string;
  firstConversationId?: string;
};

type Message =
  | { id: number; role: "partner"; turn: ConversationTurn }
  | {
      id: number;
      role: "learner";
      text: string;
      evaluation?: ResponseEvaluation;
      evaluating?: boolean;
      evaluationError?: string;
    };

const LEVEL_LABELS: Record<Level, string> = {
  beginner: "Einstieg",
  elementary: "Grundstufe",
  intermediate: "Mittelstufe",
  advanced: "Fortgeschritten",
};

const DEFAULT_PARTNER: Record<string, PartnerRole> = {
  greeting: "friend",
  introduction: "colleague",
  konbini: "clerk",
  cafe: "clerk",
  restaurant: "waiter",
  station: "staff",
  hotel: "hotel-reception",
  shopping: "clerk",
  friends: "friend",
  directions: "staff",
  [FREE_TOPIC]: "friend",
};

const RATING_META = {
  correct: { label: "passt", tone: "matcha" },
  acceptable: { label: "geht", tone: "kohaku" },
  "needs-work": { label: "üben", tone: "akane" },
} as const;

const CRITERIA: {
  key: keyof Pick<ResponseEvaluation, "understandable" | "grammar" | "naturalness" | "politeness">;
  label: string;
}[] = [
  { key: "understandable", label: "Verständlichkeit" },
  { key: "grammar", label: "Grammatik" },
  { key: "naturalness", label: "Natürlichkeit" },
  { key: "politeness", label: "Höflichkeit" },
];

function Select<T extends string>({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: T;
  options: { value: T; label: string }[];
  onChange: (value: T) => void;
}) {
  return (
    <label className="flex flex-col gap-1.5 text-sm">
      <span className="font-medium">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as T)}
        className="h-10 rounded-md border border-line bg-surface px-3 text-base focus-visible:ring-2 focus-visible:ring-accent/30 focus-visible:outline-none"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </label>
  );
}

function PartnerMessage({ turn }: { turn: ConversationTurn }) {
  const [translation, setTranslation] = useState(false);
  const [reading, setReading] = useState(false);
  const [words, setWords] = useState(false);
  const toggle = "h-7 rounded-full border px-2.5 text-xs transition-colors";
  const on = "border-accent/40 bg-accent-soft text-accent";
  const off = "border-line text-muted hover:text-fg";
  return (
    <div className="flex max-w-[90%] flex-col gap-2 rounded-lg border border-line bg-surface p-4 sm:max-w-[80%]">
      <JapaneseText
        japanese={turn.utterance.japanese}
        reading={turn.utterance.reading}
        romaji={turn.utterance.romaji}
        german={turn.utterance.german}
        romajiVisible={reading}
        furiganaMode={reading ? "always" : undefined}
        translationMode={translation ? "always" : "off"}
        showReading={reading}
      />
      <div className="flex flex-wrap gap-1.5" role="group" aria-label="Hilfen">
        <button
          type="button"
          aria-pressed={translation}
          onClick={() => setTranslation(!translation)}
          className={cn(toggle, translation ? on : off)}
        >
          Übersetzung
        </button>
        <button
          type="button"
          aria-pressed={reading}
          onClick={() => setReading(!reading)}
          className={cn(toggle, reading ? on : off)}
        >
          Lesung
        </button>
        {turn.newVocabulary.length > 0 ? (
          <button
            type="button"
            aria-pressed={words}
            onClick={() => setWords(!words)}
            className={cn(toggle, words ? on : off)}
          >
            Wörter erklären ({turn.newVocabulary.length})
          </button>
        ) : null}
      </div>
      {words ? (
        <ul className="flex flex-col gap-1 border-t border-line pt-2 text-sm">
          {turn.newVocabulary.map((w) => (
            <li key={w.japanese} className="flex flex-wrap items-baseline gap-x-2">
              <span lang="ja" className="font-jp text-base">
                {w.japanese}
              </span>
              <span lang="ja" className="font-jp text-muted">
                {w.reading}
              </span>
              <span>{w.german}</span>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}

function EvaluationView({ evaluation }: { evaluation: ResponseEvaluation }) {
  return (
    <div className="flex w-full flex-col gap-3 rounded-lg border border-line bg-surface p-4 text-left">
      <dl className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {CRITERIA.map(({ key, label }) => {
          const meta = RATING_META[evaluation[key]];
          return (
            <div key={key} className="flex flex-col gap-1">
              <dt className="text-xs text-muted">{label}</dt>
              <dd>
                <Badge tone={meta.tone}>{meta.label}</Badge>
              </dd>
            </div>
          );
        })}
      </dl>
      <p className="text-sm leading-relaxed">{evaluation.feedbackDe}</p>
      {evaluation.betterAlternative ? (
        <div className="border-t border-line pt-3">
          <p className="mb-1.5 text-xs text-muted">Natürlicher wäre:</p>
          <JapaneseText
            japanese={evaluation.betterAlternative.japanese}
            reading={evaluation.betterAlternative.reading}
            romaji={evaluation.betterAlternative.romaji}
            german={evaluation.betterAlternative.german}
            translationMode="always"
          />
        </div>
      ) : null}
    </div>
  );
}

/**
 * Freies Gespräch mit einem AI-Partner. Antworten kommen strukturiert und validiert vom Server;
 * Hilfen und Feedback erscheinen nur auf Wunsch, damit der Gesprächsfluss erhalten bleibt.
 */
export function AIConversation({
  aiAvailable,
  situations,
  initialSituation,
}: {
  aiAvailable: boolean;
  situations: SituationOption[];
  initialSituation?: string;
}) {
  const [settings] = useSettings();
  const { data: records } = useProgressList();
  const [situation, setSituation] = useState(initialSituation ?? FREE_TOPIC);
  const [level, setLevel] = useState<Level | null>(null);
  const [partner, setPartner] = useState<PartnerRole>(
    DEFAULT_PARTNER[initialSituation ?? FREE_TOPIC] ?? "friend",
  );
  const [politeness, setPoliteness] = useState<Politeness>(
    partner === "friend" ? "casual" : "polite",
  );
  const [messages, setMessages] = useState<Message[] | null>(null);
  const [input, setInput] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showHint, setShowHint] = useState(false);
  const nextId = useRef(1);
  const bottom = useRef<HTMLDivElement>(null);

  const effectiveLevel = level ?? settings.level;

  const learner = useMemo(() => {
    const vocab = records
      .filter(
        (r) =>
          r.contentType === "vocabulary" && (isKnownStatus(r.status) || r.status === "learning"),
      )
      .map((r) => getVocabulary(r.contentId)?.japanese)
      .filter((v): v is string => Boolean(v));
    const grammar = records
      .filter((r) => r.contentType === "grammar" && isKnownStatus(r.status))
      .map((r) => getGrammar(r.contentId)?.pattern)
      .filter((g): g is string => Boolean(g));
    return {
      level: effectiveLevel,
      knownVocabulary: vocab.slice(0, 200),
      knownGrammar: grammar.slice(0, 60),
    };
  }, [records, effectiveLevel]);

  const setup = { situationSlug: situation, partner, politeness };

  useEffect(() => {
    bottom.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [messages, pending]);

  const history = (list: Message[]) =>
    list.map((m) => ({
      role: m.role,
      japanese: m.role === "partner" ? m.turn.utterance.japanese : m.text,
    }));

  const requestTurn = async (list: Message[]) => {
    setPending(true);
    setError(null);
    const result = await partnerTurnAction({ setup, learner, history: history(list) });
    setPending(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    setMessages([...list, { id: nextId.current++, role: "partner", turn: result.data }]);
    setShowHint(false);
  };

  const start = () => {
    setMessages([]);
    void requestTurn([]);
  };

  const send = (event?: FormEvent) => {
    event?.preventDefault();
    const text = input.trim();
    if (!text || pending || !messages) return;
    const list: Message[] = [...messages, { id: nextId.current++, role: "learner", text }];
    setMessages(list);
    setInput("");
    void requestTurn(list);
  };

  const onKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && !event.shiftKey && !event.nativeEvent.isComposing) {
      event.preventDefault();
      send();
    }
  };

  const evaluate = async (id: number) => {
    if (!messages) return;
    const index = messages.findIndex((m) => m.id === id);
    const message = messages[index];
    if (!message || message.role !== "learner") return;
    const update = (patch: Partial<Extract<Message, { role: "learner" }>>) =>
      setMessages(
        (list) =>
          list?.map((m) => (m.id === id && m.role === "learner" ? { ...m, ...patch } : m)) ?? list,
      );
    update({ evaluating: true, evaluationError: undefined });
    const result = await evaluateAction({
      setup,
      learner,
      history: history(messages.slice(0, index)),
      response: message.text,
    });
    update(
      result.ok
        ? { evaluating: false, evaluation: result.data }
        : { evaluating: false, evaluationError: result.error },
    );
  };

  const lastPartner = [...(messages ?? [])]
    .reverse()
    .find((m): m is Extract<Message, { role: "partner" }> => m.role === "partner");
  const ended = lastPartner?.turn.conversationEnded ?? false;
  const chosen = situations.find((s) => s.slug === situation);

  // ---------- Einrichtung ----------
  if (messages === null) {
    return (
      <div className="flex max-w-3xl flex-col gap-6">
        <div className="grid gap-4 sm:grid-cols-2">
          <Select
            label="Situation"
            value={situation}
            onChange={(value) => {
              setSituation(value);
              const p = DEFAULT_PARTNER[value] ?? "friend";
              setPartner(p);
              setPoliteness(p === "friend" ? "casual" : "polite");
            }}
            options={[
              { value: FREE_TOPIC, label: "Freies Gespräch" },
              ...situations.map((s) => ({ value: s.slug, label: `${s.titleDe} · ${s.titleJa}` })),
            ]}
          />
          <Select
            label="Niveau"
            value={effectiveLevel}
            onChange={setLevel}
            options={LEVELS.map((l) => ({ value: l, label: LEVEL_LABELS[l] }))}
          />
          <Select
            label="Gesprächspartner"
            value={partner}
            onChange={setPartner}
            options={(Object.keys(PARTNER_LABELS) as PartnerRole[]).map((p) => ({
              value: p,
              label: `${PARTNER_LABELS[p].de} · ${PARTNER_LABELS[p].ja}`,
            }))}
          />
          <Select
            label="Höflichkeit"
            value={politeness}
            onChange={setPoliteness}
            options={(Object.keys(POLITENESS_LABELS) as Politeness[]).map((p) => ({
              value: p,
              label: POLITENESS_LABELS[p],
            }))}
          />
        </div>
        <p className="text-sm text-muted">
          Der Partner spricht Japanisch und richtet sich nach deinem Niveau und deinen bekannten
          Wörtern ({learner.knownVocabulary.length}). Übersetzung, Lesung, Worterklärungen und
          Feedback bekommst du auf Wunsch.
        </p>
        {aiAvailable ? (
          <Button size="lg" className="self-start" onClick={start}>
            Gespräch starten
          </Button>
        ) : (
          <div className="rounded-lg border border-dashed border-line-strong p-5">
            <p className="font-medium">
              Der AI-Partner ist in dieser Installation nicht eingerichtet.
            </p>
            <p className="mt-1 text-sm text-muted">
              Dafür muss auf dem Server ein{" "}
              <code className="rounded bg-surface-2 px-1">ANTHROPIC_API_KEY</code> hinterlegt sein.
              Bis dahin kannst du die vorbereiteten Rollenspiele nutzen – dort antwortest du
              ebenfalls frei und bekommst eine Musterantwort.
            </p>
            {chosen?.firstConversationId ? (
              <ButtonLink
                href={`/conversations/${chosen.firstConversationId}/practice`}
                className="mt-4"
              >
                Rollenspiel „{chosen.titleDe}“ starten
              </ButtonLink>
            ) : (
              <ButtonLink href="/situations" className="mt-4">
                Situationen ansehen
              </ButtonLink>
            )}
          </div>
        )}
      </div>
    );
  }

  // ---------- Gespräch ----------
  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-5">
      <div className="flex flex-wrap items-center gap-2 text-sm text-muted">
        <Badge tone="accent">{chosen ? chosen.titleDe : "Freies Gespräch"}</Badge>
        <Badge>{PARTNER_LABELS[partner].de}</Badge>
        <Badge>{POLITENESS_LABELS[politeness]}</Badge>
        <Badge>{LEVEL_LABELS[effectiveLevel]}</Badge>
        <Button size="sm" variant="ghost" className="ml-auto" onClick={() => setMessages(null)}>
          Neues Gespräch
        </Button>
      </div>

      <ol className="flex flex-col gap-4" aria-live="polite" aria-label="Gesprächsverlauf">
        {messages.map((m) =>
          m.role === "partner" ? (
            <li key={m.id} className="flex flex-col items-start gap-1">
              <span lang="ja" className="text-xs text-faint">
                {PARTNER_LABELS[partner].ja}
              </span>
              <PartnerMessage turn={m.turn} />
            </li>
          ) : (
            <li key={m.id} className="flex flex-col items-end gap-2">
              <p
                lang="ja"
                className="max-w-[90%] rounded-lg bg-accent px-4 py-2.5 font-jp text-lg text-accent-fg sm:max-w-[80%]"
              >
                {m.text}
              </p>
              {m.evaluation ? (
                <EvaluationView evaluation={m.evaluation} />
              ) : (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => void evaluate(m.id)}
                  disabled={m.evaluating}
                >
                  {m.evaluating ? "Feedback wird erstellt …" : "Feedback anzeigen"}
                </Button>
              )}
              {m.evaluationError ? <p className="text-sm text-akane">{m.evaluationError}</p> : null}
            </li>
          ),
        )}
        {pending ? (
          <li className="flex items-center gap-2 text-sm text-muted" role="status">
            <span className="inline-flex gap-1" aria-hidden="true">
              <span className="size-1.5 animate-pulse rounded-full bg-faint" />
              <span className="size-1.5 animate-pulse rounded-full bg-faint [animation-delay:150ms]" />
              <span className="size-1.5 animate-pulse rounded-full bg-faint [animation-delay:300ms]" />
            </span>
            {PARTNER_LABELS[partner].de} antwortet …
          </li>
        ) : null}
      </ol>

      {error ? (
        <div
          role="alert"
          className="flex flex-wrap items-center gap-3 rounded-md border border-akane/40 bg-akane-soft/40 px-4 py-3 text-sm"
        >
          <span>{error}</span>
          <Button size="sm" variant="secondary" onClick={() => void requestTurn(messages)}>
            Erneut versuchen
          </Button>
        </div>
      ) : null}

      {ended ? (
        <div className="rounded-lg border border-line bg-surface p-4 text-sm">
          Das Gespräch ist zu Ende. Sieh dir das Feedback zu deinen Antworten an oder starte ein
          neues Gespräch.
          <div className="mt-3 flex gap-2">
            <Button size="sm" onClick={() => setMessages(null)}>
              Neues Gespräch
            </Button>
            <Link
              href="/review"
              className="self-center text-accent underline-offset-4 hover:underline"
            >
              Zu den Wiederholungen
            </Link>
          </div>
        </div>
      ) : (
        <form
          onSubmit={send}
          className="sticky bottom-20 flex flex-col gap-2 rounded-lg border border-line bg-bg/95 p-3 backdrop-blur lg:bottom-4"
        >
          {showHint && lastPartner?.turn.hintDe ? (
            <p className="text-sm text-muted">Tipp: {lastPartner.turn.hintDe}</p>
          ) : null}
          <label htmlFor="ai-input" className="sr-only">
            Deine Antwort
          </label>
          <textarea
            id="ai-input"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={onKeyDown}
            rows={2}
            lang="ja"
            maxLength={400}
            placeholder="Antworte auf Japanisch (oder in Romaji) …"
            className="resize-none rounded-md border border-line bg-surface p-3 text-lg focus-visible:ring-2 focus-visible:ring-accent/30 focus-visible:outline-none"
          />
          <div className="flex flex-wrap items-center gap-2">
            <Button type="submit" disabled={!input.trim() || pending}>
              Senden
            </Button>
            {lastPartner?.turn.hintDe ? (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                aria-pressed={showHint}
                onClick={() => setShowHint(!showHint)}
              >
                Tipp
              </Button>
            ) : null}
            <MicButton
              onTranscript={(text) =>
                setInput((current) => (current ? `${current} ${text}` : text))
              }
              className="ml-auto"
            />
          </div>
        </form>
      )}
      <div ref={bottom} />
    </div>
  );
}
