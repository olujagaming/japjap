"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

/** Globale Tastenkürzel: Cmd/Ctrl + K öffnet die Suche. */
export function KeyboardShortcuts() {
  const router = useRouter();
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        router.push("/search");
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [router]);
  return null;
}
