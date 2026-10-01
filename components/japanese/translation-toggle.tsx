"use client";

import { useId, useState } from "react";
import { TranslateIcon } from "@/components/ui/icons";
import { cn } from "@/lib/utils";

/**
 * Deutsche Übersetzung mit optionalem Aufdecken.
 * Ob der Button oder der Text sichtbar ist, entscheidet CSS anhand von data-translation
 * (always / click / off) – so bleibt das Server-HTML für alle Modi identisch.
 */
export function TranslationToggle({
  german,
  english,
  className,
  textClassName,
}: {
  german: string;
  english?: string;
  className?: string;
  textClassName?: string;
}) {
  const [revealed, setRevealed] = useState(false);
  const id = useId();
  return (
    <div data-revealed={revealed ? "true" : undefined} className={className}>
      <button
        type="button"
        onClick={() => setRevealed((value) => !value)}
        aria-expanded={revealed}
        aria-controls={id}
        className="jp-translation-toggle items-center gap-1.5 rounded text-sm text-muted underline decoration-line-strong underline-offset-4 hover:text-fg"
      >
        <TranslateIcon size={15} />
        {revealed ? "Übersetzung ausblenden" : "Deutsch anzeigen"}
      </button>
      <div id={id} className={cn("jp-translation", textClassName)}>
        <p className="text-fg/85">{german}</p>
        {english ? <p className="mt-0.5 text-sm text-faint">{english}</p> : null}
      </div>
    </div>
  );
}
