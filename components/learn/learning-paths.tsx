"use client";

import Link from "next/link";
import { SectionHeader } from "@/components/layout/page-header";
import { DifficultyBadge } from "@/components/learning/badges";
import { ButtonLink } from "@/components/ui/button";
import { CheckIcon } from "@/components/ui/icons";
import { ProgressBar } from "@/components/ui/progress-bar";
import { ErrorState } from "@/components/ui/states";
import { LEARNING_PATH_SECTIONS, type LearningPath, type PathSection } from "@/data/learning-paths";
import { useProgressList } from "@/hooks/use-user-data";
import { pathProgress } from "@/lib/learning/paths";
import type { ProgressRecord } from "@/lib/store/types";
import { cn } from "@/lib/utils";

function PathCard({ path, records }: { path: LearningPath; records: ProgressRecord[] }) {
  const progress = pathProgress(path, records);
  return (
    <article className="flex h-full flex-col gap-4 rounded-lg border border-line bg-surface p-5">
      <header>
        <p lang="ja" className="font-jp text-2xl">
          {path.titleJa}
        </p>
        <h3 className="mt-0.5 text-base font-semibold">{path.title}</h3>
        <p className="mt-1.5 text-sm text-muted">{path.descriptionDe}</p>
        <div className="mt-3 flex items-center gap-3">
          <DifficultyBadge difficulty={path.level} />
          <span className="text-xs text-faint tabular-nums">
            {progress.completedItems} von {progress.items.length} Einheiten
          </span>
        </div>
        <ProgressBar
          className="mt-2"
          value={progress.completedItems}
          max={progress.items.length}
          label={`Fortschritt ${path.title}`}
        />
      </header>
      <ol className="flex flex-col divide-y divide-line border-y border-line">
        {progress.items.map((item, index) => {
          const isNext = progress.next === item;
          return (
            <li key={`${item.href}-${index}`}>
              <Link href={item.href} className="group flex items-center gap-3 py-2.5 text-sm">
                <span
                  aria-hidden="true"
                  className={cn(
                    "grid size-6 shrink-0 place-items-center rounded-full border text-xs",
                    item.done
                      ? "border-matcha bg-matcha text-bg"
                      : isNext
                        ? "border-accent text-accent"
                        : "border-line text-faint",
                  )}
                >
                  {item.done ? <CheckIcon size={13} strokeWidth={2.5} /> : index + 1}
                </span>
                <span className="min-w-0 flex-1 group-hover:underline">
                  {item.labelJa ? (
                    <span lang="ja" className="mr-2 font-jp">
                      {item.labelJa}
                    </span>
                  ) : null}
                  <span className={item.labelJa ? "text-muted" : undefined}>{item.label}</span>
                  {item.done ? <span className="sr-only"> (abgeschlossen)</span> : null}
                </span>
                <span className="text-xs text-faint tabular-nums">
                  {item.value}/{item.max}
                </span>
              </Link>
            </li>
          );
        })}
      </ol>
      {progress.next ? (
        <ButtonLink href={progress.next.href} className="mt-auto self-start">
          Weiter: {progress.next.label}
        </ButtonLink>
      ) : (
        <p className="text-sm text-matcha">
          Pfad abgeschlossen – Wiederholungen halten das Wissen frisch.
        </p>
      )}
    </article>
  );
}

function Section({ section, records }: { section: PathSection; records: ProgressRecord[] }) {
  return (
    <section className="flex flex-col">
      <SectionHeader title={section.title} description={section.descriptionDe} />
      {section.paths.length > 0 ? (
        <div
          className={cn(
            "grid flex-1 gap-4",
            section.paths.length > 1 && "lg:grid-cols-2 xl:grid-cols-3",
          )}
        >
          {section.paths.map((path) => (
            <PathCard key={path.id} path={path} records={records} />
          ))}
        </div>
      ) : null}
      {section.upcoming ? (
        <div className="rounded-lg border border-dashed border-line p-5">
          <p className="text-sm text-muted">
            In Vorbereitung – Inhalte für diese Themen entstehen gerade:
          </p>
          <ul className="mt-3 flex flex-wrap gap-2">
            {section.upcoming.map((topic) => (
              <li
                key={topic}
                className="rounded-full border border-line px-3 py-1 text-sm text-faint"
              >
                {topic}
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </section>
  );
}

export function LearningPaths() {
  const { data: records, error } = useProgressList();
  if (error) return <ErrorState />;

  // Abschnitte mit genau einem Pfad stehen nebeneinander, statt viel Leerraum zu erzeugen.
  const blocks: PathSection[][] = [];
  for (const section of LEARNING_PATH_SECTIONS) {
    const single = section.paths.length === 1 && !section.upcoming;
    const last = blocks[blocks.length - 1];
    if (single && last && last.length > 0 && last.every((s) => s.paths.length === 1 && !s.upcoming))
      last.push(section);
    else blocks.push([section]);
  }

  return (
    <div className="flex flex-col gap-12">
      {blocks.map((block) =>
        block.length === 1 ? (
          <Section key={block[0].id} section={block[0]} records={records} />
        ) : (
          <div
            key={block.map((s) => s.id).join("-")}
            className="grid gap-12 lg:grid-cols-2 lg:gap-6 xl:grid-cols-3"
          >
            {block.map((section) => (
              <Section key={section.id} section={section} records={records} />
            ))}
          </div>
        ),
      )}
    </div>
  );
}
