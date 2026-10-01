"use client";

import Link from "next/link";
import { useSyncExternalStore } from "react";
import { contentLabel } from "@/lib/content/labels";
import { getRecentServerSnapshot, getRecentSnapshot, subscribeRecent } from "@/lib/recent";

/** Zuletzt geöffnete Wörter, Kanji, Grammatik und Gespräche. */
export function RecentDiscoveries() {
  const recent = useSyncExternalStore(subscribeRecent, getRecentSnapshot, getRecentServerSnapshot);
  const items = recent
    .map((item) => ({ item, label: contentLabel(item.contentType, item.contentId) }))
    .filter((x) => x.label !== null)
    .slice(0, 8);

  if (items.length === 0) {
    return (
      <p className="text-sm text-muted">
        Hier erscheinen Wörter, Kanji und Gespräche, die du zuletzt geöffnet hast.
      </p>
    );
  }
  return (
    <ul className="flex flex-wrap gap-2">
      {items.map(({ item, label }) => (
        <li key={`${item.contentType}:${item.contentId}`}>
          <Link
            href={label!.href}
            className="flex flex-col rounded-md border border-line bg-surface px-3 py-2 transition-colors hover:border-line-strong"
          >
            <span lang="ja" className="font-jp text-lg leading-tight">
              {label!.japanese}
            </span>
            <span className="text-xs text-muted">
              {label!.german} · <span className="text-faint">{label!.typeLabel}</span>
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
}
