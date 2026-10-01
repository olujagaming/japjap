import { ContinueCard } from "@/components/home/continue-card";
import { Greeting } from "@/components/home/greeting";
import { LearningOverview } from "@/components/home/learning-overview";
import { ReviewSummary } from "@/components/home/review-summary";
import { JapaneseText } from "@/components/japanese/japanese-text";
import { SectionHeader } from "@/components/layout/page-header";
import { LearningCard } from "@/components/learning/learning-card";
import { Card } from "@/components/ui/card";
import { FIRST_EXPRESSIONS } from "@/data/expressions";

const TODAY = [
  {
    href: "/review",
    title: "Wiederholen",
    ja: "復習",
    description: "Fällige Inhalte kurz auffrischen, bevor sie verblassen.",
  },
  {
    href: "/kana",
    title: "Kana",
    ja: "かな",
    description: "Hiragana und Katakana lesen, hören und schreiben.",
  },
  {
    href: "/situations",
    title: "Situationen",
    ja: "場面",
    description: "Japanisch für Konbini, Café, Bahnhof und mehr.",
  },
  {
    href: "/conversations",
    title: "Gespräche",
    ja: "会話",
    description: "Natürliche Dialoge lesen und zuerst nur hören.",
  },
];

export default function HomePage() {
  return (
    <div className="flex flex-col gap-12 lg:gap-14">
      <header className="flex flex-col gap-3">
        <Greeting />
        <ReviewSummary />
      </header>

      <ContinueCard />

      <section>
        <SectionHeader title="Heute" ja="今日" />
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {TODAY.map((item) => (
            <LearningCard key={item.href} {...item} />
          ))}
        </div>
      </section>

      <section>
        <SectionHeader
          title="Dein Wissen"
          ja="知識"
          description="Was du bereits sicher kannst – ohne Punkte, nur Inhalte."
        />
        <LearningOverview />
      </section>

      <section>
        <SectionHeader
          title="Erste Ausdrücke"
          ja="表現"
          description="Kurze Sätze, die du in Japan jeden Tag hörst."
        />
        <div className="grid gap-3 md:grid-cols-2">
          {FIRST_EXPRESSIONS.map((expression) => (
            <Card key={expression.id} className="flex flex-col gap-3">
              <JapaneseText
                japanese={expression.japanese}
                furigana={expression.furigana}
                reading={expression.reading}
                romaji={expression.romaji}
                german={expression.german}
                size="lg"
              />
              <p className="border-t border-line pt-3 text-sm leading-relaxed text-muted">
                {expression.noteDe}
              </p>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}
