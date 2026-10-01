import "server-only";
import { createServerClient } from "@supabase/ssr";
import type { SupabaseClient, User } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import { getSupabaseEnv } from "./env";

/**
 * Server-Client pro Request (Server Components, Server Actions, Route Handlers).
 * `null`, wenn Supabase nicht konfiguriert ist.
 */
export async function createSupabaseServerClient(): Promise<SupabaseClient | null> {
  const env = getSupabaseEnv();
  if (!env) return null;
  const cookieStore = await cookies();
  return createServerClient(env.url, env.anonKey, {
    cookies: {
      getAll: () => cookieStore.getAll(),
      setAll: (cookiesToSet) => {
        try {
          for (const { name, value, options } of cookiesToSet) {
            cookieStore.set(name, value, options);
          }
        } catch {
          // In Server Components sind Cookies schreibgeschützt; das Session-Refresh
          // übernimmt dort der Proxy (proxy.ts).
        }
      },
    },
  });
}

/** Aktueller, vom Auth-Server verifizierter Nutzer – oder null (Gast / nicht konfiguriert). */
export async function getCurrentUser(): Promise<User | null> {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return null;
  const { data } = await supabase.auth.getUser();
  return data.user;
}
