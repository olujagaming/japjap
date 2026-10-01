import type { ReactNode } from "react";
import { CheckIcon, CloseIcon, InfoIcon } from "@/components/ui/icons";
import type { AnswerVerdict } from "@/lib/japanese/romaji";
import { cn } from "@/lib/utils";

const META: Record<AnswerVerdict, { label: string; className: string; icon: ReactNode }> = {
  correct: {
    label: "Richtig",
    className: "border-matcha/40 bg-matcha-soft/60 text-matcha",
    icon: <CheckIcon size={18} />,
  },
  almost: {
    label: "Fast richtig",
    className: "border-kohaku/40 bg-kohaku-soft/60 text-kohaku",
    icon: <InfoIcon size={18} />,
  },
  incorrect: {
    label: "Noch nicht",
    className: "border-akane/40 bg-akane-soft/60 text-akane",
    icon: <CloseIcon size={18} />,
  },
};

/**
 * Rückmeldung nach einer Antwort. Nicht binär: „fast richtig“ für kleine Abweichungen
 * (z. B. Vokallänge). Wird per aria-live vorgelesen.
 */
export function FeedbackPanel({
  verdict,
  children,
  hint,
}: {
  verdict: AnswerVerdict;
  /** Lösung bzw. natürliche Variante. */
  children?: ReactNode;
  /** Kurze Erklärung. */
  hint?: ReactNode;
}) {
  const meta = META[verdict];
  return (
    <div
      role="status"
      aria-live="polite"
      className="animate-in w-full max-w-md rounded-lg border border-line bg-surface p-4"
    >
      <p
        className={cn(
          "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-sm font-medium",
          meta.className,
        )}
      >
        {meta.icon}
        {meta.label}
      </p>
      {children ? <div className="mt-3">{children}</div> : null}
      {hint ? <p className="mt-2 text-sm leading-relaxed text-muted">{hint}</p> : null}
    </div>
  );
}
