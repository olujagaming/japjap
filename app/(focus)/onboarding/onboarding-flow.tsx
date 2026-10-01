"use client";

import { useRouter } from "next/navigation";
import { useState, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeftIcon, CheckIcon } from "@/components/ui/icons";
import { ProgressBar } from "@/components/ui/progress-bar";
import { getUserDataStore } from "@/hooks/use-user-data";
import {
  AID_OPTIONS,
  DAILY_GOAL_OPTIONS,
  EXPERIENCE_OPTIONS,
  GOAL_OPTIONS,
  KANA_KNOWLEDGE_OPTIONS,
  type Experience,
  type LearnerProfile,
} from "@/lib/profile";
import type { Level } from "@/lib/settings/schema";
import { updateSettings } from "@/lib/settings/store";
import { cn } from "@/lib/utils";

type Draft = Omit<LearnerProfile, "completedAt" | "experience"> & { experience: Experience | null };

const LEVEL_BY_EXPERIENCE: Record<Experience, Level> = {
  new: "beginner",
  "some-kana": "beginner",
  "first-words": "elementary",
  active: "intermediate",
  advanced: "advanced",
};

function OptionTile({
  type,
  name,
  checked,
  onChange,
  children,
  hint,
}: {
  type: "radio" | "checkbox";
  name: string;
  checked: boolean;
  onChange: () => void;
  children: ReactNode;
  hint?: string;
}) {
  return (
    <label
      className={cn(
        "flex cursor-pointer items-center gap-3 rounded-md border px-4 py-3 transition-colors",
        "has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-accent/40",
        checked
          ? "border-accent bg-accent-soft"
          : "border-line bg-surface hover:border-line-strong",
      )}
    >
      <input type={type} name={name} checked={checked} onChange={onChange} className="sr-only" />
      <span
        aria-hidden="true"
        className={cn(
          "grid size-5 shrink-0 place-items-center border",
          type === "radio" ? "rounded-full" : "rounded",
          checked ? "border-accent bg-accent text-accent-fg" : "border-line-strong",
        )}
      >
        {checked ? <CheckIcon size={13} strokeWidth={2.5} /> : null}
      </span>
      <span className="flex-1">
        <span className="block text-sm font-medium text-fg">{children}</span>
        {hint ? <span className="block text-xs text-muted">{hint}</span> : null}
      </span>
    </label>
  );
}

function Step({
  legend,
  description,
  children,
}: {
  legend: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <fieldset className="animate-in">
      <legend className="text-xl font-semibold tracking-tight sm:text-2xl">{legend}</legend>
      {description ? <p className="mt-2 text-sm text-muted">{description}</p> : null}
      <div className="mt-6 flex flex-col gap-2">{children}</div>
    </fieldset>
  );
}

const STEP_COUNT = 5;

