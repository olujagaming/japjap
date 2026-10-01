"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { SectionHeader } from "@/components/layout/page-header";
import { ButtonLink } from "@/components/ui/button";
import { ErrorState, LoadingState } from "@/components/ui/states";
import { useProgressList, useReviewLog } from "@/hooks/use-user-data";
import { contentLabel, CONTENT_TYPE_LABELS } from "@/lib/content/labels";
import { isDifficult } from "@/lib/learning/progress";
import { dueCountsByType, forecast, REVIEWABLE_TYPES } from "@/lib/review/queue";
import { TASK_LABELS } from "@/lib/review/tasks";
import { REVIEW_RATING_LABELS, type ReviewRating } from "@/lib/srs/types";
import type { ReviewLogEntry } from "@/lib/store/types";
import { cn } from "@/lib/utils";

const TYPE_PLURALS: Record<(typeof REVIEWABLE_TYPES)[number], string> = {
  kana: "Kana",
  vocabulary: "Vokabeln",
  kanji: "Kanji",
  grammar: "Grammatik",
  conversation: "Gespräche",
};

const EXTRA_TASK_LABELS: Record<string, string> = {
  "kana-recognition": "Kana erkennen",
  "kana-reverse": "Kana abrufen",
  "kana-listening": "Kana hören",
  "kana-reading": "Kana lesen",
  "kana-confusion": "Verwechslungen",
  "conversation-reading": "Gespräch gelesen",
  "conversation-listening": "Hörübung",
  "conversation-roleplay": "Rollenspiel",
};

const RATING_TONE: Record<ReviewRating, string> = {
  again: "text-akane",
  hard: "text-kohaku",
  good: "text-matcha",
  easy: "text-accent",
};

const DAY_NAMES = ["Heute", "Morgen"];

function taskLabel(type: string) {
  return (TASK_LABELS as Record<string, string>)[type] ?? EXTRA_TASK_LABELS[type] ?? type;
}

function Item({ entry }: { entry: Pick<ReviewLogEntry, "contentType" | "contentId"> }) {
  const label = contentLabel(entry.contentType, entry.contentId);
  if (!label) return null;
  return (
    <Link href={label.href} className="inline-flex min-w-0 items-baseline gap-2 hover:underline">
      <span lang="ja" className="truncate font-jp text-lg">
        {label.japanese}
      </span>
      <span className="truncate text-sm text-muted">{label.german}</span>
    </Link>
  );
}

