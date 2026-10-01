"use client";

import { KANA, ROW_LABELS } from "@/data/kana";
import { isDifficult } from "@/lib/learning/progress";
import type { ProgressRecord } from "@/lib/store/types";
import type { Kana, KanaGroup, ScriptType } from "@/types/content";
import { KanaCard } from "./kana-card";

const VOWEL_HEADERS = ["a", "i", "u", "e", "o"];
const YOON_HEADERS = ["ya", "yu", "yo"];

function groupRows(kana: Kana[]) {
  const rows = new Map<string, Kana[]>();
  for (const k of kana) rows.set(k.row, [...(rows.get(k.row) ?? []), k]);
  return [...rows.entries()];
}

function Table({
  kana,
  columns,
  headers,
  progress,
  caption,
}: {
  kana: Kana[];
  columns: number;
  headers: string[];
  progress: ReadonlyMap<string, ProgressRecord>;
  caption: string;
}) {
  return (
    <table className="w-full border-separate border-spacing-1.5 sm:border-spacing-2">
      <caption className="sr-only">{caption}</caption>
      <thead>
        <tr>
          <th scope="col" className="w-8 sm:w-10">
            <span className="sr-only">Reihe</span>
          </th>
          {headers.map((h) => (
            <th key={h} scope="col" className="text-xs font-normal text-faint">
              {h}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {groupRows(kana).map(([row, items]) => (
          <tr key={row}>
            <th scope="row" className="pr-1 text-right text-xs font-normal text-faint">
              {row === "vowel" ? "–" : (ROW_LABELS[row] ?? row)}
            </th>
            {Array.from({ length: columns }, (_, column) => {
              const k = items.find((item) => item.column === column);
              const record = k ? progress.get(k.id) : undefined;
              return (
                <td key={column} className="p-0">
                  {k ? (
                    <KanaCard
                      kana={k}
                      status={record?.status}
                      difficult={record ? isDifficult(record) : false}
                    />
                  ) : (
                    <div
                      aria-hidden="true"
                      className="aspect-square rounded-md border border-dashed border-line/60"
                    />
                  )}
                </td>
              );
            })}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

const byGroup = (script: ScriptType, groups: KanaGroup[]) =>
  KANA.filter((k) => k.scriptType === script && groups.includes(k.group));

export function KanaTables({
  script,
  progress,
}: {
  script: ScriptType;
  progress: ReadonlyMap<string, ProgressRecord>;
}) {
  const name = script === "hiragana" ? "Hiragana" : "Katakana";
  const extended = byGroup(script, ["extended"]);
  return (
    <div className="flex flex-col gap-10">
      <section>
        <h3 className="mb-2 text-sm font-medium text-muted">Grundzeichen · 46</h3>
        <div className="max-w-xl">
          <Table
            kana={byGroup(script, ["basic"])}
            columns={5}
            headers={VOWEL_HEADERS}
            progress={progress}
            caption={`${name}: Grundzeichen`}
          />
        </div>
      </section>
      <div className="grid gap-10 xl:grid-cols-2">
        <section>
          <h3 className="mb-1 text-sm font-medium text-muted">Dakuten ゛ und Handakuten ゜</h3>
          <p className="mb-2 text-xs text-faint">
            Zwei Striche machen den Laut stimmhaft (k → g), der Kreis macht aus h ein p.
          </p>
          <div className="max-w-xl">
            <Table
              kana={byGroup(script, ["dakuten", "handakuten"])}
              columns={5}
              headers={VOWEL_HEADERS}
              progress={progress}
              caption={`${name}: Dakuten und Handakuten`}
            />
          </div>
        </section>
        <section>
          <h3 className="mb-1 text-sm font-medium text-muted">Kombinationen (Yōon)</h3>
          <p className="mb-2 text-xs text-faint">
            Ein Zeichen der i-Spalte + kleines ゃ ゅ ょ ergibt eine Silbe.
          </p>
          <div className="max-w-sm">
            <Table
              kana={byGroup(script, ["yoon"])}
              columns={3}
              headers={YOON_HEADERS}
              progress={progress}
              caption={`${name}: Kombinationen`}
            />
          </div>
        </section>
      </div>
      {extended.length > 0 ? (
        <section>
          <h3 className="mb-1 text-sm font-medium text-muted">Erweiterte Katakana</h3>
          <p className="mb-3 text-xs text-faint">
            Für Laute aus Fremdwörtern, die es im Japanischen ursprünglich nicht gibt.
          </p>
          <ul className="grid max-w-3xl grid-cols-5 gap-1.5 sm:grid-cols-8 sm:gap-2">
            {extended.map((k) => {
              const record = progress.get(k.id);
              return (
                <li key={k.id}>
                  <KanaCard
                    kana={k}
                    status={record?.status}
                    difficult={record ? isDifficult(record) : false}
                  />
                </li>
              );
            })}
          </ul>
        </section>
      ) : null}
    </div>
  );
}
