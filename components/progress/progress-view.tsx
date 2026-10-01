"use client";

import Link from "next/link";
import { SectionHeader } from "@/components/layout/page-header";
import { ProgressCard } from "@/components/learning/learning-card";
import { ErrorState } from "@/components/ui/states";
import { BASIC_COUNT, KANA } from "@/data/kana";
import { useActivity, useProgressList, type ActivityDay } from "@/hooks/use-user-data";
import { isConversationCompleted } from "@/lib/learning/conversation";
import { isDifficult, isKnownStatus } from "@/lib/learning/progress";
import { LEARNING_STATUS_META } from "@/lib/learning-status";
import type { ProgressRecord } from "@/lib/store/types";
import { cn } from "@/lib/utils";
import { LEARNING_STATUSES, type LearningStatus, type ScriptType } from "@/types/content";

const kanaById = new Map(KANA.map((k) => [k.id, k]));

const BAR_COLORS: Record<LearningStatus, string> = {
  unseen: "bg-surface-2",
  familiar: "bg-line-strong",
  learning: "bg-kohaku/70",
  known: "bg-accent/70",
  mastered: "bg-matcha/80",
};

function ScriptProgress({ script, records }: { script: ScriptType; records: ProgressRecord[] }) {
  const basic = KANA.filter((k) => k.scriptType === script && k.group === "basic");
  const byId = new Map(records.map((r) => [r.contentId, r]));
  const counts = Object.fromEntries(LEARNING_STATUSES.map((s) => [s, 0])) as Record<
    LearningStatus,
    number
  >;
  for (const k of basic) counts[byId.get(k.id)?.status ?? "unseen"]++;
  const known = counts.known + counts.mastered;
  const name = script === "hiragana" ? "Hiragana" : "Katakana";

  return (
    <div className="rounded-lg border border-line bg-surface p-5">
      <div className="flex items-baseline justify-between">
        <p className="font-medium">{name}</p>
        <p className="text-2xl font-semibold tabular-nums">
          {known}
          <span className="text-base font-normal text-faint"> / {BASIC_COUNT}</span>
        </p>
      </div>
      <div className="mt-4 flex h-2 overflow-hidden rounded-full" aria-hidden="true">
        {(["mastered", "known", "learning", "familiar", "unseen"] as const).map((status) =>
          counts[status] > 0 ? (
            <div
              key={status}
              className={BAR_COLORS[status]}
              style={{ width: `${(counts[status] / BASIC_COUNT) * 100}%` }}
            />
          ) : null,
        )}
      </div>
      <dl className="mt-4 flex flex-wrap gap-x-5 gap-y-1 text-sm">
        {(["mastered", "known", "learning", "familiar", "unseen"] as const).map((status) => (
          <div key={status} className="flex items-center gap-1.5">
            <span aria-hidden="true" className={cn("size-2 rounded-full", BAR_COLORS[status])} />
            <dt className="whitespace-nowrap text-muted">{LEARNING_STATUS_META[status].label}</dt>
            <dd className="tabular-nums">{counts[status]}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

function ActivityCalendar({ days }: { days: ActivityDay[] }) {
  const max = Math.max(1, ...days.map((d) => d.count));
  const total = days.reduce((sum, d) => sum + d.count, 0);
  const correct = days.reduce((sum, d) => sum + d.correct, 0);
  const activeDays = days.filter((d) => d.count > 0).length;
  const level = (count: number) =>
    count === 0
      ? "bg-surface-2"
      : count / max > 0.66
        ? "bg-accent"
        : count / max > 0.33
          ? "bg-accent/60"
          : "bg-accent/30";
  const label = (d: ActivityDay) =>
    `${new Date(d.date + "T12:00:00").toLocaleDateString("de-DE", { day: "numeric", month: "long" })}: ${d.count} ${d.count === 1 ? "Übung" : "Übungen"}`;

  return (
    <div className="rounded-lg border border-line bg-surface p-5">
      <ol
        className="grid max-w-2xl grid-cols-10 gap-1.5 sm:grid-cols-15"
        aria-label="Aktivität der letzten 30 Tage"
      >
        {days.map((d) => (
          <li
            key={d.date}
            title={label(d)}
            className={cn("aspect-square rounded-sm", level(d.count))}
          >
            <span className="sr-only">{label(d)}</span>
          </li>
        ))}
      </ol>
      <p className="mt-4 text-sm text-muted">
        {total > 0
          ? `${total} Übungen an ${activeDays} ${activeDays === 1 ? "Tag" : "Tagen"}, ${Math.round((correct / total) * 100)} % richtig.`
          : "In den letzten 30 Tagen noch keine Übungen."}
      </p>
    </div>
  );
}

export function ProgressView() {
  const { data: records, error } = useProgressList();
  const { data: activity } = useActivity(30);

  if (error) return <ErrorState />;

  const ofType = (type: ProgressRecord["contentType"]) =>
    records.filter((r) => r.contentType === type);
  const count = (type: ProgressRecord["contentType"], known: boolean) =>
    ofType(type).filter((r) => (known ? isKnownStatus(r.status) : r.status === "learning")).length;
  const difficultKana = ofType("kana")
    .filter(isDifficult)
    .map((r) => ({ record: r, kana: kanaById.get(r.contentId) }))
    .filter((x) => x.kana !== undefined)
    .sort((a, b) => b.record.incorrectCount - a.record.incorrectCount);

  return (
    <div className="flex flex-col gap-12">
      <section>
        <SectionHeader title="Schriftsysteme" ja="文字" />
        <div className="grid gap-3 lg:grid-cols-2">
          <ScriptProgress script="hiragana" records={ofType("kana")} />
          <ScriptProgress script="katakana" records={ofType("kana")} />
        </div>
      </section>

      <section>
        <SectionHeader
          title="Wissen"
          ja="知識"
          description="Was du sicher kannst – und wie viele Gespräche du schon durchgearbeitet hast."
        />
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <ProgressCard
            label="Vokabeln"
            ja="語彙"
            value={count("vocabulary", true)}
            hint={`${count("vocabulary", false)} am Lernen`}
          />
          <ProgressCard label="Kanji" ja="漢字" value={count("kanji", true)} hint="bekannt" />
          <ProgressCard label="Grammatik" ja="文法" value={count("grammar", true)} hint="bekannt" />
          <ProgressCard
            label="Gespräche"
            ja="会話"
            value={ofType("conversation").filter(isConversationCompleted).length}
            hint="abgeschlossen"
          />
        </div>
      </section>

      <section>
        <SectionHeader
          title="Aktivität"
          ja="活動"
          description="Ein ruhiger Blick auf die letzten 30 Tage – Pausen sind Teil des Lernens."
        />
        <ActivityCalendar days={activity} />
      </section>

      <section>
        <SectionHeader title="Schwierige Inhalte" ja="苦手" />
        {difficultKana.length > 0 ? (
          <ul className="flex flex-wrap gap-2">
            {difficultKana.map(({ record, kana }) => (
              <li key={record.contentId}>
                <Link
                  href={`/kana/${encodeURIComponent(kana!.character)}`}
                  className="flex min-w-16 flex-col items-center rounded-md border border-akane/30 bg-akane-soft/40 px-3 py-2"
                >
                  <span lang="ja" className="font-jp text-2xl">
                    {kana!.character}
                  </span>
                  <span className="text-xs text-muted tabular-nums">
                    {record.incorrectCount}× falsch
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-muted">Bisher nichts, was dir besonders schwerfällt.</p>
        )}
      </section>
    </div>
  );
}
