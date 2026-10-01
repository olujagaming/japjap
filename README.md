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

**Phase 4 – Real-Life Japanese** ✅

- 10 Situationen mit Schlüsselausdrücken, Wortschatz, kulturellen Hinweisen und Gesprächen;
  Übersicht mit Filtern (Anfänger, Alltag, Reisen, Social) und Fortschritt je Situation
- 15 natürliche Gespräche (höflich und locker) mit 114 Zeilen – jede Zeile mit Audio, Furigana-
  und Übersetzungsschalter, Wort- und Grammatik-Aufschlüsselung und Hinweisen; Wörter öffnen
  einen Vokabel-Drawer mit Lernaktionen
- „Alles abspielen“ mit Hervorhebung der aktuellen Zeile und unterschiedlicher Tonhöhe je Sprecher
- Listening-Modus in sechs Stufen: nur hören (auch langsam, optional automatisch wiederholen) →
  eigene Notizen → Transkript → Furigana → Übersetzung → Aufschlüsselung
- Rollenspiel: Partnerzeilen werden vorgelesen, eigene Antworten auf Japanisch oder in Romaji,
  tolerante Prüfung und nicht-binäre Selbsteinschätzung
- Lernpfade (`/learn`) für Grundlagen, Alltag, Reisen und Kontakte mit Fortschritt und nächster
  empfohlener Einheit
- Verknüpfungen: Gespräche auf Vokabel- und Grammatikseiten, Suche nach Situationen und
  Gesprächen, Gespräche als Favoriten, abgeschlossene Gespräche im Fortschritt

**Phase 5 – Learning Engine** ✅

- Review-Queue über Kana, Vokabeln, Kanji, Grammatik und Gespräche: fällige Inhalte, älteste
  zuerst, Arten gemischt; Session-Größe nach Review-Intensität (10 / 20 / 40)
- Aufgaben, die mit wachsender Sicherheit wechseln: Kana lesen, Bedeutung (Japanisch → Deutsch),
  aktiv abrufen (Deutsch → Japanisch), Hören, Kanji-Bedeutung, Lückensätze zu jeder Grammatik
  (24 Sätze, z. B. 明日東京に___。) und Situationsaufgaben aus den Gesprächen
- Nicht-binäre Prüfung: Tippfehler, Teilbedeutungen und Vokallängen gelten als „fast richtig“,
  freie Formulierungen werden selbst eingeschätzt
- Bewertung Nochmal / Schwer / Gut / Leicht mit Intervall-Vorschau, Vorschlag aus der Prüfung,
  Tastatur 1–4; „Nochmal“ kommt in derselben Session erneut
- Review-Dashboard: fällig heute je Art, Vorschau der nächsten sieben Tage, schwierige Inhalte,
  zuletzt falsch beantwortet, Verlauf
- Startseite: fällige Wiederholungen, „Zuletzt entdeckt“, persönliche Schwierigkeiten;
  Fortschrittsseite mit Listening der letzten 30 Tage

**Phase 6 – AI Conversation** ✅

- Freie Gespräche mit Claude (`/practice/conversation`): Situation, Niveau, Gesprächspartner und
  Höflichkeit wählbar; Einstieg auch direkt von jeder Situationsseite („Frei mit AI üben“)
- Der Partner kennt deinen Wortschatz und deine Grammatik aus dem Fortschritt und passt Satzlänge
  und Vokabular ans Niveau an
- Jede Antwort mit Furigana, Romaji, Übersetzung und Worterklärungen auf Klick, dazu ein Tipp
- Feedback nur auf Abruf: Verständlichkeit, Grammatik, Natürlichkeit, Höflichkeit, kurze deutsche
  Erklärung und natürlichere Alternative
- Strukturierte Ausgaben, doppelt mit Zod validiert; Ablehnungen und abgeschnittene Antworten
  werden als verständliche Fehlermeldung mit „Erneut versuchen“ angezeigt
- Sicherheit: `ANTHROPIC_API_KEY` nur serverseitig (Server Actions), Eingaben validiert,
  Rate-Limit 30 Anfragen / 10 Minuten; mit konfiguriertem Supabase nur für angemeldete Nutzer.
  Ohne Key zeigt die Seite einen Hinweis und verweist auf die geskripteten Rollenspiele.

**Phase 7 – Sprache** ✅

- Spracheingabe per Mikrofon (Web Speech API, ja-JP) im AI-Chat und in den Rollenspielen
- „Nachsprechen“ auf Vokabelseiten und bei Gesprächszeilen: Bewertung, wie gut die Erkennung das
  Gesagte verstanden hat (0–100, mit Hinweis). Das ist ein Erkennungssignal, keine phonetische
  Ausspracheanalyse.
- Buttons erscheinen nur in Browsern mit Spracherkennung (z. B. Chrome, Edge, Safari)
- `SpeechProvider`-Interface mit Erweiterungspunkten für serverseitige Transkription und
  echte Ausspracheanalyse

## Lizenzhinweise

Strichreihenfolge-Daten der Kana stammen aus [KanjiVG](https://kanjivg.tagaini.net)
(© Ulrich Apel, [CC BY-SA 3.0](https://creativecommons.org/licenses/by-sa/3.0/)) und liegen in
`data/stroke-order/`. Aktualisieren mit `pnpm data:strokes`.
