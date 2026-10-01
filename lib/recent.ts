import type { ContentType } from "@/types/content";

/**
 * Zuletzt geöffnete Inhalte („Recent Discoveries“). Bewusst nur pro Gerät im Browser:
 * eine Komfortfunktion, kein Lernfortschritt.
 */
export type RecentItem = { contentType: ContentType; contentId: string; viewedAt: string };

const KEY = "japjap.recent.v1";
const MAX = 12;
const EMPTY: RecentItem[] = [];

let cache: RecentItem[] | null = null;
const listeners = new Set<() => void>();

function read(): RecentItem[] {
  try {
    const parsed = JSON.parse(window.localStorage.getItem(KEY) ?? "[]");
    return Array.isArray(parsed) ? parsed.filter((i) => i && typeof i.contentId === "string") : [];
  } catch {
    return [];
  }
}

export function getRecentSnapshot(): RecentItem[] {
  cache ??= read();
  return cache;
}

export function getRecentServerSnapshot(): RecentItem[] {
  return EMPTY;
}

export function subscribeRecent(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function recordRecent(contentType: ContentType, contentId: string, now = new Date()) {
  const next = [
    { contentType, contentId, viewedAt: now.toISOString() },
    ...getRecentSnapshot().filter(
      (i) => !(i.contentType === contentType && i.contentId === contentId),
    ),
  ].slice(0, MAX);
  cache = next;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    // ohne Speicher nur für diese Sitzung
  }
  for (const listener of listeners) listener();
}
