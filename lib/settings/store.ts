import { applySettingsToDocument } from "./document";
import { DEFAULT_SETTINGS, parseSettings, SETTINGS_STORAGE_KEY, type Settings } from "./schema";

/**
 * Kleiner externer Store für Einstellungen (localStorage, tab-übergreifend synchronisiert).
 * Wird über useSyncExternalStore konsumiert; der Snapshot ist referenzstabil.
 */

type Listener = () => void;

const listeners = new Set<Listener>();
let snapshot: Settings | null = null;

function read(): Settings {
  try {
    const raw = window.localStorage.getItem(SETTINGS_STORAGE_KEY);
    return parseSettings(raw ? JSON.parse(raw) : {});
  } catch {
    return DEFAULT_SETTINGS;
  }
}

function emit() {
  for (const listener of listeners) listener();
}

export function getSettingsSnapshot(): Settings {
  if (snapshot === null) snapshot = read();
  return snapshot;
}

export function getServerSettingsSnapshot(): Settings {
  return DEFAULT_SETTINGS;
}

export function subscribeSettings(listener: Listener): () => void {
  listeners.add(listener);

  const onStorage = (event: StorageEvent) => {
    if (event.key !== SETTINGS_STORAGE_KEY) return;
    snapshot = read();
    applySettingsToDocument(snapshot, document.documentElement);
    emit();
  };
  const media = window.matchMedia?.("(prefers-color-scheme: dark)");
  const onMedia = () => {
    if (getSettingsSnapshot().theme === "system") {
      applySettingsToDocument(getSettingsSnapshot(), document.documentElement);
    }
  };

  window.addEventListener("storage", onStorage);
  media?.addEventListener("change", onMedia);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", onStorage);
    media?.removeEventListener("change", onMedia);
  };
}

export function updateSettings(patch: Partial<Settings>): Settings {
  const next = parseSettings({ ...getSettingsSnapshot(), ...patch });
  snapshot = next;
  try {
    window.localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(next));
  } catch {
    // Privater Modus / Speicher voll: Einstellungen gelten dann nur für diese Sitzung.
  }
  applySettingsToDocument(next, document.documentElement);
  emit();
  return next;
}

export function resetSettings(): Settings {
  return updateSettings(DEFAULT_SETTINGS);
}
