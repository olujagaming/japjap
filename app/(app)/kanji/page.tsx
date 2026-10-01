import type { Metadata } from "next";
import { KanjiBrowser } from "@/components/kanji/kanji-browser";
import { PageHeader } from "@/components/layout/page-header";

export const metadata: Metadata = { title: "Kanji" };

export default function KanjiPage() {
  return (
    <>
      <PageHeader
        title="Kanji"
        ja="漢字"
        description="Schriftzeichen mit Bedeutung. Jedes Kanji ist mit den Wörtern verknüpft, in denen es vorkommt – so lernst du sie im Zusammenhang statt isoliert."
      />
      <KanjiBrowser />
    </>
  );
}
