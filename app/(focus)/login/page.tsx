import type { Metadata } from "next";
import Link from "next/link";
import { ButtonLink } from "@/components/ui/button";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { LoginForm } from "./login-form";

export const metadata: Metadata = { title: "Anmelden" };

export default function LoginPage() {
  const configured = isSupabaseConfigured();
  return (
    <div className="animate-in">
      <p lang="ja" className="mb-2 text-sm tracking-[0.2em] text-faint">
        ようこそ
      </p>
      <h1 className="text-2xl font-semibold tracking-tight">Willkommen bei japjap</h1>
      <p className="mt-2 text-muted">
        Mit einem Konto wird dein Lernfortschritt sicher gespeichert und geräteübergreifend
        synchronisiert.
      </p>

      <div className="mt-8">
        {configured ? (
          <LoginForm />
        ) : (
          <div className="rounded-lg border border-line bg-surface p-5">
            <p className="font-medium">Anmeldung noch nicht eingerichtet</p>
            <p className="mt-1.5 text-sm text-muted">
              In dieser Installation ist kein Supabase-Projekt verbunden. Du kannst trotzdem sofort
              lernen – dein Fortschritt wird dann in diesem Browser gespeichert.
            </p>
            <ButtonLink href="/" className="mt-5">
              Ohne Konto weiterlernen
            </ButtonLink>
          </div>
        )}
      </div>

      {configured ? (
        <p className="mt-8 text-sm text-muted">
          Lieber erst ausprobieren?{" "}
          <Link href="/" className="text-fg underline underline-offset-4">
            Ohne Konto weiterlernen
          </Link>
        </p>
      ) : null}
    </div>
  );
}
