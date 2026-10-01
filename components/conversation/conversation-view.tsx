"use client";

import { useEffect, useMemo, useState } from "react";
import { FavoriteButton } from "@/components/learning/favorite-button";
import { Button, ButtonLink } from "@/components/ui/button";
import { PlayIcon, StopIcon } from "@/components/ui/icons";
import { getUserDataStore, useProgress } from "@/hooks/use-user-data";
import {
  completeConversation,
  isConversationCompleted,
  speakerPitch,
} from "@/lib/learning/conversation";
import { recordRecent } from "@/lib/recent";
import type { Conversation } from "@/types/content";
import { ConversationLineView, type LineGrammar } from "./conversation-line";
import { usePlayAll } from "./use-play-all";
import { VocabularyDrawer, type DrawerWord } from "./vocabulary-drawer";

/** Zentrale Lernansicht eines Gesprächs. Wort- und Grammatikdaten kommen vom Server. */
export function ConversationView({
  conversation,
  words,
  grammar,
}: {
  conversation: Conversation;
  words: Record<string, DrawerWord>;
  grammar: Record<string, LineGrammar>;
}) {
  const [openWord, setOpenWord] = useState<DrawerWord | null>(null);
  useEffect(() => recordRecent("conversation", conversation.id), [conversation.id]);
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
  const { data: progress } = useProgress("conversation", conversation.id);
  const completed = isConversationCompleted(progress);
  const speakers = new Map(conversation.speakers.map((s) => [s.key, s]));

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center gap-2">
        {playing ? (
          <Button onClick={stop}>
            <StopIcon size={16} /> Stopp
          </Button>
        ) : (
          <Button onClick={() => void playAll()}>
            <PlayIcon size={16} /> Alles abspielen
          </Button>
        )}
        <ButtonLink href={`/conversations/${conversation.id}/listen`} variant="secondary">
          Listening-Modus
        </ButtonLink>
        <ButtonLink href={`/conversations/${conversation.id}/practice`} variant="secondary">
          Rollenspiel
        </ButtonLink>
        <FavoriteButton
          contentType="conversation"
          contentId={conversation.id}
          label="Gespräch"
          className="ml-auto size-10"
        />
      </div>

      <ol className="flex flex-col gap-3" aria-label="Gesprächsverlauf">
        {conversation.lines.map((line, index) => (
          <ConversationLineView
            key={line.id}
            line={line}
            speaker={speakers.get(line.speaker)!}
            pitch={speakerPitch(conversation, line.speaker)}
            active={current === index}
            words={line.vocabularyIds.map((id) => words[id]).filter(Boolean)}
            grammar={line.grammarIds.map((id) => grammar[id]).filter(Boolean)}
            onWord={setOpenWord}
          />
        ))}
      </ol>

      <div className="flex flex-wrap items-center gap-3 border-t border-line pt-6">
        {completed ? (
          <p className="text-sm text-matcha">✓ Durchgearbeitet</p>
        ) : (
          <Button
            variant="secondary"
            onClick={() =>
              void completeConversation(getUserDataStore(), conversation.id, "conversation-reading")
            }
          >
            Als durchgearbeitet markieren
          </Button>
        )}
        <span className="text-sm text-muted">Als Nächstes: erst nur hören im Listening-Modus.</span>
      </div>

      <VocabularyDrawer word={openWord} onClose={() => setOpenWord(null)} />
    </div>
  );
}
