import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

export type BadgeTone = "neutral" | "accent" | "matcha" | "kohaku" | "akane";

const tones: Record<BadgeTone, string> = {
  neutral: "border-line bg-surface-2 text-muted",
  accent: "border-accent/25 bg-accent-soft text-accent",
  matcha: "border-matcha/25 bg-matcha-soft text-matcha",
  kohaku: "border-kohaku/25 bg-kohaku-soft text-kohaku",
  akane: "border-akane/25 bg-akane-soft text-akane",
};

export function Badge({
  tone = "neutral",
  className,
  ...props
}: ComponentProps<"span"> & { tone?: BadgeTone }) {
  return (
    <span
      className={cn(
        "inline-flex h-6 items-center gap-1.5 rounded-full border px-2.5 text-xs font-medium",
        tones[tone],
        className,
      )}
      {...props}
    />
  );
}
