"use client";

import { Badge } from "@/components/ui/badge";
import { useDueReviewCount } from "@/hooks/use-user-data";

export function DueBadge() {
  const { data: due, loading } = useDueReviewCount();
  if (loading) return null;
  return (
    <Badge tone={due > 0 ? "accent" : "neutral"}>
      {due > 0 ? `${due} fällig` : "nichts fällig"}
    </Badge>
  );
}
