import "server-only";
import { ClaudeProvider } from "./claude-provider";
import type { AIProvider } from "./types";

let provider: AIProvider | null = null;

export function isAIConfigured(): boolean {
  return Boolean(process.env.ANTHROPIC_API_KEY || process.env.ANTHROPIC_AUTH_TOKEN);
}

/**
 * Liefert den konfigurierten AI-Provider oder `null`, wenn kein Schlüssel hinterlegt ist.
 * Der Schlüssel wird ausschließlich serverseitig gelesen.
 */
export function getAIProvider(): AIProvider | null {
  if (!isAIConfigured()) return null;
  provider ??= new ClaudeProvider();
  return provider;
}
