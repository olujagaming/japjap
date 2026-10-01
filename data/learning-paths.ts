import type { Difficulty, KanaGroup, ScriptType } from "@/types/content";

/**
 * Geführte Lernpfade. Sie bündeln vorhandene Inhalte in einer sinnvollen Reihenfolge,
 * ohne einzusperren: Jede Einheit ist auch direkt erreichbar.
 */

export type PathItem =
  | { kind: "kana"; script: ScriptType; groups: KanaGroup[]; label: string }
  | { kind: "situation"; slug: string }
  | { kind: "conversation"; id: string }
  | { kind: "vocabulary"; tag: string; label: string };

export type LearningPath = {
  id: string;
  title: string;
  titleJa: string;
  descriptionDe: string;
  level: Difficulty;
  items: PathItem[];
};

export type PathSection = {
  id: string;
  title: string;
  descriptionDe: string;
  paths: LearningPath[];
  /** Themen, deren Inhalte noch entstehen. */
  upcoming?: string[];
};

export const LEARNING_PATH_SECTIONS: readonly PathSection[] = [
  {
    id: "foundations",
    title: "Grundlagen",
    descriptionDe: "Schrift, Aussprache und die allerersten Wörter.",
    paths: [
      {
        id: "hiragana",
        title: "Hiragana",
        titleJa: "ひらがな",
        descriptionDe: "Die erste Silbenschrift – Grundlage für jedes japanische Wort.",
        level: "beginner",
        items: [
          { kind: "kana", script: "hiragana", groups: ["basic"], label: "46 Grundzeichen" },
          {
            kind: "kana",
            script: "hiragana",
            groups: ["dakuten", "handakuten"],
            label: "Dakuten und Handakuten",
          },
          { kind: "kana", script: "hiragana", groups: ["yoon"], label: "Kombinationen (Yōon)" },
        ],
      },
      {
        id: "katakana",
        title: "Katakana",
        titleJa: "カタカナ",
        descriptionDe: "Für Lehnwörter, Namen und Speisekarten.",
        level: "beginner",
        items: [
          { kind: "kana", script: "katakana", groups: ["basic"], label: "46 Grundzeichen" },
          {
            kind: "kana",
            script: "katakana",
            groups: ["dakuten", "handakuten"],
            label: "Dakuten und Handakuten",
          },
          { kind: "kana", script: "katakana", groups: ["yoon"], label: "Kombinationen (Yōon)" },
          { kind: "kana", script: "katakana", groups: ["extended"], label: "Erweiterte Katakana" },
        ],
      },
      {
        id: "first-words",
        title: "Erste Wörter und Aussprache",
        titleJa: "はじめの言葉",
        descriptionDe: "Begrüßungen, Grundwortschatz und ein erstes Gespräch zum Mithören.",
        level: "beginner",
        items: [
          { kind: "vocabulary", tag: "greeting", label: "Begrüßungen" },
          { kind: "situation", slug: "greeting" },
          { kind: "conversation", id: "morning-greeting" },
          { kind: "vocabulary", tag: "basics", label: "Grundwortschatz" },
        ],
      },
    ],
  },
  {
    id: "everyday",
    title: "Japanisch im Alltag",
    descriptionDe: "Die Situationen, die dir in Japan jeden Tag begegnen.",
    paths: [
      {
        id: "everyday",
        title: "Alltag",
        titleJa: "日常",
        descriptionDe: "Begrüßen, vorstellen, einkaufen, essen gehen, Bahn fahren und Small Talk.",
        level: "beginner",
        items: [
          { kind: "situation", slug: "greeting" },
          { kind: "situation", slug: "introduction" },
          { kind: "situation", slug: "konbini" },
          { kind: "situation", slug: "cafe" },
          { kind: "situation", slug: "restaurant" },
          { kind: "situation", slug: "shopping" },
          { kind: "situation", slug: "station" },
          { kind: "situation", slug: "friends" },
        ],
      },
    ],
  },
  {
    id: "travel",
    title: "Reisen",
    descriptionDe: "Alles für die erste Reise nach Japan.",
    paths: [
      {
        id: "travel",
        title: "Unterwegs in Japan",
        titleJa: "旅行",
        descriptionDe: "Bahnhof, Hotel, Weg fragen, Restaurant und Einkaufen.",
        level: "elementary",
        items: [
          { kind: "situation", slug: "station" },
          { kind: "situation", slug: "hotel" },
          { kind: "situation", slug: "directions" },
          { kind: "situation", slug: "restaurant" },
          { kind: "situation", slug: "shopping" },
        ],
      },
    ],
  },
  {
    id: "social",
    title: "Kontakte",
    descriptionDe: "Menschen kennenlernen und Zeit mit Freunden verbringen.",
    paths: [
      {
        id: "social",
        title: "Freunde finden",
        titleJa: "友達",
        descriptionDe: "Sich vorstellen, über Hobbys sprechen, Pläne machen – höflich und locker.",
        level: "elementary",
        items: [
          { kind: "situation", slug: "introduction" },
          { kind: "conversation", id: "party-introduction" },
          { kind: "situation", slug: "friends" },
          { kind: "vocabulary", tag: "friends", label: "Wörter für Freizeit" },
        ],
      },
    ],
  },
  {
    id: "advanced",
    title: "Fortgeschritten",
    descriptionDe: "Für komplexere Gespräche und formelle Sprache.",
    paths: [],
    upcoming: [
      "Am Arbeitsplatz",
      "Formelle Sprache (敬語)",
      "Telefonieren",
      "Komplexere Gespräche",
    ],
  },
];
