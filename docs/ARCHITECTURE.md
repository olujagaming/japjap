# Architektur

## Leitlinien

- **Server first.** Seiten sind Server Components und werden – wo möglich – statisch gerendert.
  Client Components nur dort, wo Interaktion oder Browser-APIs nötig sind (Navigation mit aktivem
  Zustand, Audio, Einstellungen, Formulare).
- **Inhalte ≠ Nutzerdaten.**
  - _Lerninhalte_ (Kana, Vokabeln, Kanji, Grammatik, Situationen, Gespräche) liegen typisiert in
    `data/` und werden zur Build-Zeit gerendert: schnell, offline-fähig, versioniert. Das gleiche
    Schema existiert in Postgres (`supabase/migrations`), ein Seed-Skript überträgt die Daten.
  - _Nutzerdaten_ laufen über das Interface `UserDataStore` (`lib/store/types.ts`): Gastmodus im
    Browser (`LocalUserDataStore`), eingeloggt über Supabase mit RLS.
- **Austauschbare Dienste.** Audio, AI, Sprache und SRS sind Interfaces mit schlanken
  Implementierungen. UI-Code hängt nie direkt an einem Anbieter.

## Lesehilfen ohne Hydration-Mismatch

Furigana, Romaji und Übersetzungen hängen von Nutzereinstellungen ab, die nur der Browser kennt.
Statt sie in React-State zu halten (→ Flackern oder Hydration-Fehler, keine statischen Seiten):

1. Ein Inline-Script im `<head>` (`lib/settings/document.ts`) liest die Einstellungen aus
   `localStorage` und setzt vor dem ersten Paint `data-theme`, `data-furigana`, `data-romaji`,
   `data-translation` und `--jp-scale` auf `<html>`.
2. `globals.css` übersetzt diese Attribute in CSS-Variablen (`--rt-display`, `--romaji-display`,
   `--tr-display` …). Elemente wie `<rt>` oder `.jp-romaji` lesen nur diese Variablen.
3. Komponenten können dieselben Attribute lokal setzen (z. B. `<JapaneseText furiganaMode="off">`) –
   CSS-Variablen erben, der nächste Vorfahr gewinnt.
4. Änderungen in den Einstellungen aktualisieren Store, `localStorage` und `<html>`-Attribute
   gleichzeitig (`lib/settings/store.ts`, via `useSyncExternalStore`).

Das Server-HTML ist dadurch für alle Nutzer identisch und bleibt statisch cachebar.

## Auth & Sicherheit

- `proxy.ts` (Next 16, früher Middleware) erneuert Supabase-Sessions bei jedem Request.
- Server Actions validieren Eingaben mit Zod; der Auth-Callback akzeptiert nur relative Redirects.
- RLS: Inhaltstabellen sind nur lesbar; Nutzertabellen erlauben ausschließlich `auth.uid() = user_id`.
- AI-Schlüssel werden nur in `server-only`-Modulen gelesen (`lib/ai/index.ts`). Modellantworten
  werden mit Zod validiert (`parseAIResponse`), bevor sie die UI erreichen.

## Abhängigkeiten (bewusst wenige)

| Paket                                    | Grund                                                                        |
| ---------------------------------------- | ---------------------------------------------------------------------------- |
| `next`, `react`, `react-dom`             | Framework                                                                    |
| `tailwindcss`                            | Design Tokens + Utilities, CSS-first ohne Config-Datei                       |
| `@supabase/supabase-js`, `@supabase/ssr` | Auth, Datenbank, Cookie-basierte Sessions im App Router                      |
| `zod`                                    | Validierung von Einstellungen, Formularen, gespeicherten Daten, AI-Antworten |
| `clsx`                                   | Klassen-Komposition (≈ 200 B)                                                |
| `server-only`                            | Build-Fehler, falls Server-Code versehentlich im Client landet               |

Bewusst **nicht** verwendet: UI-Kit (Radix/shadcn) – natives `<dialog>` liefert Fokus-Falle,
Esc und Top-Layer; Icon-Library – ~25 eigene SVG-Icons; State-Management-Library –
`useSyncExternalStore` genügt.

## Barrierefreiheit

- Skip-Link, `aria-current` in der Navigation, sichtbare Fokus-Ringe (`:focus-visible`).
- Tabs nach WAI-ARIA-Pattern (Pfeiltasten, Pos1/Ende), Radiogruppen in den Einstellungen.
- Audio-Buttons mit beschreibendem Label („Aussprache anhören: 食べる“) und `aria-pressed`.
- Lernstatus wird zusätzlich über Symbol und Text vermittelt, nie nur über Farbe.
- `lang="ja"` an allen japanischen Inhalten (korrekte Glyphen + Screenreader-Aussprache).
- `prefers-reduced-motion` wird respektiert.
