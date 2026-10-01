import { z } from "zod";

export const FURIGANA_MODES = ["always", "unknown", "off"] as const;
export const TRANSLATION_MODES = ["always", "click", "off"] as const;
export const THEMES = ["system", "light", "dark"] as const;
export const JP_FONT_SIZES = ["sm", "md", "lg", "xl"] as const;
export const LEVELS = ["beginner", "elementary", "intermediate", "advanced"] as const;
export const REVIEW_INTENSITIES = ["light", "normal", "intensive"] as const;

export type FuriganaMode = (typeof FURIGANA_MODES)[number];
export type TranslationMode = (typeof TRANSLATION_MODES)[number];
export type Theme = (typeof THEMES)[number];
export type JpFontSize = (typeof JP_FONT_SIZES)[number];
export type Level = (typeof LEVELS)[number];
export type ReviewIntensity = (typeof REVIEW_INTENSITIES)[number];

export const JP_FONT_SCALE: Record<JpFontSize, number> = {
  sm: 0.9,
  md: 1,
  lg: 1.15,
  xl: 1.3,
};

export const AUDIO_SPEEDS = [0.6, 0.8, 1, 1.2] as const;

/**
 * Jedes Feld hat ein eigenes `.catch()`: ein beschädigter oder veralteter Wert
 * setzt nur dieses Feld zurück, nicht die gesamten Einstellungen.
 */
export const settingsSchema = z.object({
  furigana: z.enum(FURIGANA_MODES).catch("always"),
  romaji: z.boolean().catch(true),
  translation: z.enum(TRANSLATION_MODES).catch("always"),
  englishMeanings: z.boolean().catch(false),
  audioAutoplay: z.boolean().catch(false),
  audioSpeed: z.number().min(0.5).max(1.5).catch(1),
  listeningAutoReplay: z.boolean().catch(false),
  jpFontSize: z.enum(JP_FONT_SIZES).catch("md"),
  theme: z.enum(THEMES).catch("system"),
  level: z.enum(LEVELS).catch("beginner"),
  reviewIntensity: z.enum(REVIEW_INTENSITIES).catch("normal"),
});

export type Settings = z.infer<typeof settingsSchema>;

export const DEFAULT_SETTINGS: Settings = settingsSchema.parse({});

export function parseSettings(input: unknown): Settings {
  const value = input && typeof input === "object" ? input : {};
  return settingsSchema.parse(value);
}

export const SETTINGS_STORAGE_KEY = "japjap.settings.v1";
