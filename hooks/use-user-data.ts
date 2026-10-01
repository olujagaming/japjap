"use client";

import { useCallback, useEffect, useState, useSyncExternalStore } from "react";
import type { LearnerProfile } from "@/lib/profile";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { LocalUserDataStore } from "@/lib/store/local-store";
import { SupabaseUserDataStore } from "@/lib/store/supabase-store";
import {
  emptyProgress,
  type ProgressRecord,
  type ReviewLogEntry,
  type UserDataStore,
} from "@/lib/store/types";
import type { ContentType } from "@/types/content";

// ---------------------------------------------------------------------------
// Auswahl des Speichers: angemeldet → Supabase, sonst Gastmodus (localStorage)
// ---------------------------------------------------------------------------

let local: LocalUserDataStore | null = null;
let resolved: Promise<UserDataStore> | null = null;

function resolveStore(): Promise<UserDataStore> {
  local ??= new LocalUserDataStore();
  const client = getSupabaseBrowserClient();
  if (!client) return Promise.resolve(local);
  if (!resolved) {
    resolved = client.auth
      .getSession()
      .then(({ data }) =>
        data.session ? new SupabaseUserDataStore(client, data.session.user.id) : local!,
      )
      .catch(() => local!);
    client.auth.onAuthStateChange(() => {
      resolved = null;
      notifyChange();
    });
  }
  return resolved;
}

// ---------------------------------------------------------------------------
// Änderungsbenachrichtigung: Schreibzugriffe lassen alle Abfragen neu laden
// ---------------------------------------------------------------------------

let version = 0;
const listeners = new Set<() => void>();

function notifyChange() {
  version++;
  for (const listener of listeners) listener();
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

/**
 * Proxy, der Schreibzugriffe an den aktiven Speicher weiterreicht
 * und anschließend alle abhängigen Ansichten aktualisiert.
 */
const userData: UserDataStore = {
  getProfile: async () => (await resolveStore()).getProfile(),
  getProgress: async (type, id) => (await resolveStore()).getProgress(type, id),
  listProgress: async (type) => (await resolveStore()).listProgress(type),
  listFavorites: async (type) => (await resolveStore()).listFavorites(type),
  listReviewLog: async (options) => (await resolveStore()).listReviewLog(options),
  saveProfile: async (profile) => {
    await (await resolveStore()).saveProfile(profile);
    notifyChange();
  },
  saveProgress: async (record) => {
    await (await resolveStore()).saveProgress(record);
    notifyChange();
  },
  toggleFavorite: async (type, id) => {
    const result = await (await resolveStore()).toggleFavorite(type, id);
    notifyChange();
    return result;
  },
  recordReview: async (entry) => {
    await (await resolveStore()).recordReview(entry);
    notifyChange();
  },
};

export function getUserDataStore(): UserDataStore {
  return userData;
}

// ---------------------------------------------------------------------------
// Hooks
// ---------------------------------------------------------------------------

type Loadable<T> = { data: T; loading: boolean; error: boolean };

function useStoreQuery<T>(
  query: (store: UserDataStore) => Promise<T>,
  initial: T,
  key: string,
): Loadable<T> {
  const currentVersion = useSyncExternalStore(
    subscribe,
    () => version,
    () => 0,
  );
  const [state, setState] = useState<Loadable<T> & { key: string }>({
    data: initial,
    loading: true,
    error: false,
    key,
  });

  useEffect(() => {
    let cancelled = false;
    query(userData).then(
      (data) => !cancelled && setState({ data, loading: false, error: false, key }),
      () => !cancelled && setState((s) => ({ ...s, loading: false, error: true, key })),
    );
    return () => {
      cancelled = true;
    };
    // `key` beschreibt die Abfrage vollständig; `currentVersion` lädt nach Änderungen neu.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, currentVersion]);

  // Beim Wechsel der Abfrage nicht kurz die alten Daten zeigen.
  if (state.key !== key) return { data: initial, loading: true, error: false };
  return state;
}

export function useLearnerProfile(): Loadable<LearnerProfile | null> {
  return useStoreQuery((s) => s.getProfile(), null, "profile");
}

export function useProgressList(contentType?: ContentType): Loadable<ProgressRecord[]> {
  return useStoreQuery(
    (s) => s.listProgress(contentType),
    EMPTY_LIST,
    `progress:${contentType ?? "all"}`,
  );
}

const EMPTY_LIST: ProgressRecord[] = [];
const EMPTY_LOG: ReviewLogEntry[] = [];

export function useReviewLog(sinceDays = 30): Loadable<ReviewLogEntry[]> {
  return useStoreQuery(
    (s) => s.listReviewLog({ since: new Date(Date.now() - sinceDays * 86_400_000).toISOString() }),
    EMPTY_LOG,
    `log:${sinceDays}`,
  );
}

/** Fortschritt eines einzelnen Inhalts inkl. Update-Funktion. */
export function useProgress(contentType: ContentType, contentId: string) {
  const state = useStoreQuery(
    async (s) =>
      (await s.getProgress(contentType, contentId)) ?? emptyProgress(contentType, contentId),
    emptyProgress(contentType, contentId),
    `progress:${contentType}:${contentId}`,
  );
  const update = useCallback(
    async (change: (record: ProgressRecord) => ProgressRecord) => {
      const current =
        (await userData.getProgress(contentType, contentId)) ??
        emptyProgress(contentType, contentId);
      const next = change(current);
      if (next !== current) await userData.saveProgress(next);
      return next;
    },
    [contentType, contentId],
  );
  return { ...state, update };
}

/** Anzahl der Inhalte, deren nächste Wiederholung fällig ist. */
export function useDueReviewCount(): Loadable<number> {
  return useStoreQuery(
    async (s) => {
      const now = Date.now();
      const records = await s.listProgress();
      return records.filter((r) => r.nextReviewAt && Date.parse(r.nextReviewAt) <= now).length;
    },
    0,
    "due-count",
  );
}

export type ActivityDay = { date: string; count: number; correct: number };

/** Übungen pro Tag der letzten `days` Tage (lokale Zeitzone), ältester Tag zuerst. */
export function useActivity(days = 30): Loadable<ActivityDay[]> {
  return useStoreQuery(
    async (s) => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const start = new Date(today);
      start.setDate(start.getDate() - (days - 1));
      const log = await s.listReviewLog({ since: start.toISOString() });
      const key = (d: Date) =>
        `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
      const result = Array.from({ length: days }, (_, i) => {
        const d = new Date(start);
        d.setDate(d.getDate() + i);
        return { date: key(d), count: 0, correct: 0 };
      });
      const byDate = new Map(result.map((day) => [day.date, day]));
      for (const entry of log) {
        const day = byDate.get(key(new Date(entry.reviewedAt)));
        if (!day) continue;
        day.count++;
        if (entry.rating !== "again") day.correct++;
      }
      return result;
    },
    [],
    `activity:${days}`,
  );
}

/** Favoritenstatus eines Inhalts inkl. Umschalten. */
export function useFavorite(contentType: ContentType, contentId: string) {
  const state = useStoreQuery(
    async (s) => (await s.listFavorites(contentType)).some((f) => f.contentId === contentId),
    false,
    `favorite:${contentType}:${contentId}`,
  );
  const toggle = useCallback(
    () => userData.toggleFavorite(contentType, contentId),
    [contentType, contentId],
  );
  return { ...state, toggle };
}

export function useFavorites(contentType?: ContentType) {
  return useStoreQuery(
    (s) => s.listFavorites(contentType),
    [],
    `favorites:${contentType ?? "all"}`,
  );
}
