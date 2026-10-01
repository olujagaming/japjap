import { JP_FONT_SCALE, SETTINGS_STORAGE_KEY, type Settings } from "./schema";

export type ResolvedTheme = "light" | "dark";

export function resolveTheme(theme: Settings["theme"], prefersDark: boolean): ResolvedTheme {
  if (theme === "system") return prefersDark ? "dark" : "light";
  return theme;
}

/** Überträgt die Lesehilfen und das Theme als data-Attribute auf <html>. */
export function applySettingsToDocument(settings: Settings, root: HTMLElement): void {
  const prefersDark = window.matchMedia?.("(prefers-color-scheme: dark)").matches ?? false;
  root.dataset.theme = resolveTheme(settings.theme, prefersDark);
  root.dataset.furigana = settings.furigana;
  root.dataset.romaji = settings.romaji ? "on" : "off";
  root.dataset.translation = settings.translation;
  root.style.setProperty("--jp-scale", String(JP_FONT_SCALE[settings.jpFontSize]));
}

/**
 * Läuft synchron im <head>, bevor der Browser zeichnet: verhindert Theme-Flackern
 * und falsch sichtbare Furigana/Romaji/Übersetzungen beim ersten Laden.
 * Muss eigenständiges ES5-kompatibles JavaScript bleiben.
 */
export const settingsBootScript = `(function(){try{
var d=document.documentElement,s={};
try{s=JSON.parse(localStorage.getItem(${JSON.stringify(SETTINGS_STORAGE_KEY)})||"{}")||{}}catch(e){}
var t=s.theme==="light"||s.theme==="dark"?s.theme:(window.matchMedia&&matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light");
d.dataset.theme=t;
d.dataset.furigana=["always","unknown","off"].indexOf(s.furigana)>-1?s.furigana:"always";
d.dataset.romaji=s.romaji===false?"off":"on";
d.dataset.translation=["always","click","off"].indexOf(s.translation)>-1?s.translation:"always";
var sc=${JSON.stringify(JP_FONT_SCALE)}[s.jpFontSize];if(sc)d.style.setProperty("--jp-scale",String(sc));
}catch(e){}})();`;
