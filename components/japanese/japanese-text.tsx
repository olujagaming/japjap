import type { FuriganaSegment } from "@/lib/japanese/furigana";
import type { FuriganaMode, TranslationMode } from "@/lib/settings/schema";
import { cn } from "@/lib/utils";
import { AudioButton } from "./audio-button";
import { FuriganaText } from "./furigana-text";
import { TranslationToggle } from "./translation-toggle";

export type JapaneseTextSize = "sm" | "md" | "lg" | "xl" | "display";

export type JapaneseTextProps = {
  japanese: string;
  /** Furigana-Segmente oder Notation `食[た]べる`; sonst aus `reading` abgeleitet. */
  furigana?: FuriganaSegment[] | string;
  /** Kana-Lesung des gesamten Ausdrucks. */
  reading?: string;
  romaji?: string;
  german?: string;
  english?: string;
  audioUrl?: string;

  /** Lokale Overrides – ohne Angabe gelten die globalen Einstellungen. */
  furiganaMode?: FuriganaMode;
  romajiVisible?: boolean;
  translationMode?: TranslationMode;

  /** Lesung zusätzlich als eigene Zeile zeigen (z. B. in Wort-Headern). */
  showReading?: boolean;
  /** Für Furigana-Modus „Nur unbekannte Wörter“. */
  known?: boolean;
  /** Audio-Button anzeigen (Aufnahme oder Sprachsynthese). */
  audio?: boolean;
  size?: JapaneseTextSize;
  align?: "start" | "center";
  className?: string;
};

/**
 * Zentrale Darstellung japanischer Inhalte: Japanisch (mit Furigana), Lesung, Romaji,
 * Deutsch und Audio. Server-renderbar; die Lesehilfen werden per CSS-Variablen gesteuert,
 * damit Einstellungen sofort und ohne Hydration-Mismatch greifen.
 */
export function JapaneseText({
  japanese,
  furigana,
  reading,
  romaji,
  german,
  english,
  audioUrl,
  furiganaMode,
  romajiVisible,
  translationMode,
  showReading = false,
  known = false,
  audio = true,
  size = "md",
  align = "start",
  className,
}: JapaneseTextProps) {
  const centered = align === "center";
  return (
    <div
      className={cn("flex flex-col gap-1", centered && "items-center text-center", className)}
      data-furigana={furiganaMode}
      data-romaji={romajiVisible === undefined ? undefined : romajiVisible ? "on" : "off"}
      data-translation={translationMode}
    >
      <div className={cn("flex items-center gap-3", centered && "justify-center")}>
        <p lang="ja" className={cn("jp-text font-jp text-fg", `jp-size-${size}`)}>
          <FuriganaText japanese={japanese} furigana={furigana} reading={reading} known={known} />
        </p>
        {audio ? (
          <AudioButton
            text={reading ?? japanese}
            url={audioUrl}
            label={`Aussprache anhören: ${japanese}`}
            size={size === "sm" ? "sm" : size === "xl" || size === "display" ? "lg" : "md"}
          />
        ) : null}
      </div>
      {showReading && reading && reading !== japanese ? (
        <p lang="ja" className="font-jp text-muted">
          {reading}
        </p>
      ) : null}
      {romaji ? (
        <p lang="ja-Latn" className="jp-romaji text-sm tracking-wide text-muted">
          {romaji}
        </p>
      ) : null}
      {german ? <TranslationToggle german={german} english={english} className="mt-1" /> : null}
    </div>
  );
}
