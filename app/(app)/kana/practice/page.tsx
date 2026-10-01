import type { Metadata } from "next";
import { Suspense } from "react";
import { KanaPractice } from "@/components/kana/kana-practice";
import { PageHeader } from "@/components/layout/page-header";
import { LoadingState } from "@/components/ui/states";

export const metadata: Metadata = { title: "Kana üben" };

export default function KanaPracticePage() {
  return (
    <>
      <PageHeader
        title="Kana üben"
        ja="練習"
        description="Kurze Runden, die sich an dir orientieren: Zeichen, die dir schwerfallen, kommen öfter. Jede Antwort fließt in deine Wiederholungen ein."
      />
      <Suspense fallback={<LoadingState />}>
        <KanaPractice />
      </Suspense>
    </>
  );
}