export function OnboardingFlow() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);
  const [draft, setDraft] = useState<Draft>({
    experience: null,
    goals: [],
    hiragana: "unknown",
    katakana: "unknown",
    aids: ["furigana", "romaji", "translation", "audio"],
    dailyMinutes: null,
  });

  const toggle = <T extends string>(list: T[], value: T) =>
    list.includes(value) ? list.filter((v) => v !== value) : [...list, value];

  const canContinue = step !== 0 || draft.experience !== null;

  const finish = async () => {
    if (!draft.experience) return;
    setSaving(true);
    const profile: LearnerProfile = {
      ...draft,
      experience: draft.experience,
      completedAt: new Date().toISOString(),
    };
    await getUserDataStore().saveProfile(profile);
    updateSettings({
      level: LEVEL_BY_EXPERIENCE[profile.experience],
      furigana: profile.aids.includes("furigana") ? "always" : "unknown",
      romaji: profile.aids.includes("romaji"),
      translation: profile.aids.includes("translation") ? "always" : "click",
      audioAutoplay: profile.aids.includes("audio"),
    });
    router.push("/");
  };

  return (
    <div className="flex flex-1 flex-col">
      <div className="mb-10">
        <p className="mb-2 text-xs text-faint tabular-nums">
          Schritt {step + 1} von {STEP_COUNT}
        </p>
        <ProgressBar value={step + 1} max={STEP_COUNT} label="Fortschritt Einrichtung" />
      </div>

      {step === 0 ? (
        <Step legend="Wie gut kannst du bereits Japanisch?">
          {EXPERIENCE_OPTIONS.map((option) => (
            <OptionTile
              key={option.value}
              type="radio"
              name="experience"
              checked={draft.experience === option.value}
              onChange={() => setDraft({ ...draft, experience: option.value })}
            >
              {option.label}
            </OptionTile>
          ))}
        </Step>
      ) : null}

      {step === 1 ? (
        <Step legend="Was möchtest du hauptsächlich lernen?" description="Mehrfachauswahl möglich.">
          <div className="grid gap-2 sm:grid-cols-2">
            {GOAL_OPTIONS.map((option) => (
              <OptionTile
                key={option.value}
                type="checkbox"
                name="goals"
                checked={draft.goals.includes(option.value)}
                onChange={() => setDraft({ ...draft, goals: toggle(draft.goals, option.value) })}
              >
                {option.label}
              </OptionTile>
            ))}
          </div>
        </Step>
      ) : null}

      {step === 2 ? (
        <Step legend="Wie sicher bist du mit Kana?">
          {(["hiragana", "katakana"] as const).map((script) => (
            <div key={script} className="mb-4">
              <p className="mb-2 flex items-baseline gap-2 text-sm font-medium">
                {script === "hiragana" ? "Hiragana" : "Katakana"}
                <span lang="ja" className="text-faint">
                  {script === "hiragana" ? "あいうえお" : "アイウエオ"}
                </span>
              </p>
              <div className="grid grid-cols-3 gap-2">
                {KANA_KNOWLEDGE_OPTIONS.map((option) => (
                  <OptionTile
                    key={option.value}
                    type="radio"
                    name={script}
                    checked={draft[script] === option.value}
                    onChange={() => setDraft({ ...draft, [script]: option.value })}
                  >
                    {option.label}
                  </OptionTile>
                ))}
              </div>
            </div>
          ))}
        </Step>
      ) : null}

      {step === 3 ? (
        <Step
          legend="Welche Lernhilfen möchtest du nutzen?"
          description="Du kannst sie jederzeit in den Einstellungen ändern und später reduzieren."
        >
          {AID_OPTIONS.map((option) => (
            <OptionTile
              key={option.value}
              type="checkbox"
              name="aids"
              hint={option.hint}
              checked={draft.aids.includes(option.value)}
              onChange={() => setDraft({ ...draft, aids: toggle(draft.aids, option.value) })}
            >
              {option.label}
            </OptionTile>
          ))}
        </Step>
      ) : null}

      {step === 4 ? (
        <Step
          legend="Wie viel Zeit möchtest du dir täglich nehmen?"
          description="Optional. Dient nur als Orientierung – es gibt keine Strafen für Pausen."
        >
          {DAILY_GOAL_OPTIONS.map((option) => (
            <OptionTile
              key={option.value}
              type="radio"
              name="daily"
              checked={draft.dailyMinutes === option.value}
              onChange={() => setDraft({ ...draft, dailyMinutes: option.value })}
            >
              {option.label}
            </OptionTile>
          ))}
          <OptionTile
            type="radio"
            name="daily"
            checked={draft.dailyMinutes === null}
            onChange={() => setDraft({ ...draft, dailyMinutes: null })}
          >
            Kein festes Ziel
          </OptionTile>
        </Step>
      ) : null}

      <div className="mt-auto flex items-center justify-between gap-4 pt-10">
        {step > 0 ? (
          <Button variant="ghost" onClick={() => setStep(step - 1)}>
            <ArrowLeftIcon size={16} />
            Zurück
          </Button>
        ) : (
          <span />
        )}
        {step < STEP_COUNT - 1 ? (
          <Button onClick={() => setStep(step + 1)} disabled={!canContinue}>
            Weiter
          </Button>
        ) : (
          <Button onClick={finish} disabled={saving || !draft.experience}>
            {saving ? "Wird gespeichert …" : "Fertig"}
          </Button>
        )}
      </div>
    </div>
  );
}
