"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import { AudioButton } from "@/components/japanese/audio-button";
import { SearchInput } from "@/components/ui/search-input";
import { EmptyState } from "@/components/ui/states";
import type { SearchGroup, SearchResult } from "@/lib/search";

type SearchModule = typeof import("@/lib/search");

const EXAMPLES = ["essen", "たべる", "eki", "駅", "kaufen", "てもいい", "コーヒー"];

/**
 * Globale Suche. Der Suchindex wird erst beim ersten Aufruf geladen (Lazy Loading);
 * die Anfrage steht in der URL (?q=), damit Ergebnisse teil- und zurücknavigierbar sind.
 */
export function GlobalSearch() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const [query, setQuery] = useState(params.get("q") ?? "");
  const [engine, setEngine] = useState<SearchModule | null>(null);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let cancelled = false;
    import("@/lib/search").then((mod) => !cancelled && setEngine(mod));
    return () => {
      cancelled = true;
    };
  }, []);

  // URL aktualisieren, ohne die History zu fluten
  useEffect(() => {
    const timer = window.setTimeout(() => {
      const q = query.trim();
      router.replace(q ? `${pathname}?q=${encodeURIComponent(q)}` : pathname, { scroll: false });
    }, 250);
    return () => window.clearTimeout(timer);
  }, [query, pathname, router]);

  const trimmed = query.trim();
  const results: SearchResult[] = engine && trimmed ? engine.search(trimmed) : [];
  const groups = engine ? engine.groupResults(results) : [];
  const labels: Record<SearchGroup, string> | null = engine?.SEARCH_GROUP_LABELS ?? null;

  const focusResult = (offset: number) => {
    const links = [
      ...(listRef.current?.querySelectorAll<HTMLAnchorElement>("a[data-result]") ?? []),
    ];
    if (links.length === 0) return;
    const index = links.indexOf(document.activeElement as HTMLAnchorElement);
    const next =
      index === -1
        ? offset > 0
          ? 0
          : links.length - 1
        : (index + offset + links.length) % links.length;
    links[next].focus();
  };

  const onKeyDown = (event: KeyboardEvent) => {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      focusResult(1);
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      focusResult(-1);
    }
  };

  return (
    <div className="flex flex-col gap-8" onKeyDown={onKeyDown}>
      <SearchInput
        label="Alles durchsuchen"
        placeholder="Japanisch, Kana, Romaji oder Deutsch …"
        value={query}
        autoFocus
        onChange={(e) => setQuery(e.target.value)}
        aria-controls="search-results"
      />

      {!trimmed ? (
        <div>
          <p className="mb-3 text-sm text-muted">Zum Beispiel:</p>
          <ul className="flex flex-wrap gap-2">
            {EXAMPLES.map((example) => (
              <li key={example}>
                <button
                  type="button"
                  onClick={() => setQuery(example)}
                  className="h-9 rounded-full border border-line bg-surface px-3.5 text-sm hover:border-line-strong"
                >
                  {example}
                </button>
              </li>
            ))}
          </ul>
          <p className="mt-6 text-xs text-faint">
            Tipp: Mit Cmd/Strg + K öffnest du die Suche von überall. Pfeiltasten wählen Ergebnisse.
          </p>
        </div>
      ) : !engine ? (
        <p role="status" className="text-sm text-muted">
          Suche wird geladen …
        </p>
      ) : groups.length === 0 ? (
        <EmptyState
          ja="？"
          title={`Nichts gefunden für „${trimmed}“.`}
          description="Versuche ein anderes Wort, eine Lesung in Kana oder Romaji ohne Längenstriche."
        />
      ) : (
        <div id="search-results" ref={listRef} className="flex flex-col gap-8" aria-live="polite">
          <p className="sr-only">{results.length} Ergebnisse</p>
          {groups.map(({ group, items }) => (
            <section key={group}>
              <h2 className="mb-2 text-xs font-medium tracking-[0.15em] text-faint uppercase">
                {labels?.[group]}
              </h2>
              <ul className="divide-y divide-line overflow-hidden rounded-lg border border-line bg-surface">
                {items.map((item) => (
                  <li key={item.group + item.id} className="flex items-center gap-2 pr-3">
                    <Link
                      href={item.href}
                      data-result
                      className="flex min-w-0 flex-1 items-baseline gap-4 px-4 py-3 hover:bg-surface-2/50 focus-visible:bg-surface-2/60"
                    >
                      <span
                        lang="ja"
                        className={
                          group === "sentence" ? "font-jp text-base" : "min-w-12 font-jp text-xl"
                        }
                      >
                        {item.japanese}
                      </span>
                      <span className="min-w-0 flex-1 truncate text-sm text-muted">
                        {item.reading && group !== "sentence" ? (
                          <span lang="ja" className="mr-2 font-jp text-faint">
                            {item.reading}
                          </span>
                        ) : null}
                        {item.german}
                      </span>
                    </Link>
                    {group === "vocabulary" || group === "sentence" ? (
                      <AudioButton text={item.reading ?? item.japanese} size="sm" />
                    ) : null}
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
