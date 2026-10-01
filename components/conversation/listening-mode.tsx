"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { JapaneseText } from "@/components/japanese/japanese-text";
import { Button, ButtonLink } from "@/components/ui/button";
import { PlayIcon, ReviewIcon, StopIcon } from "@/components/ui/icons";
import { useSettings } from "@/hooks/use-settings";
import { getUserDataStore } from "@/hooks/use-user-data";
import { completeConversation, speakerPitch } from "@/lib/learning/conversation";
import { cn } from "@/lib/utils";
import { useAudio } from "@/providers/audio-provider";
import type { Conversation } from "@/types/content";
import type { LineGrammar } from "./conversation-line";
import { usePlayAll } from "./use-play-all";
import { VocabularyDrawer, type DrawerWord } from "./vocabulary-drawer";

const STEPS = [
  { title: "Hören", hint: "Nur Audio. Hör dir das Gespräch so oft an, wie du möchtest." },
  {
    title: "Verstehen",
    hint: "Was hast du verstanden? Notiere Stichworte – auf Deutsch oder Japanisch.",
  },
  { title: "Transkript", hint: "Lies mit, während du noch einmal hörst." },
  { title: "Furigana", hint: "Mit Lesehilfen über den Kanji." },
  { title: "Übersetzung", hint: "Vergleiche mit deinem Verständnis." },
  { title: "Aufschlüsselung", hint: "Wörter und Grammatik Zeile für Zeile." },
] as const;

const SLOW_SPEED = 0.7;

/**
 * Listening in Stufen: Erst hören, dann schrittweise Hilfen einblenden.
 * Keine Hilfe ist sichtbar, bevor der Nutzer sie anfordert.
 */
