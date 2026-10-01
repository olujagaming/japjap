export type SupabaseEnv = { url: string; anonKey: string };

/**
 * Supabase ist optional: ohne Konfiguration läuft die App im Gastmodus
 * (Fortschritt im Browser). Alle Supabase-Aufrufer prüfen zuerst diese Funktion.
 */
export function getSupabaseEnv(): SupabaseEnv | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) return null;
  return { url, anonKey };
}

export function isSupabaseConfigured(): boolean {
  return getSupabaseEnv() !== null;
}
