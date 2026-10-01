"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Button, ButtonLink } from "@/components/ui/button";
import { ProgressBar } from "@/components/ui/progress-bar";
import { EmptyState, ErrorState, LoadingState } from "@/components/ui/states";
import { useSettings } from "@/hooks/use-settings";
import { getUserDataStore, useProgressList } from "@/hooks/use-user-data";
import { contentLabel } from "@/lib/content/labels";
import { applyRating } from "@/lib/learning/progress";
import {
  buildReviewQueue,
  intervalPreview,
  REVIEWABLE_TYPES,
  SESSION_SIZE,
} from "@/lib/review/queue";
import { createTask, createTasks, TASK_LABELS, type ReviewTask } from "@/lib/review/tasks";
import { REVIEW_RATING_LABELS, REVIEW_RATINGS, type ReviewRating } from "@/lib/srs/types";
import { emptyProgress } from "@/lib/store/types";
import { cn } from "@/lib/utils";
import type { ContentType } from "@/types/content";
import { ReviewTaskView, type TaskResult, type TaskVerdict } from "./review-task";

const SUGGESTED: Record<TaskVerdict, ReviewRating | null> = {
  correct: "good",
  almost: "hard",
  incorrect: "again",
  open: null,
};

const RATING_STYLES: Record<ReviewRating, string> = {
  again: "border-akane/40 hover:bg-akane-soft",
  hard: "border-kohaku/40 hover:bg-kohaku-soft",
  good: "border-matcha/40 hover:bg-matcha-soft",
  easy: "border-accent/40 hover:bg-accent-soft",
};

type Done = { task: ReviewTask; rating: ReviewRating };

