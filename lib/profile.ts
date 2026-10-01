import { z } from "zod";

/** Ergebnis des Onboardings – Grundlage für Empfehlungen. */

export const EXPERIENCE_OPTIONS = [
  { value: "new", label: "Ich starte komplett neu" },
  { value: "some-kana", label: "Ich kenne etwas Hiragana/Katakana" },
  { value: "first-words", label: "Ich kenne erste Wörter und Sätze" },
  { value: "active", label: "Ich lerne bereits aktiv Japanisch" },
  { value: "advanced", label: "Ich bin fortgeschritten" },
] as const;

export const GOAL_OPTIONS = [
  { value: "everyday", label: "Japanisch im Alltag" },
  { value: "travel", label: "Reisen" },
  { value: "conversation", label: "Gespräche führen" },
  { value: "anime-manga", label: "Anime/Manga verstehen" },
  { value: "reading", label: "Lesen" },
  { value: "jlpt", label: "JLPT" },
  { value: "culture", label: "Japanische Kultur" },
  { value: "business", label: "Berufliche Kommunikation" },
] as const;

export const KANA_KNOWLEDGE_OPTIONS = [
  { value: "unknown", label: "unbekannt" },
  { value: "partial", label: "teilweise" },
  { value: "confident", label: "sicher" },
] as const;

export const AID_OPTIONS = [
  { value: "furigana", label: "Furigana", hint: "Lesung über Kanji" },
  { value: "romaji", label: "Romaji", hint: "Lateinische Umschrift" },
  { value: "translation", label: "Deutsche Übersetzung", hint: "Immer sichtbar" },
  { value: "audio", label: "Audio", hint: "Automatisch abspielen" },
] as const;

export const DAILY_GOAL_OPTIONS = [
  { value: 5, label: "5 Minuten" },
  { value: 10, label: "10 Minuten" },
  { value: 20, label: "20 Minuten" },
  { value: 30, label: "30+ Minuten" },
] as const;

type Values<T extends readonly { value: unknown }[]> = T[number]["value"];
const values = <T extends readonly { value: string }[]>(options: T) =>
  options.map((o) => o.value) as unknown as [Values<T>, ...Values<T>[]];

export const learnerProfileSchema = z.object({
  experience: z.enum(values(EXPERIENCE_OPTIONS)),
  goals: z.array(z.enum(values(GOAL_OPTIONS))),
  hiragana: z.enum(values(KANA_KNOWLEDGE_OPTIONS)),
  katakana: z.enum(values(KANA_KNOWLEDGE_OPTIONS)),
  aids: z.array(z.enum(values(AID_OPTIONS))),
  dailyMinutes: z.union([z.literal(5), z.literal(10), z.literal(20), z.literal(30)]).nullable(),
  completedAt: z.string(),
});

export type LearnerProfile = z.infer<typeof learnerProfileSchema>;
export type Experience = LearnerProfile["experience"];

export type Recommendation = { title: string; description: string; href: string };

/** Leitet aus dem Profil den sinnvollsten nächsten Schritt ab (Priorität: Kana zuerst). */
export function recommendNextStep(profile: LearnerProfile | null): Recommendation {
  if (!profile) {
    return {
      title: "Lernstand festlegen",
      description: "Ein paar kurze Fragen – danach schlagen wir dir passende Inhalte vor.",
      href: "/onboarding",
    };
  }
  if (profile.hiragana !== "confident") {
    return {
      title: "Hiragana lernen",
      description:
        profile.hiragana === "partial"
          ? "Festige die Zeichen, die du schon kennst, und schließe die Lücken."
          : "Die 46 Grundzeichen sind das Fundament für alles Weitere.",
      href: "/kana",
    };
  }
  if (profile.katakana !== "confident") {
    return {
      title: "Katakana lernen",
      description: "Katakana brauchst du für Lehnwörter, Namen und Speisekarten.",
      href: "/kana",
    };
  }
  if (profile.goals.includes("travel")) {
    return {
      title: "Situationen für die Reise",
      description: "Bahnhof, Hotel, Restaurant – Japanisch, das du vor Ort sofort brauchst.",
      href: "/situations",
    };
  }
  return {
    title: "Alltagssituationen",
    description: "Lerne Wörter und Ausdrücke direkt in typischen Gesprächen.",
    href: "/situations",
  };
}
