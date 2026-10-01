"use client";

import { StarIcon } from "@/components/ui/icons";
import { useFavorite } from "@/hooks/use-user-data";
import { cn } from "@/lib/utils";
import type { ContentType } from "@/types/content";

/** Kompakter Merken-Knopf, z. B. für Beispielsätze. */
export function FavoriteButton({
  contentType,
  contentId,
  label,
  className,
}: {
  contentType: ContentType;
  contentId: string;
  label: string;
  className?: string;
}) {
  const { data: active, toggle } = useFavorite(contentType, contentId);
  return (
    <button
      type="button"
      onClick={() => void toggle()}
      aria-pressed={active}
      aria-label={active ? `${label} aus Favoriten entfernen` : `${label} merken`}
      className={cn(
        "inline-flex size-8 items-center justify-center rounded-full text-faint transition-colors hover:bg-surface-2 hover:text-fg",
        active && "text-kohaku",
        className,
      )}
    >
      <StarIcon size={17} className={active ? "fill-kohaku" : undefined} />
    </button>
  );
}
