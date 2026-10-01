import "server-only";
import type { AIProvider } from "./types";

/**
 * Liefert den konfigurierten AI-Provider oder `null`, wenn kein Schlüssel hinterlegt ist.
 * Die UI zeigt dann einen erklärenden Hinweis statt einer funktionslosen Oberfläche.
 * Die konkrete Implementierung folgt in Phase 6.
 */
export function getAIProvider(): AIProvider | null {
  // Phase 6: bei gesetztem ANTHROPIC_API_KEY hier den Claude-Provider zurückgeben.
  return null;
}

export function isAIConfigured(): boolean {
  return Boolean(process.env.ANTHROPIC_API_KEY);
}
