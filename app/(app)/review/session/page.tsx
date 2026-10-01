import type { Metadata } from "next";
import { Suspense } from "react";
import { BackLink } from "@/components/layout/back-link";
import { ReviewSession } from "@/components/review/review-session";
import { LoadingState } from "@/components/ui/states";

export const metadata: Metadata = { title: "Review" };

export default function ReviewSessionPage() {
  return (
    <div className="flex flex-col gap-8">
      <BackLink href="/review">Wiederholen</BackLink>
      <Suspense fallback={<LoadingState />}>
        <ReviewSession />
      </Suspense>
    </div>
  );
}
