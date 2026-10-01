import type { ReactNode } from "react";
import { CardLink } from "@/components/ui/card";
import { ArrowRightIcon } from "@/components/ui/icons";
import { ProgressBar } from "@/components/ui/progress-bar";

/** Karte für einen Lernbereich oder Lernpfad mit optionalem Fortschritt. */
export function LearningCard({
  href,
  title,
  ja,
  description,
  meta,
  progress,
}: {
  href: string;
  title: string;
  ja?: string;
  description?: ReactNode;
  meta?: ReactNode;
  progress?: { value: number; max: number };
}) {
  return (
    <CardLink href={href} className="flex h-full flex-col">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          {ja ? (
            <p lang="ja" className="font-jp text-xl text-fg">
              {ja}
            </p>
          ) : null}
          <h3 className={ja ? "mt-0.5 text-sm font-medium text-muted" : "text-base font-semibold"}>
            {title}
          </h3>
        </div>
        <ArrowRightIcon
          size={18}
          className="mt-1 shrink-0 text-faint transition-transform duration-200 group-hover:translate-x-0.5 group-hover:text-fg"
        />
      </div>
      {description ? (
        <p className="mt-3 text-sm leading-relaxed text-muted">{description}</p>
      ) : null}
      {meta ? <div className="mt-4 flex flex-wrap gap-2">{meta}</div> : null}
      {progress ? (
        <div className="mt-auto pt-5">
          <ProgressBar value={progress.value} max={progress.max} label={`Fortschritt ${title}`} />
          <p className="mt-1.5 text-xs text-faint tabular-nums">
            {progress.value} / {progress.max}
          </p>
        </div>
      ) : null}
    </CardLink>
  );
}

/** Kompakte Fortschrittsanzeige für Übersichten (Dashboard, Progress). */
export function ProgressCard({
  label,
  ja,
  value,
  max,
  hint,
}: {
  label: string;
  ja?: string;
  value: number;
  max?: number;
  hint?: string;
}) {
  return (
    <div className="rounded-lg border border-line bg-surface p-4">
      <div className="flex items-baseline justify-between gap-2">
        <p className="text-sm font-medium text-fg">{label}</p>
        {ja ? (
          <span lang="ja" className="text-xs text-faint">
            {ja}
          </span>
        ) : null}
      </div>
      <p className="mt-2 text-2xl font-semibold tracking-tight tabular-nums">
        {value}
        {max !== undefined ? (
          <span className="text-base font-normal text-faint"> / {max}</span>
        ) : null}
      </p>
      {max !== undefined ? (
        <ProgressBar className="mt-3" value={value} max={max} label={label} />
      ) : null}
      {hint ? <p className="mt-2 text-xs text-faint">{hint}</p> : null}
    </div>
  );
}