export function ReviewDashboard() {
  const { data: records, loading, error } = useProgressList();
  const { data: log } = useReviewLog(30);
  const [now] = useState(() => new Date());

  const counts = useMemo(() => dueCountsByType(records, now), [records, now]);
  const total = Object.values(counts).reduce((a, b) => a + b, 0);
  const days = useMemo(() => forecast(records, now, 7), [records, now]);
  const difficult = records.filter(
    (r) => (REVIEWABLE_TYPES as readonly string[]).includes(r.contentType) && isDifficult(r),
  );
  const recentMistakes = [
    ...new Map(
      log.filter((e) => e.rating === "again").map((e) => [`${e.contentType}:${e.contentId}`, e]),
    ).values(),
  ].slice(0, 10);

  if (error) return <ErrorState />;
  if (loading) return <LoadingState />;

  const maxDay = Math.max(1, ...days);

  return (
    <div className="flex flex-col gap-12">
      <section className="grid gap-6 lg:grid-cols-[1fr_1.2fr]">
        <div className="flex flex-col justify-between gap-6 rounded-lg border border-line bg-surface p-6">
          <div>
            <p className="text-sm text-muted">Heute</p>
            <p className="mt-1 text-5xl font-semibold tracking-tight tabular-nums">{total}</p>
            <p className="mt-1 text-muted">
              {total === 1 ? "Wiederholung fällig" : "Wiederholungen fällig"}
            </p>
          </div>
          {total > 0 ? (
            <ButtonLink href="/review/session" size="lg" className="self-start">
              Review starten
            </ButtonLink>
          ) : (
            <p className="text-sm text-muted">
              Alles erledigt. Neue Inhalte kommen dazu, wenn du übst oder „Zur Wiederholung
              hinzufügen“ wählst.
            </p>
          )}
        </div>
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {REVIEWABLE_TYPES.map((type) => (
            <li key={type}>
              <Link
                href={
                  counts[type] > 0
                    ? `/review/session?types=${type}`
                    : type === "conversation"
                      ? "/conversations"
                      : `/${type === "kana" ? "kana" : type}`
                }
                className="flex h-full flex-col rounded-lg border border-line bg-surface p-4 transition-colors hover:border-line-strong"
              >
                <span className="text-sm text-muted">{TYPE_PLURALS[type]}</span>
                <span className="mt-1 text-2xl font-semibold tabular-nums">{counts[type]}</span>
                <span className="mt-auto pt-2 text-xs text-faint">
                  {counts[type] > 0 ? "Nur diese wiederholen →" : "nichts fällig"}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section>
        <SectionHeader
          title="Die nächsten Tage"
          ja="予定"
          description="So viele Wiederholungen stehen an – „Heute“ zählt auch, was im Lauf des Tages fällig wird."
        />
        <ol
          className="flex max-w-2xl items-end gap-2"
          aria-label="Vorschau der nächsten sieben Tage"
        >
          {days.map((count, i) => {
            const date = new Date(now);
            date.setDate(date.getDate() + i);
            const name = DAY_NAMES[i] ?? date.toLocaleDateString("de-DE", { weekday: "short" });
            return (
              <li key={i} className="flex flex-1 flex-col items-center gap-1.5">
                <span className="text-xs text-muted tabular-nums">{count}</span>
                <span
                  aria-hidden="true"
                  className={cn("w-full rounded-t-sm", i === 0 ? "bg-accent" : "bg-accent/40")}
                  style={{ height: `${Math.max(4, (count / maxDay) * 96)}px` }}
                />
                <span className="text-xs text-faint">{name}</span>
                <span className="sr-only">
                  {name}: {count} Wiederholungen
                </span>
              </li>
            );
          })}
        </ol>
      </section>

      <div className="grid gap-12 lg:grid-cols-2">
        <section>
          <SectionHeader title="Schwierige Inhalte" ja="苦手" />
          {difficult.length > 0 ? (
            <ul className="flex flex-col divide-y divide-line rounded-lg border border-line bg-surface">
              {difficult.slice(0, 12).map((r) => (
                <li
                  key={`${r.contentType}:${r.contentId}`}
                  className="flex items-center justify-between gap-3 px-4 py-2.5"
                >
                  <Item entry={r} />
                  <span className="shrink-0 text-xs text-faint">
                    {CONTENT_TYPE_LABELS[r.contentType]} · {r.incorrectCount}× falsch
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-muted">Bisher nichts, was dir besonders schwerfällt.</p>
          )}
        </section>
        <section>
          <SectionHeader title="Zuletzt falsch beantwortet" ja="間違い" />
          {recentMistakes.length > 0 ? (
            <ul className="flex flex-col divide-y divide-line rounded-lg border border-line bg-surface">
              {recentMistakes.map((e) => (
                <li
                  key={`${e.contentType}:${e.contentId}`}
                  className="flex items-center justify-between gap-3 px-4 py-2.5"
                >
                  <Item entry={e} />
                  {e.answer ? (
                    <span className="shrink-0 truncate text-xs text-faint">
                      deine Antwort: {e.answer}
                    </span>
                  ) : null}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-muted">
              In den letzten 30 Tagen keine Fehler – oder noch keine Wiederholungen.
            </p>
          )}
        </section>
      </div>

      <section>
        <SectionHeader
          title="Verlauf"
          ja="履歴"
          description="Die letzten Übungen und Wiederholungen."
        />
        {log.length > 0 ? (
          <div className="overflow-x-auto rounded-lg border border-line bg-surface">
            <table className="w-full text-sm">
              <caption className="sr-only">Verlauf der letzten Wiederholungen</caption>
              <thead>
                <tr className="border-b border-line text-left text-xs text-muted">
                  <th scope="col" className="px-4 py-2 font-normal">
                    Zeit
                  </th>
                  <th scope="col" className="px-4 py-2 font-normal">
                    Inhalt
                  </th>
                  <th scope="col" className="hidden px-4 py-2 font-normal sm:table-cell">
                    Aufgabe
                  </th>
                  <th scope="col" className="px-4 py-2 font-normal">
                    Bewertung
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {log.slice(0, 25).map((e, i) => (
                  <tr key={`${e.reviewedAt}-${i}`}>
                    <td className="px-4 py-2 whitespace-nowrap text-muted tabular-nums">
                      {new Date(e.reviewedAt).toLocaleString("de-DE", {
                        day: "2-digit",
                        month: "2-digit",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </td>
                    <td className="max-w-56 px-4 py-2">
                      <Item entry={e} />
                    </td>
                    <td className="hidden px-4 py-2 text-muted sm:table-cell">
                      {taskLabel(e.taskType)}
                    </td>
                    <td className={cn("px-4 py-2 whitespace-nowrap", RATING_TONE[e.rating])}>
                      {REVIEW_RATING_LABELS[e.rating]}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-sm text-muted">Noch keine Einträge.</p>
        )}
      </section>
    </div>
  );
}
