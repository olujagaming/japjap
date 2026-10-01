"use client";

import Link from "next/link";
import { useProgressList } from "@/hooks/use-user-data";
import { contentLabel } from "@/lib/content/labels";
import { isDifficult } from "@/lib/learning/progress";

/** Persönliche Schwierigkeiten über alle Inhaltsarten, z. B. シ / ツ oder ～ながら. */
export function DifficultItems() {
  const { data: records, loading } = useProgressList();
  if (loading) return null;
  const items = records
    .filter(isDifficult)
    .sort((a, b) => b.incorrectCount - a.incorrectCount)
    .map((r) => ({ r, label: contentLabel(r.contentType, r.contentId) }))
    .filter((x) => x.label !== null)
    .slice(0, 10);

  if (items.length === 0) {
    return (
      <p className="text-sm text-muted">
        Noch nichts – Inhalte, die dir schwerfallen, sammeln sich hier automatisch.
      </p>
    );
  }
  return (
    <ul className="flex flex-wrap gap-2">
      {items.map(({ r, label }) => (
        <li key={`${r.contentType}:${r.contentId}`}>
          <Link
            href={label!.href}
            className="flex flex-col rounded-md border border-akane/30 bg-akane-soft/30 px-3 py-2 hover:border-akane/60"
          >
            <span lang="ja" className="font-jp text-lg leading-tight">
              {label!.japanese}
            </span>
            <span className="text-xs text-muted">{label!.german}</span>
          </Link>
        </li>
      ))}
    </ul>
  );
}