export function ListeningMode({
  conversation,
  words,
  grammar,
}: {
  conversation: Conversation;
  words: Record<string, DrawerWord>;
  grammar: Record<string, LineGrammar>;
}) {
  const [step, setStep] = useState(0);
  const [notes, setNotes] = useState("");
  const [slow, setSlow] = useState(false);
  const [romaji, setRomaji] = useState(false);
  const [plays, setPlays] = useState(0);
  const [finished, setFinished] = useState(false);
  const [openWord, setOpenWord] = useState<DrawerWord | null>(null);
  const [settings] = useSettings();
  const { setSpeed } = useAudio();

  const sources = useMemo(
    () =>
      conversation.lines.map((line) => ({
        text: line.reading,
        url: line.audioUrl,
        pitch: speakerPitch(conversation, line.speaker),
      })),
    [conversation],
  );
  const { current, playing, playAll, stop } = usePlayAll(sources);

  // Langsame Wiedergabe nur in diesem Modus; beim Verlassen zurück zur Einstellung
  useEffect(() => {
    setSpeed(slow ? SLOW_SPEED : settings.audioSpeed);
    return () => setSpeed(settings.audioSpeed);
  }, [slow, settings.audioSpeed, setSpeed]);

  const listen = async () => {
    setPlays((n) => n + 1);
    const completed = await playAll();
    if (completed && settings.listeningAutoReplay && step === 0) {
      await new Promise((resolve) => setTimeout(resolve, 2000));
      setPlays((n) => n + 1);
      await playAll();
    }
  };

  const goTo = (next: number) => {
    stop();
    setStep(next);
  };

  const finish = async () => {
    stop();
    await completeConversation(getUserDataStore(), conversation.id, "conversation-listening");
    setFinished(true);
  };

  const speakers = new Map(conversation.speakers.map((s) => [s.key, s]));
  const showTranscript = step >= 2;

  if (finished) {
    return (
      <div className="flex flex-col items-start gap-5 rounded-lg border border-line bg-surface p-6">
        <p className="text-xl font-semibold">Hörübung abgeschlossen</p>
        <p className="text-muted">
          Das Gespräch ist als durchgearbeitet gespeichert und kommt zur passenden Zeit zur
          Wiederholung.
        </p>
        <div className="flex flex-wrap gap-2">
          <ButtonLink href={`/conversations/${conversation.id}/practice`}>
            Als Rollenspiel üben
          </ButtonLink>
          <Button
            variant="secondary"
            onClick={() => {
              setFinished(false);
              setStep(0);
              setNotes("");
            }}
          >
            Noch einmal hören
          </Button>
          <ButtonLink href="/conversations" variant="ghost">
            Weitere Gespräche
          </ButtonLink>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8">
      <ol className="grid grid-cols-6 gap-1.5" aria-label="Schritte">
        {STEPS.map((s, index) => (
          <li key={s.title}>
            <button
              type="button"
              onClick={() => index <= step && goTo(index)}
              disabled={index > step}
              aria-current={index === step ? "step" : undefined}
              className="flex w-full flex-col gap-1.5 text-left disabled:cursor-not-allowed"
            >
              <span
                className={cn("h-1 rounded-full", index <= step ? "bg-accent" : "bg-surface-2")}
              />
              <span
                className={cn(
                  "hidden text-xs sm:block",
                  index === step ? "font-medium text-fg" : "text-faint",
                )}
              >
                {index + 1}. {s.title}
              </span>
            </button>
          </li>
        ))}
      </ol>

      <div>
        <h2 className="text-lg font-semibold">
          <span className="sm:hidden">{step + 1}/6 · </span>
          {STEPS[step].title}
        </h2>
        <p className="mt-1 text-sm text-muted">{STEPS[step].hint}</p>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {playing ? (
          <Button size="lg" onClick={stop}>
            <StopIcon size={18} /> Stopp
          </Button>
        ) : (
          <Button size="lg" onClick={() => void listen()}>
            {plays === 0 ? <PlayIcon size={18} /> : <ReviewIcon size={18} />}
            {plays === 0 ? "Gespräch anhören" : "Noch einmal hören"}
          </Button>
        )}
        <Button
          variant={slow ? "primary" : "secondary"}
          aria-pressed={slow}
          onClick={() => setSlow(!slow)}
        >
          Langsam
        </Button>
        {step >= 3 ? (
          <Button
            variant={romaji ? "primary" : "ghost"}
            aria-pressed={romaji}
            onClick={() => setRomaji(!romaji)}
          >
            Romaji
          </Button>
        ) : null}
        {plays > 0 ? <span className="text-xs text-faint">{plays}× gehört</span> : null}
      </div>

      {step === 0 ? (
        <div
          className="flex flex-col items-center gap-4 rounded-lg border border-dashed border-line px-6 py-14 text-center"
          aria-live="polite"
        >
          <p className="font-jp text-5xl text-faint" aria-hidden="true">
            聞
          </p>
          <p className="text-sm text-muted">
            {conversation.lines.length} Zeilen · {conversation.speakers.length} Sprecher
            {playing && current !== null ? ` · Zeile ${current + 1}` : ""}
          </p>
        </div>
      ) : null}

      {step === 1 ? (
        <label className="flex flex-col gap-2">
          <span className="text-sm font-medium">Deine Notizen (optional)</span>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={5}
            placeholder="z. B. Es geht um eine Bestellung … Kaffee … zum Mitnehmen"
            className="rounded-lg border border-line bg-surface p-3 text-base focus-visible:ring-2 focus-visible:ring-accent/30 focus-visible:outline-none"
          />
        </label>
      ) : null}

      {showTranscript ? (
        <>
          {notes && step >= 4 ? (
            <div className="rounded-md border-l-2 border-accent/50 bg-accent-soft/40 px-4 py-3 text-sm">
              <p className="text-xs text-muted">Deine Notizen</p>
              <p className="mt-1 whitespace-pre-wrap">{notes}</p>
            </div>
          ) : null}
          <ol className="flex flex-col gap-3">
            {conversation.lines.map((line, index) => {
              const speaker = speakers.get(line.speaker)!;
              const lineWords = line.vocabularyIds.map((id) => words[id]).filter(Boolean);
              const lineGrammar = line.grammarIds.map((id) => grammar[id]).filter(Boolean);
              return (
                <li
                  key={line.id}
                  className={cn(
                    "grid gap-x-4 gap-y-2 rounded-lg border p-4 sm:grid-cols-[6rem_1fr]",
                    current === index ? "border-accent" : "border-line",
                    speaker.isLearner ? "bg-surface-2/50" : "bg-surface",
                  )}
                >
                  <span lang="ja" className="font-jp text-sm text-muted">
                    {speaker.nameJa}
                  </span>
                  <div className="flex min-w-0 flex-col gap-3">
                    <JapaneseText
                      japanese={line.japanese}
                      furigana={line.furigana}
                      reading={line.reading}
                      romaji={line.romaji}
                      german={step >= 4 ? line.german : undefined}
                      audioPitch={speakerPitch(conversation, line.speaker)}
                      furiganaMode={step >= 3 ? "always" : "off"}
                      romajiVisible={romaji}
                      translationMode="always"
                    />
                    {step === 5 && lineWords.length + lineGrammar.length > 0 ? (
                      <ul className="flex flex-wrap gap-1.5 border-t border-line pt-3">
                        {lineWords.map((word) => (
                          <li key={word.id}>
                            <button
                              type="button"
                              onClick={() => setOpenWord(word)}
                              className="inline-flex h-8 items-center gap-1.5 rounded-full border border-line px-3 text-xs text-muted hover:text-fg"
                            >
                              <span lang="ja" className="font-jp text-sm text-fg">
                                {word.japanese}
                              </span>
                              {word.german[0]}
                            </button>
                          </li>
                        ))}
                        {lineGrammar.map((g) => (
                          <li key={g.id}>
                            <Link
                              href={`/grammar/${g.slug}`}
                              className="inline-flex h-8 items-center gap-1.5 rounded-full border border-accent/30 bg-accent-soft/50 px-3 text-xs text-accent"
                            >
                              <span lang="ja" className="font-jp text-sm">
                                {g.pattern.split(" / ")[0]}
                              </span>
                              {g.meaningDe}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    ) : null}
                    {step === 5 && line.noteDe ? (
                      <p className="text-sm text-muted">{line.noteDe}</p>
                    ) : null}
                  </div>
                </li>
              );
            })}
          </ol>
        </>
      ) : null}

      <div className="flex items-center justify-between gap-4 border-t border-line pt-6">
        {step > 0 ? (
          <Button variant="ghost" onClick={() => goTo(step - 1)}>
            Zurück
          </Button>
        ) : (
          <span />
        )}
        {step < STEPS.length - 1 ? (
          <Button onClick={() => goTo(step + 1)}>
            {step === 0 ? "Weiter zum Verstehen" : `Weiter: ${STEPS[step + 1].title}`}
          </Button>
        ) : (
          <Button onClick={() => void finish()}>Hörübung abschließen</Button>
        )}
      </div>

      <VocabularyDrawer word={openWord} onClose={() => setOpenWord(null)} />
    </div>
  );
}
