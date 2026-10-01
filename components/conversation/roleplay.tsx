"use client";

import { useCallback, useEffect, useRef, useState, type FormEvent } from "react";
import { AudioButton } from "@/components/japanese/audio-button";
import { JapaneseText } from "@/components/japanese/japanese-text";
import { Button, ButtonLink } from "@/components/ui/button";
import { CheckIcon } from "@/components/ui/icons";
import { getUserDataStore } from "@/hooks/use-user-data";
import { evaluateRoleplayAnswer, type RoleplayVerdict } from "@/lib/conversation/roleplay";
import { completeConversation, speakerPitch } from "@/lib/learning/conversation";
import { cn } from "@/lib/utils";
import { useAudio } from "@/providers/audio-provider";
import type { Conversation } from "@/types/content";

type SelfRating = "good" | "partly" | "again";

type Turn = { lineIndex: number; answer: string; verdict: RoleplayVerdict; rating?: SelfRating };

const RATING_LABELS: Record<SelfRating, string> = {
  good: "Passt",
  partly: "Teilweise",
  again: "Nochmal üben",
};

/**
 * Geskriptetes Rollenspiel: Der Partner spricht, der Nutzer antwortet für seine Rolle
 * und vergleicht danach mit der Musterantwort. Bewertung nicht binär.
 */
