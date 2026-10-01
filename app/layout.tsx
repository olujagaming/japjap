import type { Metadata, Viewport } from "next";
import { Inter, Noto_Sans_JP } from "next/font/google";
import { settingsBootScript } from "@/lib/settings/document";
import { Providers } from "./providers";
import "./globals.css";

const inter = Inter({
  variable: "--font-ui",
  subsets: ["latin", "latin-ext"],
  display: "swap",
});

const notoSansJp = Noto_Sans_JP({
  variable: "--font-japanese",
  weight: ["400", "500", "700"],
  display: "swap",
  preload: false,
});

export const metadata: Metadata = {
  title: { default: "japjap – Japanisch lernen", template: "%s · japjap" },
  description:
    "Ein ruhiges, persönliches Lernsystem für Japanisch: Kana, Wortschatz, Kanji, echte Alltagssituationen und Hörverstehen – auf Deutsch erklärt.",
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f5f2ea" },
    { media: "(prefers-color-scheme: dark)", color: "#151514" },
  ],
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="de"
      // Theme und Lesehilfen werden vor dem ersten Paint per Script gesetzt.
      suppressHydrationWarning
      data-theme="light"
      data-furigana="always"
      data-romaji="on"
      data-translation="always"
      className={`${inter.variable} ${notoSansJp.variable} antialiased`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: settingsBootScript }} />
      </head>
      <body className="min-h-dvh">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
