import type { Metadata } from "next";
import { JapaneseText } from "@/components/japanese/japanese-text";
import { KanaOverview } from "@/components/kana/kana-overview";
import { PageHeader, SectionHeader } from "@/components/layout/page-header";
import { ButtonLink } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export const metadata: Metadata = { title: "Kana" };

const SPECIAL_SIGNS = [
  {
    sign: "っ ッ",
    title: "Kleines tsu – Verdopplung",
    text: "Kein eigener Laut: Der folgende Konsonant wird verdoppelt, man macht eine kurze Pause davor.",
    example: {
      japanese: "切手",
      furigana: "切手[きって]",
      reading: "きって",
      romaji: "kitte",
      german: "Briefmarke",
    },
  },
  {
    sign: "ー",
    title: "Langer Vokal in Katakana",
    text: "Der Strich verlängert den vorangehenden Vokal. In Hiragana wird stattdessen ein Vokal angehängt.",
    example: { japanese: "コーヒー", reading: "コーヒー", romaji: "kōhī", german: "Kaffee" },
  },
  {
    sign: "おう えい",
    title: "Lange Vokale in Hiragana",
    text: "う nach o und い nach e verlängern meist den Vokal: おう klingt wie ein langes „o“, えい wie ein langes „e“.",
    example: {
      japanese: "先生",
      furigana: "先生[せんせい]",
      reading: "せんせい",
      romaji: "sensei",
      german: "Lehrer, Lehrerin",
    },
  },
  {
    sign: "ゃ ゅ ょ",
    title: "Kleine ya, yu, yo",
    text: "Klein geschrieben verschmelzen sie mit dem vorigen Zeichen zu einer einzigen Silbe: き + ょ = kyo.",
    example: {
      japanese: "今日",
      furigana: "今日[きょう]",
      reading: "きょう",
      romaji: "kyō",
      german: "heute",
    },
  },
];

export default function KanaPage() {
  return (
    <>
      <PageHeader
        title="Kana"
        ja="かな"
        description="Hiragana und Katakana: zwei Silbenschriften mit je 46 Grundzeichen. Mit ihnen kannst du jedes japanische Wort schreiben – sie sind das Fundament für alles Weitere."
        actions={<ButtonLink href="/kana/practice">Üben</ButtonLink>}
      />
      <KanaOverview />

      <section className="mt-14">
        <SectionHeader
          title="Besondere Zeichen"
          ja="特殊な表記"
          description="Diese Schreibweisen begegnen dir sofort in echten Wörtern."
        />
        <div className="grid gap-3 md:grid-cols-2">
          {SPECIAL_SIGNS.map((item) => (
            <Card key={item.title} className="flex flex-col gap-3">
              <div className="flex items-baseline gap-3">
                <span lang="ja" className="font-jp text-2xl text-fg">
                  {item.sign}
                </span>
                <h3 className="text-sm font-semibold">{item.title}</h3>
              </div>
              <p className="text-sm leading-relaxed text-muted">{item.text}</p>
              <div className="border-t border-line pt-3">
                <JapaneseText {...item.example} size="md" />
              </div>
            </Card>
          ))}
        </div>
      </section>
    </>
  );
}