export function Roleplay({ conversation }: { conversation: Conversation }) {
  const learner = conversation.speakers.find((s) => s.isLearner)!;
  const speakers = new Map(conversation.speakers.map((s) => [s.key, s]));
  const [position, setPosition] = useState(0);
  const [input, setInput] = useState("");
  const [turns, setTurns] = useState<Turn[]>([]);
  const [revealed, setRevealed] = useState(false);
  const [started, setStarted] = useState(false);
  const { play } = useAudio();
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  const line = conversation.lines[position];
  const done = position >= conversation.lines.length;

  /** Eine Zeile weiter; nach der letzten Zeile wird der Abschluss gespeichert. */
  const advanceFrom = useCallback(
    (from: number) => {
      setPosition(from + 1);
      if (from + 1 === conversation.lines.length) {
        void completeConversation(getUserDataStore(), conversation.id, "conversation-roleplay");
      }
    },
    [conversation, setPosition],
  );
  const isLearnerTurn = line?.speaker === learner.key;

  // Partnerzeilen werden vorgespielt; danach geht es automatisch weiter bis zum nächsten Einsatz.
  useEffect(() => {
    if (!started || !line || isLearnerTurn || done) return;
    let cancelled = false;
    const source = {
      text: line.reading,
      url: line.audioUrl,
      pitch: speakerPitch(conversation, line.speaker),
    };
    const minDelay = new Promise((resolve) => setTimeout(resolve, 900));
    const audio = play(source).catch(() => undefined);
    Promise.all([audio, minDelay]).then(() => {
      if (!cancelled) advanceFrom(position);
    });
    return () => {
      cancelled = true;
    };
  }, [started, line, position, isLearnerTurn, done, play, conversation, advanceFrom]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
    if (isLearnerTurn && !revealed) inputRef.current?.focus();
  }, [position, revealed, isLearnerTurn]);

  const submit = (event?: FormEvent) => {
    event?.preventDefault();
    const verdict = evaluateRoleplayAnswer(input, line);
    setTurns((t) => [
      ...t,
      {
        lineIndex: position,
        answer: input.trim(),
        verdict,
        rating: verdict === "match" ? "good" : undefined,
      },
    ]);
    setRevealed(true);
  };

  const rate = (rating: SelfRating) => {
    setTurns((t) => t.map((turn, i) => (i === t.length - 1 ? { ...turn, rating } : turn)));
  };

  const next = () => {
    setRevealed(false);
    setInput("");
    advanceFrom(position);
  };

  const current = turns[turns.length - 1];
  if (!started) {
    return (
      <div className="flex flex-col items-start gap-4 rounded-lg border border-line bg-surface p-6">
        <p className="text-sm text-muted">
          Du sprichst als <strong className="font-medium text-fg">{learner.nameDe}</strong>. Die
          anderen Rollen werden vorgelesen; bei deinen Einsätzen antwortest du auf Japanisch oder in
          Romaji.
        </p>
        <Button size="lg" onClick={() => setStarted(true)}>
          Rollenspiel starten
        </Button>
      </div>
    );
  }

  const shown = conversation.lines.slice(
    0,
    Math.min(position + (isLearnerTurn && !revealed ? 0 : 1), conversation.lines.length),
  );

  return (
    <div className="flex flex-col gap-6">
      <p className="text-sm text-muted">
        Du sprichst als <strong className="font-medium text-fg">{learner.nameDe}</strong>. Antworte
        auf Japanisch oder in Romaji – danach siehst du eine natürliche Musterantwort.
      </p>

      <ol className="flex flex-col gap-3" aria-live="polite">
        {shown.map((l, index) => {
          const speaker = speakers.get(l.speaker)!;
          const turn = turns.find((t) => t.lineIndex === index);
          return (
            <li key={l.id} className={cn("flex flex-col gap-2", speaker.isLearner && "items-end")}>
              <span className="text-xs text-faint">
                <span lang="ja">{speaker.nameJa}</span> · {speaker.nameDe}
              </span>
              {turn?.answer ? (
                <p className="max-w-[85%] rounded-lg bg-accent px-4 py-2.5 text-accent-fg">
                  {turn.answer}
                </p>
              ) : null}
              <div
                className={cn(
                  "max-w-[85%] rounded-lg border p-4",
                  speaker.isLearner
                    ? "border-dashed border-accent/40 bg-accent-soft/30"
                    : "border-line bg-surface",
                )}
              >
                {speaker.isLearner ? (
                  <p className="mb-2 text-xs text-muted">Musterantwort</p>
                ) : null}
                <JapaneseText
                  japanese={l.japanese}
                  furigana={l.furigana}
                  reading={l.reading}
                  romaji={l.romaji}
                  german={l.german}
                  audioPitch={speakerPitch(conversation, l.speaker)}
                />
              </div>
            </li>
          );
        })}
      </ol>

      {!done && isLearnerTurn && !revealed ? (
        <form
          onSubmit={submit}
          className="flex flex-col gap-3 rounded-lg border border-accent/40 bg-surface p-4"
        >
          <label htmlFor="roleplay-answer" className="text-sm">
            Sag auf Japanisch: <span className="font-medium">„{line.german}“</span>
          </label>
          <textarea
            id="roleplay-answer"
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
                e.preventDefault();
                submit();
              }
            }}
            rows={2}
            lang="ja"
            autoComplete="off"
            placeholder="Japanisch oder Romaji …"
            className="rounded-md border border-line bg-bg p-3 text-lg focus-visible:ring-2 focus-visible:ring-accent/30 focus-visible:outline-none"
          />
          <div className="flex flex-wrap gap-2">
            <Button type="submit">{input.trim() ? "Antworten" : "Musterantwort zeigen"}</Button>
            <AudioButton text={line.reading} pitch={1} label="Musterantwort anhören" />
          </div>
        </form>
      ) : null}

      {!done && isLearnerTurn && revealed && current ? (
        <div className="flex flex-col gap-3 rounded-lg border border-line bg-surface p-4">
          {current.verdict === "match" ? (
            <p className="inline-flex items-center gap-1.5 text-matcha">
              <CheckIcon size={18} /> Genau so würde man es sagen.
            </p>
          ) : current.verdict === "close" ? (
            <p className="text-kohaku">Fast – vergleiche Vokallängen und kleine Zeichen.</p>
          ) : (
            <p className="text-muted">
              {current.answer
                ? "Deine Formulierung weicht ab – das kann trotzdem passen. Wie schätzt du dich ein?"
                : "Wie gut hättest du es gewusst?"}
            </p>
          )}
          {current.verdict !== "match" ? (
            <div className="flex flex-wrap gap-2" role="group" aria-label="Selbsteinschätzung">
              {(Object.keys(RATING_LABELS) as SelfRating[]).map((rating) => (
                <Button
                  key={rating}
                  size="sm"
                  variant={current.rating === rating ? "primary" : "secondary"}
                  aria-pressed={current.rating === rating}
                  onClick={() => rate(rating)}
                >
                  {RATING_LABELS[rating]}
                </Button>
              ))}
            </div>
          ) : null}
          <Button className="self-start" onClick={next} disabled={!current.rating}>
            Weiter
          </Button>
        </div>
      ) : null}

      {done ? (
        <div className="flex flex-col items-start gap-4 rounded-lg border border-line bg-surface p-6">
          <p className="text-xl font-semibold">Rollenspiel abgeschlossen</p>
          <p className="text-muted">
            {turns.filter((t) => t.rating === "good").length} von {turns.length} Antworten passten.{" "}
            {turns.some((t) => t.rating === "again")
              ? "Die markierten Stellen lohnen eine zweite Runde."
              : ""}
          </p>
          <div className="flex flex-wrap gap-2">
            <Button
              onClick={() => {
                setPosition(0);
                setTurns([]);
                setRevealed(false);
                setStarted(true);
              }}
            >
              Noch einmal
            </Button>
            <ButtonLink href={`/conversations/${conversation.id}`} variant="secondary">
              Zum Gespräch
            </ButtonLink>
          </div>
        </div>
      ) : null}
      <div ref={bottomRef} />
    </div>
  );
}
