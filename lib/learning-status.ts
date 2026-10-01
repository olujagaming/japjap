import type { BadgeTone } from "@/components/ui/badge";
import type { Difficulty, LearningStatus } from "@/types/content";

export const LEARNING_STATUS_META: Record<
  LearningStatus,
  {
    label: string;
    tone: BadgeTone;
    /** Textsymbol, damit Status nicht nur über Farbe vermittelt wird. */ mark: string;
  }
> = {
  unseen: { label: "Neu", tone: "neutral", mark: "○" },
  familiar: { label: "Gesehen", tone: "neutral", mark: "◔" },
  learning: { label: "Am Lernen", tone: "kohaku", mark: "◑" },
  known: { label: "Bekannt", tone: "accent", mark: "◕" },
  mastered: { label: "Sicher", tone: "matcha", mark: "●" },
};

export const DIFFICULTY_META: Record<Difficulty, { label: string; level: 1 | 2 | 3 | 4 }> = {
  beginner: { label: "Einsteiger", level: 1 },
  elementary: { label: "Grundstufe", level: 2 },
  intermediate: { label: "Mittelstufe", level: 3 },
  advanced: { label: "Fortgeschritten", level: 4 },
};
