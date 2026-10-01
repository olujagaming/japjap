import { toSegments, type FuriganaSegment } from "@/lib/japanese/furigana";

/**
 * Rendert japanischen Text mit <ruby>. Sichtbarkeit der Lesungen steuert CSS
 * (globale Einstellung bzw. data-furigana am nächsten Vorfahren) – kein Client-State nötig.
 */
export function FuriganaText({
  japanese,
  furigana,
  reading,
  known = false,
}: {
  japanese: string;
  /** Segmente oder Notation `食[た]べる`. */
  furigana?: FuriganaSegment[] | string;
  /** Gesamtlesung, aus der Segmente abgeleitet werden, falls `furigana` fehlt. */
  reading?: string;
  /** Bekannte Wörter blenden Furigana im Modus „Nur unbekannte Wörter“ aus. */
  known?: boolean;
}) {
  const segments = toSegments(japanese, furigana, reading);
  return (
    <>
      {segments.map((segment, index) =>
        segment.reading ? (
          <ruby key={index} data-known={known ? "" : undefined}>
            {segment.text}
            <rp>(</rp>
            <rt>{segment.reading}</rt>
            <rp>)</rp>
          </ruby>
        ) : (
          <span key={index}>{segment.text}</span>
        ),
      )}
    </>
  );
}
