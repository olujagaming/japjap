import Link from "next/link";
import { LEARNING_STATUS_META } from "@/lib/learning-status";
import { cn } from "@/lib/utils";
import type { Kana, LearningStatus } from "@/types/content";

const STATUS_STYLES: Record<LearningStatus, string> = {
  unseen: "border-line bg-surface",
  familiar: "border-line bg-surface",
  learning: "border-kohaku/40 bg-kohaku-soft/50",
  known: "border-accent/30 bg-accent-soft/60",
  mastered: "border-matcha/40 bg-matcha-soft/60",
};

/** Ein Kana in Tabellen und Rastern: Zeichen, Romaji und Lernstatus (Symbol + Farbe + Text für Screenreader). */
export function KanaCard({
  kana,
  status = "unseen",
  showRomaji = true,
  difficult = false,
}: {
  kana: Kana;
  status?: LearningStatus;
  showRomaji?: boolean;
  difficult?: boolean;
}) {
  const meta = LEARNING_STATUS_META[status];
  return (
    <Link
      href={`/kana/${encodeURIComponent(kana.character)}`}
      className={cn(
        "group relative flex aspect-square flex-col items-center justify-center rounded-md border transition-colors hover:border-line-strong",
        STATUS_STYLES[status],
      )}
    >
      <span
        lang="ja"
        className={cn(
          "font-jp leading-none text-fg",
          kana.character.length > 1 ? "text-xl sm:text-2xl" : "text-2xl sm:text-3xl",
        )}
      >
        {kana.character}
      </span>
      {showRomaji ? <span className="mt-1.5 text-xs text-muted">{kana.romaji}</span> : null}
      <span aria-hidden="true" className="absolute top-1 right-1.5 text-[0.6rem] text-faint">
        {status === "unseen" ? "" : meta.mark}
      </span>
      {difficult ? (
        <span aria-hidden="true" className="absolute top-1 left-1.5 text-[0.6rem] text-akane">
          !
        </span>
      ) : null}
      <span className="sr-only">
        {`, ${kana.romaji}, ${meta.label}${difficult ? ", schwierig" : ""}`}
      </span>
    </Link>
  );
}
