"use client";

import { useEffect, useState } from "react";
import type { LearnerProfile } from "@/lib/profile";
import { LocalUserDataStore } from "@/lib/store/local-store";
import type { ProgressRecord, UserDataStore } from "@/lib/store/types";
import type { ContentType } from "@/types/content";

let store: UserDataStore | null = null;

/**
 * Aktiver Nutzerdaten-Speicher. Derzeit Gastmodus (localStorage);
 * ab Phase 2 wird bei Anmeldung die Supabase-Implementierung gewählt.
 */
export function getUserDataStore(): UserDataStore {
  store ??= new LocalUserDataStore();
  return store;
}

type Loadable<T> = { data: T; loading: boolean };

function useStoreQuery<T>(query: (store: UserDataStore) => Promise<T>, initial: T, key: string) {
  const [state, setState] = useState<Loadable<T>>({ data: initial, loading: true });
  useEffect(() => {
    let cancelled = false;
    query(getUserDataStore()).then((data) => {
      if (!cancelled) setState({ data, loading: false });
    });
    return () => {
      cancelled = true;
    };
    // `key` beschreibt die Abfrage vollständig.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);
  return state;
}

export function useLearnerProfile(): Loadable<LearnerProfile | null> {
  return useStoreQuery((s) => s.getProfile(), null, "profile");
}

export function useProgressList(contentType?: ContentType): Loadable<ProgressRecord[]> {
  return useStoreQuery((s) => s.listProgress(contentType), [], `progress:${contentType ?? "all"}`);
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
