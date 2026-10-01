import type { Metadata } from "next";
import { PageHeader } from "@/components/layout/page-header";
import { ProgressView } from "@/components/progress/progress-view";

export const metadata: Metadata = { title: "Fortschritt" };

export default function ProgressPage() {
  return (
    <>
      <PageHeader
        title="Fortschritt"
        ja="進歩"
        description="Wie dein Wissen wächst – ohne Punkte und Ranglisten."
      />
      <ProgressView />
    </>
  );
}
