# japjap

Ein ruhiges, persönliches Lern- und Wissenssystem für Japanisch – für deutschsprachige Lernende.

Statt XP, Herzen und Levelmaps: aktives Erinnern, echte Alltagssituationen, Hörverstehen und ein
wachsendes Netz aus verknüpftem Wissen (Kana → Vokabeln → Kanji → Grammatik → Gespräche).

## Stack

| Bereich      | Wahl                                                   |
| ------------ | ------------------------------------------------------ |
| Framework    | Next.js 16 (App Router), React 19, TypeScript (strict) |
| Styling      | Tailwind CSS 4 (CSS-first Design Tokens)               |
| Daten & Auth | Supabase (PostgreSQL, Auth, RLS) – optional, s. u.     |
| Validierung  | Zod 4                                                  |
| Tests        | Vitest + Testing Library (jsdom)                       |
| Paketmanager | pnpm                                                   |

Begründungen und Architektur: [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md).

## Loslegen

```bash
nvm use            # Node 22
pnpm install
cp .env.example .env.local   # optional – ohne Supabase läuft der Gastmodus
pnpm dev
```

Ohne Supabase-Konfiguration ist die App vollständig nutzbar; Fortschritt und Profil werden dann im
Browser gespeichert. Mit Supabase:

1. Projekt anlegen, `NEXT_PUBLIC_SUPABASE_URL` und `NEXT_PUBLIC_SUPABASE_ANON_KEY` in `.env.local` setzen.
2. Migrationen anwenden: `supabase db push` (oder SQL aus `supabase/migrations/` im SQL-Editor ausführen).
3. In Supabase Auth als Redirect-URL `<deine-domain>/auth/callback` eintragen.

## Scripts

| Befehl           | Zweck                                         |
| ---------------- | --------------------------------------------- |
| `pnpm dev`       | Entwicklungsserver                            |
| `pnpm typecheck` | Routen-Typen generieren + `tsc --noEmit`      |
| `pnpm lint`      | ESLint (Next.js Core Web Vitals + TypeScript) |
| `pnpm test`      | Unit- und Komponententests                    |
| `pnpm build`     | Production Build                              |
| `pnpm check`     | Alles oben nacheinander (Quality Gate)        |
| `pnpm format`    | Prettier                                      |

## Projektstruktur

```
app/                  Routen (App Router)
  (app)/              Seiten mit AppShell (Sidebar / Bottom-Navigation)
  (focus)/            Reduzierte Seiten: Onboarding, Login
  auth/callback/      Supabase-Auth-Callback
components/
  ui/                 Basis-Komponenten (Button, Card, Tabs, Modal, Drawer, States, Icons …)
  layout/             AppShell, Sidebar, MobileNavigation, PageHeader …
  japanese/           JapaneseText, FuriganaText, AudioButton, TranslationToggle
  learning/           LearningCard, ProgressCard, Status- und Schwierigkeits-Badges
data/                 Lerninhalte (typisiert, Single Source of Truth)
hooks/                Client-Hooks (Einstellungen, Nutzerdaten)
lib/
  settings/           Einstellungs-Schema, Store, Boot-Script gegen Flackern
  japanese/           Furigana-Parsing und -Ableitung
  audio/              AudioPlayer-Interface + Browser-Implementierung (Aufnahme / TTS)
  ai/                 AIProvider-Interface + Zod-Schemas für Modellantworten (server-only)
  srs/                Spaced-Repetition-Vertrag
  speech/             SpeechProvider-Interface
  store/              UserDataStore-Interface + Gastmodus-Implementierung
  supabase/           Browser-/Server-Client, Session-Proxy
providers/            React-Provider (Audio)
supabase/migrations/  Datenbankschema inkl. RLS
types/                Domain-Typen
```

## Status

**Phase 0 – Repository** ✅ Next.js-Setup, Tooling (TS strict, ESLint, Prettier, Vitest), CI-Workflow,
Umgebungsvariablen-Vorlage, Dokumentation.

**Phase 1 – Foundation** ✅

