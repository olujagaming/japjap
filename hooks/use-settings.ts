"use client";

import { useSyncExternalStore } from "react";
import {
  getServerSettingsSnapshot,
  getSettingsSnapshot,
  subscribeSettings,
  updateSettings,
} from "@/lib/settings/store";
import type { Settings } from "@/lib/settings/schema";

/**
 * Liefert die aktuellen Nutzereinstellungen. Kein React-Context nötig:
 * der Store ist modulglobal, Komponenten abonnieren ihn direkt.
 */
export function useSettings(): [Settings, (patch: Partial<Settings>) => void] {
  const settings = useSyncExternalStore(
    subscribeSettings,
    getSettingsSnapshot,
    getServerSettingsSnapshot,
  );
  return [settings, updateSettings];
}
