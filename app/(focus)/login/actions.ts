"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export type AuthFormState = { status: "idle" | "error" | "success"; message?: string };

const credentialsSchema = z.object({
  email: z.email("Bitte gib eine gültige E-Mail-Adresse ein."),
  password: z.string().min(8, "Das Passwort muss mindestens 8 Zeichen lang sein."),
  mode: z.enum(["signin", "signup"]),
});

const magicLinkSchema = z.object({
  email: z.email("Bitte gib eine gültige E-Mail-Adresse ein."),
});

async function getOrigin() {
  const h = await headers();
  const origin = h.get("origin");
  if (origin) return origin;
  const host = h.get("x-forwarded-host") ?? h.get("host");
  const proto = h.get("x-forwarded-proto") ?? "http";
  return `${proto}://${host}`;
}

const NOT_CONFIGURED: AuthFormState = {
  status: "error",
  message: "Die Anmeldung ist in dieser Installation nicht eingerichtet.",
};

export async function passwordAuth(
  _prev: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const parsed = credentialsSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { status: "error", message: parsed.error.issues[0]?.message };

  const supabase = await createSupabaseServerClient();
  if (!supabase) return NOT_CONFIGURED;

  const { email, password, mode } = parsed.data;
  if (mode === "signup") {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: `${await getOrigin()}/auth/callback?next=/onboarding` },
    });
    if (error) return { status: "error", message: "Die Registrierung ist fehlgeschlagen." };
    return {
      status: "success",
      message:
        "Fast geschafft: Bitte bestätige deine E-Mail-Adresse über den Link in deinem Postfach.",
    };
  }

  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return { status: "error", message: "E-Mail oder Passwort ist nicht korrekt." };
  redirect("/");
}

export async function magicLinkAuth(
  _prev: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const parsed = magicLinkSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { status: "error", message: parsed.error.issues[0]?.message };

  const supabase = await createSupabaseServerClient();
  if (!supabase) return NOT_CONFIGURED;

  const { error } = await supabase.auth.signInWithOtp({
    email: parsed.data.email,
    options: { emailRedirectTo: `${await getOrigin()}/auth/callback` },
  });
  if (error) return { status: "error", message: "Der Link konnte nicht gesendet werden." };
  return { status: "success", message: "Wir haben dir einen Anmeldelink geschickt." };
}

export async function signOut() {
  const supabase = await createSupabaseServerClient();
  await supabase?.auth.signOut();
  redirect("/");
}