- Design Tokens (Sumi, Warm Paper, Aizome, Akane, Matcha, Kohaku, Stone), Hell/Dunkel/System ohne Flackern
- Typografie für Latein (Inter) und Japanisch (Noto Sans JP, System-Fallbacks), `<ruby>`-Furigana
- AppShell: Desktop-Sidebar, mobile Top-Bar + Bottom-Navigation mit „Mehr“-Drawer, Skip-Link, Cmd/Strg + K
- `JapaneseText` mit Furigana / Lesung / Romaji / Deutsch / Audio – global steuerbar, lokal überschreibbar
- Funktionierende Einstellungen (Furigana, Romaji, Übersetzung, Audio, Schriftgröße, Niveau, Theme)
- Funktionierendes Onboarding (5 Schritte) mit abgeleiteten Empfehlungen und Lesehilfen
- Startseite mit Weiterlernen-Karte, Wissensstand und ersten Ausdrücken
- Supabase: Clients, Session-Proxy, Login (Passwort, Registrierung, Magic Link), Callback, Profil, Abmelden
- Vollständiges DB-Schema mit Indizes und RLS (`supabase/migrations/0001_init.sql`)
- Service-Verträge: AudioPlayer, AIProvider (+ validierte Antwort-Schemas), SpeechProvider, SrsScheduler, UserDataStore
- Loading-, Error- und Empty-States; ehrliche Platzhalter für noch folgende Bereiche

**Phase 2 – Kana** ✅

- Vollständige Daten: je 46 Grundzeichen, 20 Dakuten, 5 Handakuten, 33 Yōon für Hiragana und
  Katakana sowie 15 erweiterte Katakana – mit Aussprachehinweisen für Deutschsprachige,
  Beziehungen (Gegenstück, Varianten, Kombinationen) und Verwechslungsgruppen mit Unterscheidungstipps
- Rund 230 Beispielwörter mit Lesung, Romaji und natürlicher deutscher Übersetzung (per Test gegen
  die automatische Umschrift geprüft)
- Kana-Übersicht als Tabellen mit Lernstatus, Fortschritt (x / 46), Problemzeichen und fälligen Zeichen
- Detailseite je Zeichen: Audio, animierte Strichreihenfolge (KanjiVG), Beispielwörter, verwandte
  und verwechselbare Zeichen, Aktionen (Wiederholen, Als bekannt markieren, Schwierigkeit)
- Übungen: Erkennen (Texteingabe), Abrufen, Hören, Wörter lesen, Verwechslungstraining, adaptive
  Mischung; tolerante Romaji-Prüfung (Hepburn/Kunrei, lange Vokale, „fast richtig“)
- SM-2-Scheduler und Lernstatus-Regeln (unseen → familiar → learning → known → mastered)
- Nutzerdaten: Supabase-Implementierung des `UserDataStore` (automatisch bei Anmeldung),
  Übungsverlauf, Migration `0002`
- Fortschrittsseite: Schriftsysteme nach Status, Aktivität der letzten 30 Tage, schwierige Inhalte

**Phase 3 – Knowledge Core** ✅

- 104 Vokabeln, 36 Kanji, 12 Grammatikpunkte und 70 Beispielsätze – alle mit Lesung, Romaji und
  natürlicher deutscher Übersetzung; Romaji, Strichzahlen und Verknüpfungen werden per Test geprüft
- Vokabeln: Ansichten (Alle, Am Lernen, Bekannt, Favoriten), Suche, Filter (JLPT, Wortart,
  Situation, Häufigkeit, Status), seitenweises Nachladen; Detailseite mit Bedeutungen, Hinweisen,
  Kanji, Beispielsätzen und verwandten Wörtern
- Kanji: Raster mit Filtern (JLPT, Schulklasse, Strichzahl, Radikal, Status); Detailseite mit
  On-/Kun-Lesungen, Radikal, Bestandteilen, Merkhilfe, Strichreihenfolge, Wörtern und Sätzen
- Grammatik als Nachschlagewerk, gruppiert nach Verwendung; Detailseite mit Struktur, Beispiel,
  Erklärung, typischen Fehlern, natürlichen Beispielen und ähnlicher Grammatik
- Globale Suche (Kanji, Hiragana, Katakana, Romaji, Deutsch, Englisch), gruppiert, lazy geladen,
  per URL teilbar, mit Pfeiltasten bedienbar
- Lernaktionen für alle Inhalte (Status, Wiederholung, bekannt, Schwierigkeit, Favorit) und
  Favoritenseite inkl. gespeicherter Sätze; Kana-Beispielwörter verlinken auf Vokabeln

**Als Nächstes: Phase 4 – Real-Life Japanese.** Zehn Situationen, 15 Gespräche mit Zeilen-Audio,
Übersetzung, Furigana, Vokabel- und Grammatik-Aufschlüsselung sowie der Listening-Modus.

Danach: Phase 5 SRS & Reviews · Phase 6 AI-Gespräche · Phase 7 Sprache.

## Lizenzhinweise

Strichreihenfolge-Daten der Kana stammen aus [KanjiVG](https://kanjivg.tagaini.net)
(© Ulrich Apel, [CC BY-SA 3.0](https://creativecommons.org/licenses/by-sa/3.0/)) und liegen in
`data/stroke-order/`. Aktualisieren mit `pnpm data:strokes`.
