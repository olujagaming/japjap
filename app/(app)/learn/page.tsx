import type { Metadata } from "next";
import { LearningPaths } from "@/components/learn/learning-paths";
import { PageHeader } from "@/components/layout/page-header";

export const metadata: Metadata = { title: "Lernen" };

export default function LearnPage() {
  return (
    <>
      <PageHeader
        title="Lernen"
        ja="学ぶ"
        description="Geführte Lernpfade als Orientierung – kein starrer Kurs. Jede Einheit ist jederzeit direkt erreichbar, und dein Fortschritt zählt überall mit."
      />
      <LearningPaths />
    </>
  );
}
