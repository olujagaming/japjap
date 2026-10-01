import type { PartnerRole, Politeness } from "./schemas";

/** Anzeigenamen für Rollen und Höflichkeitsstufen (Client und Server). */
export const PARTNER_LABELS: Record<PartnerRole, { de: string; ja: string; en: string }> = {
  friend: { de: "Freund/in", ja: "友達", en: "a friend of the learner (same age)" },
  clerk: { de: "Verkäufer/in", ja: "店員", en: "a shop clerk" },
  waiter: { de: "Kellner/in", ja: "店員", en: "a waiter or waitress in a restaurant" },
  staff: {
    de: "Mitarbeiter/in",
    ja: "係員",
    en: "a staff member (e.g. at a station or information desk)",
  },
  "hotel-reception": { de: "Hotelrezeption", ja: "フロント", en: "a hotel receptionist" },
  colleague: { de: "Kolleg/in", ja: "同僚", en: "a colleague at work" },
  teacher: { de: "Lehrer/in", ja: "先生", en: "a Japanese teacher" },
};

export const POLITENESS_LABELS: Record<Politeness, string> = {
  casual: "locker",
  neutral: "neutral (です/ます)",
  polite: "höflich",
};
