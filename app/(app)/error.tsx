"use client";

import { Button } from "@/components/ui/button";
import { ErrorState } from "@/components/ui/states";

export default function AppError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <ErrorState
      action={
        <Button variant="secondary" onClick={reset}>
          Erneut versuchen
        </Button>
      }
    />
  );
}