function RatingBar({
  task,
  suggested,
  onRate,
}: {
  task: ReviewTask;
  suggested: ReviewRating | null;
  onRate: (rating: ReviewRating) => void;
}) {
  const [now] = useState(() => new Date());
  const preview = useMemo(() => intervalPreview(task.record, now), [task.record, now]);
  const suggestedRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    suggestedRef.current?.focus();
    const onKey = (event: KeyboardEvent) => {
      const index = Number(event.key) - 1;
      if (index >= 0 && index < REVIEW_RATINGS.length) onRate(REVIEW_RATINGS[index]);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onRate]);

  return (
    <div className="flex flex-col items-center gap-2">
      <p className="text-sm text-muted">
        {suggested
          ? "Wie gut wusstest du es? Der Vorschlag ist markiert."
          : "Wie gut wusstest du es?"}
      </p>
      <div role="group" aria-label="Bewertung" className="grid w-full max-w-lg grid-cols-4 gap-2">
        {REVIEW_RATINGS.map((rating, index) => (
          <button
            key={rating}
            ref={rating === suggested ? suggestedRef : undefined}
            type="button"
            onClick={() => onRate(rating)}
            className={cn(
              "flex flex-col items-center rounded-lg border bg-surface px-2 py-2.5 transition-colors",
              RATING_STYLES[rating],
              rating === suggested && "ring-2 ring-accent/40",
            )}
          >
            <span className="text-sm font-medium">{REVIEW_RATING_LABELS[rating]}</span>
            <span className="text-xs text-faint tabular-nums">{preview[rating]}</span>
            <span className="sr-only">, Taste {index + 1}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

/**
 * Gemischte Review-Session. Die Warteschlange wird beim Start eingefroren; mit „Nochmal“
 * bewertete Inhalte kommen in derselben Session ein weiteres Mal.
 */
export function ReviewSession() {
  const params = useSearchParams();
  const types = useMemo(() => {
    const raw = params.get("types")?.split(",") ?? [];
    const valid = raw.filter((t): t is (typeof REVIEWABLE_TYPES)[number] =>
      (REVIEWABLE_TYPES as readonly string[]).includes(t),
    );
    return valid.length > 0 ? (valid as ContentType[]) : undefined;
  }, [params]);

  const { data: records, loading, error } = useProgressList();
  const [settings] = useSettings();
  const [tasks, setTasks] = useState<ReviewTask[] | null>(null);
  const [index, setIndex] = useState(0);
  const [result, setResult] = useState<TaskResult | null>(null);
  const [done, setDone] = useState<Done[]>([]);
  const requeued = useRef(new Set<string>());
  const busy = useRef(false);

  const [now] = useState(() => new Date());
  const available = useMemo(
    () => buildReviewQueue({ records, now, limit: SESSION_SIZE[settings.reviewIntensity], types }),
    [records, now, settings.reviewIntensity, types],
  );

  const start = () => {
    requeued.current.clear();
    setTasks(createTasks(available));
    setIndex(0);
    setResult(null);
    setDone([]);
  };

  const rate = useCallback(
    async (rating: ReviewRating) => {
      if (!tasks || !result || busy.current) return;
      busy.current = true;
      try {
        const task = tasks[index];
        const store = getUserDataStore();
        const { contentType, contentId } = task.record;
        const current =
          (await store.getProgress(contentType, contentId)) ??
          emptyProgress(contentType, contentId);
        const next = applyRating(current, rating);
        await store.saveProgress(next);
        await store.recordReview({
          contentType,
          contentId,
          taskType: task.kind,
          rating,
          answer: result.answer || undefined,
          reviewedAt: new Date().toISOString(),
        });
        setDone((d) => [...d, { task, rating }]);
        const key = `${contentType}:${contentId}`;
        if (rating === "again" && !requeued.current.has(key)) {
          requeued.current.add(key);
          const again = createTask(next);
          if (again) setTasks((t) => (t ? [...t, again] : t));
        }
        setResult(null);
        setIndex((i) => i + 1);
      } finally {
        busy.current = false;
      }
    },
    [tasks, index, result],
  );

  if (error) return <ErrorState />;
  if (loading) return <LoadingState label="Wiederholungen werden geladen …" />;

  // ---------- Start ----------
  if (!tasks) {
    if (available.length === 0) {
      return (
        <EmptyState
          ja="済"
          title="Gerade ist nichts fällig."
          description="Neue Inhalte kommen in die Wiederholung, wenn du sie übst oder auf einer Detailseite „Zur Wiederholung hinzufügen“ wählst."
          action={
            <div className="flex flex-wrap justify-center gap-2">
              <ButtonLink href="/kana/practice">Kana üben</ButtonLink>
              <ButtonLink href="/vocabulary" variant="secondary">
                Vokabeln entdecken
              </ButtonLink>
            </div>
          }
        />
      );
    }
    return (
      <div className="flex flex-col items-start gap-5 rounded-lg border border-line bg-surface p-6">
        <p className="text-2xl font-semibold tabular-nums">
          {available.length} {available.length === 1 ? "Wiederholung" : "Wiederholungen"}
        </p>
        <p className="text-muted">
          Gemischt aus allen fälligen Inhalten. Antworte zuerst selbst – danach entscheidest du, wie
          gut du es wusstest.
        </p>
        <Button size="lg" onClick={start}>
          Review starten
        </Button>
      </div>
    );
  }

  // ---------- Zusammenfassung ----------
  if (index >= tasks.length) {
    const counts = Object.fromEntries(
      REVIEW_RATINGS.map((r) => [r, done.filter((d) => d.rating === r).length]),
    ) as Record<ReviewRating, number>;
    const weak = [
      ...new Map(
        done
          .filter((d) => d.rating === "again" || d.rating === "hard")
          .map((d) => [`${d.task.record.contentType}:${d.task.record.contentId}`, d.task.record]),
      ).values(),
    ];
    return (
      <div className="flex flex-col gap-8">
        <div>
          <p className="text-sm text-muted">Session abgeschlossen</p>
          <p className="mt-1 text-3xl font-semibold tracking-tight tabular-nums">
            {
              new Set(done.map((d) => `${d.task.record.contentType}:${d.task.record.contentId}`))
                .size
            }{" "}
            Inhalte wiederholt
          </p>
        </div>
        <dl className="grid max-w-lg grid-cols-4 gap-2">
          {REVIEW_RATINGS.map((rating) => (
            <div key={rating} className="rounded-lg border border-line bg-surface p-3 text-center">
              <dt className="text-xs text-muted">{REVIEW_RATING_LABELS[rating]}</dt>
              <dd className="text-xl font-semibold tabular-nums">{counts[rating]}</dd>
            </div>
          ))}
        </dl>
        {weak.length > 0 ? (
          <section>
            <h2 className="mb-3 text-sm font-medium">Noch unsicher</h2>
            <ul className="flex flex-wrap gap-2">
              {weak.map((record) => {
                const label = contentLabel(record.contentType, record.contentId);
                return label ? (
                  <li key={`${record.contentType}:${record.contentId}`}>
                    <Link
                      href={label.href}
                      className="inline-flex items-baseline gap-2 rounded-md border border-line bg-surface px-3 py-2 hover:border-line-strong"
                    >
                      <span lang="ja" className="font-jp text-lg">
                        {label.japanese}
                      </span>
                      <span className="text-sm text-muted">{label.german}</span>
                    </Link>
                  </li>
                ) : null;
              })}
            </ul>
          </section>
        ) : null}
        <div className="flex flex-wrap gap-2">
          <ButtonLink href="/review">Zur Übersicht</ButtonLink>
          <ButtonLink href="/progress" variant="secondary">
            Fortschritt ansehen
          </ButtonLink>
        </div>
      </div>
    );
  }

  // ---------- Laufende Session ----------
  const task = tasks[index];
  const label = contentLabel(task.record.contentType, task.record.contentId);
  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-10">
      <div className="flex items-center gap-4">
        <ProgressBar
          value={index}
          max={tasks.length}
          label="Fortschritt der Session"
          className="flex-1"
        />
        <span className="text-xs text-faint tabular-nums">
          {index + 1}/{tasks.length}
        </span>
        <Button size="sm" variant="ghost" onClick={() => setIndex(tasks.length)}>
          Beenden
        </Button>
      </div>
      <p className="-mb-6 text-center text-xs tracking-[0.15em] text-faint uppercase">
        {label?.typeLabel} · {TASK_LABELS[task.kind]}
      </p>
      <ReviewTaskView
        key={`${index}-${task.record.contentId}`}
        task={task}
        result={result}
        onAnswer={setResult}
      />
      {result ? (
        <RatingBar
          key={`rate-${index}`}
          task={task}
          suggested={SUGGESTED[result.verdict]}
          onRate={(r) => void rate(r)}
        />
      ) : null}
    </div>
  );
}
