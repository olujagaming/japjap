import { cn } from "@/lib/utils";

export function ProgressBar({
  value,
  max,
  label,
  className,
}: {
  value: number;
  max: number;
  /** Zugänglicher Name, z. B. „Hiragana“. */
  label: string;
  className?: string;
}) {
  const ratio = max > 0 ? Math.min(1, Math.max(0, value / max)) : 0;
  return (
    <div
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={max}
      aria-valuenow={value}
      aria-valuetext={`${value} von ${max}`}
      className={cn("h-1 w-full overflow-hidden rounded-full bg-surface-2", className)}
    >
      <div
        className="h-full rounded-full bg-accent transition-[width] duration-500 ease-[var(--ease-calm)]"
        style={{ width: `${ratio * 100}%` }}
      />
    </div>
  );
}
