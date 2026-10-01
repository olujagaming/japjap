"use client";

import { useSyncExternalStore } from "react";

function greetingForHour(hour: number) {
  if (hour >= 4 && hour < 11) return { ja: "おはようございます", de: "Guten Morgen" };
  if (hour >= 11 && hour < 18) return { ja: "こんにちは", de: "Guten Tag" };
  return { ja: "こんばんは", de: "Guten Abend" };
}

const subscribe = () => () => {};

/** Begrüßung nach lokaler Tageszeit (auf dem Server neutral: こんにちは). */
export function Greeting() {
  const hour = useSyncExternalStore(
    subscribe,
    () => new Date().getHours(),
    () => 12,
  );
  const greeting = greetingForHour(hour);
  return (
    <div>
      <h1 lang="ja" className="font-jp text-3xl font-medium tracking-wide text-fg sm:text-4xl">
        {greeting.ja}
      </h1>
      <p className="mt-2 text-sm text-faint">{greeting.de}</p>
    </div>
  );
}
