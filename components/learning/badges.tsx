import { Badge } from "@/components/ui/badge";
import { DIFFICULTY_META, LEARNING_STATUS_META } from "@/lib/learning-status";
import type { Difficulty, LearningStatus } from "@/types/content";

export function LearningStatusBadge({ status }: { status: LearningStatus }) {
  const meta = LEARNING_STATUS_META[status];
  return (
    <Badge tone={meta.tone}>
      <span aria-hidden="true">{meta.mark}</span>
      {meta.label}
    </Badge>
  );
}

export function DifficultyBadge({ difficulty }: { difficulty: Difficulty }) {
  const meta = DIFFICULTY_META[difficulty];
  return (
    <Badge>
      <span aria-hidden="true" className="flex gap-0.5">
        {[1, 2, 3, 4].map((step) => (
          <span
            key={step}
            className={
              step <= meta.level
                ? "h-2.5 w-1 rounded-sm bg-muted"
                : "h-2.5 w-1 rounded-sm bg-line-strong"
            }
          />
        ))}
      </span>
      {meta.label}
    </Badge>
  );
}
