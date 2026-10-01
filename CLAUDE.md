@AGENTS.md

# japjap – Projektregeln

- UI-Sprache ist Deutsch. Japanische Inhalte immer mit `lang="ja"`; nach Möglichkeit `JapaneseText` verwenden.
- Lesehilfen (Furigana/Romaji/Übersetzung) werden per CSS gesteuert – siehe `docs/ARCHITECTURE.md`. Keine Client-State-Lösung dafür einführen.
- Keine Gamification (XP, Herzen, Streak-Druck). Ruhiges, editoriales Design; Farben nur über Tokens in `app/globals.css`.
- Nutzerdaten nur über `UserDataStore`; AI-Code nur serverseitig, Antworten mit Zod validieren.
- Quality Gate vor jedem Commit: `pnpm check` (typecheck, lint, test, build).
