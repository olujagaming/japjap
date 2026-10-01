"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { PlayIcon } from "@/components/ui/icons";
import type { GlyphStrokes } from "@/lib/japanese/stroke-order";

const STEP_MS = 650;

/** Startpunkt eines SVG-Pfads („M x,y …“) für die Strichnummer. */
function startPoint(path: string): [number, number] {
  const match = path.match(/M\s*([\d.]+)[,\s]+([\d.]+)/);
  return match ? [Number(match[1]), Number(match[2])] : [0, 0];
}

/**
 * Animierte Strichreihenfolge. Jeder Strich wird mit stroke-dashoffset „geschrieben“;
 * „Schritt“ zeigt die Striche einzeln, die Nummern markieren den Startpunkt.
 */
export function StrokeOrder({ glyphs, label }: { glyphs: GlyphStrokes[]; label: string }) {
  const total = glyphs.reduce((sum, g) => sum + g.paths.length, 0);
  const [shown, setShown] = useState(total);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    if (!playing) return;
    const timer = window.setInterval(() => {
      setShown((current) => {
        if (current >= total) {
          setPlaying(false);
          return current;
        }
        return current + 1;
      });
    }, STEP_MS);
    return () => window.clearInterval(timer);
  }, [playing, total]);

  const play = () => {
    setShown(0);
    setPlaying(true);
  };

  const step = () => {
    setPlaying(false);
    setShown((current) => (current >= total ? 1 : current + 1));
  };

  // Startindex jeder Glyphe in der Gesamtzählung der Striche
  const starts = glyphs.map((_, i) =>
    glyphs.slice(0, i).reduce((sum, g) => sum + g.paths.length, 0),
  );
  return (
    <div>
      <div
        className="flex flex-wrap gap-3"
        role="img"
        aria-label={`Strichreihenfolge von ${label}: ${total} Striche`}
      >
        {glyphs.map((glyph, glyphIndex) => {
          const first = starts[glyphIndex];
          return (
            <svg
              key={glyph.character + first}
              viewBox="0 0 109 109"
              className="size-40 rounded-md border border-line bg-surface sm:size-48"
              aria-hidden="true"
            >
              <path
                d="M54.5 0v109M0 54.5h109"
                className="stroke-line"
                strokeWidth={0.6}
                strokeDasharray="2 3"
                fill="none"
              />
              {glyph.paths.map((d, index) => {
                const n = first + index + 1;
                const visible = n <= shown;
                const current = n === shown;
                return (
                  <path
                    key={index}
                    d={d}
                    pathLength={1}
                    fill="none"
                    strokeWidth={4}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeDasharray={1}
                    strokeDashoffset={visible ? 0 : 1}
                    className={
                      current && playing ? "stroke-accent" : visible ? "stroke-fg" : "stroke-line"
                    }
                    style={{ transition: `stroke-dashoffset ${STEP_MS - 100}ms ease-out` }}
                  />
                );
              })}
              {glyph.paths.map((d, index) => {
                const n = first + index + 1;
                const [x, y] = startPoint(d);
                return (
                  <text
                    key={`n${index}`}
                    x={Math.max(4, x - 6)}
                    y={Math.max(9, y - 3)}
                    className={n <= shown ? "fill-accent" : "fill-faint"}
                    fontSize={8}
                    fontFamily="var(--font-sans)"
                  >
                    {n}
                  </text>
                );
              })}
            </svg>
          );
        })}
      </div>
      <div className="mt-3 flex items-center gap-2">
        <Button size="sm" variant="secondary" onClick={play} disabled={playing}>
          <PlayIcon size={14} />
          Abspielen
        </Button>
        <Button size="sm" variant="ghost" onClick={step}>
          Schritt {Math.min(shown, total)}/{total}
        </Button>
      </div>
    </div>
  );
}
