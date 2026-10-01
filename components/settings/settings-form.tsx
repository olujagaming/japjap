"use client";

import { useId, type ReactNode } from "react";
import { JapaneseText } from "@/components/japanese/japanese-text";
import { Button } from "@/components/ui/button";
import { useSettings } from "@/hooks/use-settings";
import { AUDIO_SPEEDS, type Settings } from "@/lib/settings/schema";
import { resetSettings } from "@/lib/settings/store";
import { cn } from "@/lib/utils";

type Option<T> = { value: T; label: string };

function Segmented<T extends string | number | boolean>({
  label,
  description,
  value,
  options,
  onChange,
}: {
  label: string;
  description?: string;
  value: T;
  options: Option<T>[];
  onChange: (value: T) => void;
}) {
  const id = useId();
  return (
    <div className="flex flex-col gap-3 py-5 sm:flex-row sm:items-center sm:justify-between sm:gap-8">
      <div className="min-w-0">
        <p id={id} className="text-sm font-medium text-fg">
          {label}
        </p>
        {description ? <p className="mt-0.5 text-sm text-muted">{description}</p> : null}
      </div>
      <div
        role="radiogroup"
        aria-labelledby={id}
        className="inline-flex shrink-0 self-start rounded-md border border-line bg-surface-2 p-0.5 sm:self-auto"
      >
        {options.map((option) => {
          const checked = option.value === value;
          return (
            <button
              key={String(option.value)}
              type="button"
              role="radio"
              aria-checked={checked}
              onClick={() => onChange(option.value)}
              className={cn(
                "h-8 rounded-[5px] px-3 text-sm transition-colors",
                checked ? "bg-surface font-medium text-fg shadow-soft" : "text-muted hover:text-fg",
              )}
            >
              {option.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function Group({ title, ja, children }: { title: string; ja: string; children: ReactNode }) {
  return (
    <section className="rounded-lg border border-line bg-surface px-5">
      <h2 className="flex items-baseline gap-3 border-b border-line py-4 text-base font-semibold">
        {title}
        <span lang="ja" className="text-sm font-normal text-faint">
          {ja}
        </span>
      </h2>
      <div className="divide-y divide-line">{children}</div>
    </section>
  );
}

const onOff: Option<boolean>[] = [
  { value: true, label: "Ein" },
  { value: false, label: "Aus" },
];

export function SettingsForm() {
  const [settings, update] = useSettings();
  const set =
    <K extends keyof Settings>(key: K) =>
    (value: Settings[K]) =>
      update({ [key]: value } as Partial<Settings>);

  return (
    <div className="flex flex-col gap-6">
      <div className="rounded-lg border border-dashed border-line-strong p-5">
        <p className="mb-3 text-xs font-medium tracking-[0.15em] text-faint uppercase">Vorschau</p>
        <JapaneseText
          japanese="寿司を食べます。"
          furigana="寿司[すし]を食[た]べます。"
          reading="すしをたべます。"
          romaji="sushi o tabemasu."
          german="Ich esse Sushi."
          size="lg"
        />
      </div>

      <Group title="Lesehilfen" ja="読み方">
        <Segmented
          label="Furigana"
          description="Lesung in kleiner Schrift über Kanji."
          value={settings.furigana}
          onChange={set("furigana")}
          options={[
            { value: "always", label: "Immer" },
            { value: "unknown", label: "Nur unbekannte" },
            { value: "off", label: "Aus" },
          ]}
        />
        <Segmented
          label="Romaji"
          description="Lateinische Umschrift als Einstiegshilfe – später abschalten."
          value={settings.romaji}
          onChange={set("romaji")}
          options={onOff}
        />
        <Segmented
          label="Deutsche Übersetzung"
          value={settings.translation}
          onChange={set("translation")}
          options={[
            { value: "always", label: "Immer" },
            { value: "click", label: "Auf Klick" },
            { value: "off", label: "Aus" },
          ]}
        />
        <Segmented
          label="Englische Bedeutungen"
          description="Zusätzlich zur deutschen Übersetzung, wo vorhanden."
          value={settings.englishMeanings}
          onChange={set("englishMeanings")}
          options={onOff}
        />
        <Segmented
          label="Schriftgröße Japanisch"
          value={settings.jpFontSize}
          onChange={set("jpFontSize")}
          options={[
            { value: "sm", label: "S" },
            { value: "md", label: "M" },
            { value: "lg", label: "L" },
            { value: "xl", label: "XL" },
          ]}
        />
      </Group>

      <Group title="Audio" ja="音声">
        <Segmented
          label="Automatisch abspielen"
          description="Audio startet beim Öffnen von Wörtern und Sätzen."
          value={settings.audioAutoplay}
          onChange={set("audioAutoplay")}
          options={onOff}
        />
        <Segmented
          label="Geschwindigkeit"
          value={settings.audioSpeed}
          onChange={set("audioSpeed")}
          options={AUDIO_SPEEDS.map((speed) => ({
            value: speed,
            label: `${speed.toLocaleString("de-DE")}×`,
          }))}
        />
        <Segmented
          label="Listening: automatisch wiederholen"
          description="Spielt Hörübungen nach einer kurzen Pause erneut ab."
          value={settings.listeningAutoReplay}
          onChange={set("listeningAutoReplay")}
          options={onOff}
        />
      </Group>

      <Group title="Lernen" ja="学習">
        <Segmented
          label="Niveau"
          description="Bestimmt Empfehlungen und den Schwierigkeitsgrad von Gesprächen."
          value={settings.level}
          onChange={set("level")}
          options={[
            { value: "beginner", label: "Einstieg" },
            { value: "elementary", label: "Grundstufe" },
            { value: "intermediate", label: "Mittel" },
            { value: "advanced", label: "Fortgeschr." },
          ]}
        />
        <Segmented
          label="Review-Intensität"
          description="Wie viele neue Inhalte pro Tag in Wiederholungen aufgenommen werden."
          value={settings.reviewIntensity}
          onChange={set("reviewIntensity")}
          options={[
            { value: "light", label: "Leicht" },
            { value: "normal", label: "Normal" },
            { value: "intensive", label: "Intensiv" },
          ]}
        />
      </Group>

      <Group title="Darstellung" ja="表示">
        <Segmented
          label="Farbschema"
          value={settings.theme}
          onChange={set("theme")}
          options={[
            { value: "system", label: "System" },
            { value: "light", label: "Hell" },
            { value: "dark", label: "Dunkel" },
          ]}
        />
        <div className="py-5 text-sm text-muted">
          Sprache der Oberfläche: <span className="text-fg">Deutsch</span>. Englisch kann oben als
          ergänzende Bedeutung eingeblendet werden.
        </div>
      </Group>

      <div>
        <Button variant="ghost" onClick={() => resetSettings()}>
          Auf Standard zurücksetzen
        </Button>
      </div>
    </div>
  );
}
