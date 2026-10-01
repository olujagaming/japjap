"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ProgressCard } from "@/components/learning/learning-card";
import { ButtonLink } from "@/components/ui/button";
import { CardLink } from "@/components/ui/card";
import { ErrorState } from "@/components/ui/states";
import { Tabs } from "@/components/ui/tabs";
import { BASIC_COUNT, CONFUSION_SETS, KANA } from "@/data/kana";
import { useProgressList } from "@/hooks/use-user-data";
import { PRACTICE_MODE_META, PRACTICE_MODES } from "@/lib/kana/practice";
import { isDifficult, isDue, isKnownStatus } from "@/lib/learning/progress";
import type { ScriptType } from "@/types/content";
import { KanaTables } from "./kana-tables";

type Tab = ScriptType | "practice";

const kanaById = new Map(KANA.map((k) => [k.id, k]));

export function KanaOverview() {
  const [tab, setTab] = useState<Tab>("hiragana");
  const { data: records, error } = useProgressList("kana");

  const progress = useMemo(() => new Map(records.map((r) => [r.contentId, r])), [records]);

  const knownBasic = (script: ScriptType) =>
    records.filter((r) => {
      const k = kanaById.get(r.contentId);
      return k?.scriptType === script && k.group === "basic" && isKnownStatus(r.status);
    }).length;

  const difficult = records
    .filter(isDifficult)
    .map((r) => kanaById.get(r.contentId))
    .filter((k) => k !== undefined);
  const dueChars = records
    .filter((r) => isDue(r))
    .map((r) => kanaById.get(r.contentId)?.character)
    .filter((c): c is string => Boolean(c));
  const due = dueChars.length;

  if (error) return <ErrorState />;

  return (
    <div className="flex flex-col gap-10">
      <section aria-label="Fortschritt" className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <ProgressCard
          label="Hiragana"
          ja="ひらがな"
          value={knownBasic("hiragana")}
          max={BASIC_COUNT}
        />
        <ProgressCard
          label="Katakana"
          ja="カタカナ"
          value={knownBasic("katakana")}
          max={BASIC_COUNT}
        />
        <div className="rounded-lg border border-line bg-surface p-4 lg:col-span-2">
          <div className="flex items-baseline justify-between gap-2">
            <p className="text-sm font-medium">Problemzeichen</p>
            {due > 0 ? (
              <Link
                href={`/kana/practice?mode=mixed&chars=${encodeURIComponent(dueChars.join(","))}`}
                className="text-xs text-accent tabular-nums underline-offset-4 hover:underline"
              >
                {due} fällig – wiederholen
              </Link>
            ) : null}
          </div>
          {difficult.length > 0 ? (
            <>
              <ul className="mt-3 flex flex-wrap gap-1.5">
                {difficult.slice(0, 12).map((k) => (
                  <li key={k.id}>
                    <Link
                      href={`/kana/${encodeURIComponent(k.character)}`}
                      lang="ja"
                      className="inline-flex h-9 min-w-9 items-center justify-center rounded border border-akane/30 bg-akane-soft/50 px-2 font-jp text-lg"
                    >
                      {k.character}
                    </Link>
                  </li>
                ))}
              </ul>
              <ButtonLink
                size="sm"
                variant="secondary"
                className="mt-3"
                href={`/kana/practice?mode=mixed&chars=${encodeURIComponent(difficult.map((k) => k.character).join(","))}`}
              >
                Problemzeichen üben
              </ButtonLink>
            </>
          ) : (
            <div className="mt-2">
              <p className="text-sm text-muted">Häufig verwechselt:</p>
              <ul className="mt-2 flex flex-wrap gap-2">
                {CONFUSION_SETS.slice(0, 4).map((set) => (
                  <li key={set.id}>
                    <Link
                      href={`/kana/practice?mode=confusion&chars=${encodeURIComponent(set.characters.join(","))}`}
                      className="inline-flex h-9 items-center rounded border border-line px-2.5 font-jp text-base hover:border-line-strong"
                      lang="ja"
                    >
                      {set.characters.join(" ↔ ")}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </section>

      <Tabs<Tab>
        label="Silbenschrift"
        value={tab}
        onChange={setTab}
        items={[
          { value: "hiragana", label: "Hiragana" },
          { value: "katakana", label: "Katakana" },
          { value: "practice", label: "Üben" },
        ]}
      >
        {tab === "practice" ? (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {PRACTICE_MODES.map((mode) => (
              <CardLink key={mode} href={`/kana/practice?mode=${mode}`}>
                <p className="font-semibold">{PRACTICE_MODE_META[mode].label}</p>
                <p className="mt-1 text-sm text-muted">{PRACTICE_MODE_META[mode].description}</p>
              </CardLink>
            ))}
          </div>
        ) : (
          <KanaTables script={tab} progress={progress} />
        )}
      </Tabs>
    </div>
  );
}
