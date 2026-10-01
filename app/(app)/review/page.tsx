import type { Metadata } from "next";
import { PageHeader } from "@/components/layout/page-header";
import { ReviewDashboard } from "@/components/review/review-dashboard";

export const metadata: Metadata = { title: "Wiederholen" };

export default function ReviewPage() {
  return (
    <>
      <PageHeader
        title="Wiederholen"
        ja="復習"
        description="Spaced Repetition: Inhalte kommen kurz bevor du sie vergessen würdest. Wenige Minuten am Tag reichen."
      />
      <ReviewDashboard />
    </>
  );
}
