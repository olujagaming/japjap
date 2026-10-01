import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";
import { getSupabaseEnv } from "./env";

let client: SupabaseClient | null = null;

/** Browser-Client (Singleton). `null`, wenn Supabase nicht konfiguriert ist. */
export function getSupabaseBrowserClient(): SupabaseClient | null {
  const env = getSupabaseEnv();
  if (!env) return null;
  client ??= createBrowserClient(env.url, env.anonKey);
  return client;
}
