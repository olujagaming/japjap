import type { Metadata } from "next";
import { signOut } from "@/app/(focus)/login/actions";
import { PageHeader } from "@/components/layout/page-header";
import { Button, ButtonLink } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { getCurrentUser } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Profil" };

export default async function ProfilePage() {
  const user = await getCurrentUser();
  return (
    <div className="max-w-3xl">
      <PageHeader title="Profil" ja="プロフィール" />
      <div className="flex flex-col gap-4">
        <Card>
          {user ? (
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-muted">Angemeldet als</p>
                <p className="font-medium">{user.email}</p>
              </div>
              <form action={signOut}>
                <Button type="submit" variant="secondary">
                  Abmelden
                </Button>
              </form>
            </div>
          ) : (
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="font-medium">Gastmodus</p>
                <p className="mt-1 text-sm text-muted">
                  Dein Fortschritt wird in diesem Browser gespeichert.
                  {isSupabaseConfigured() ? " Melde dich an, um ihn dauerhaft zu sichern." : ""}
                </p>
              </div>
              {isSupabaseConfigured() ? <ButtonLink href="/login">Anmelden</ButtonLink> : null}
            </div>
          )}
        </Card>
        <Card className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="font-medium">Lernstand</p>
            <p className="mt-1 text-sm text-muted">
              Passe Erfahrung, Ziele und Lernhilfen an – die Empfehlungen ändern sich entsprechend.
            </p>
          </div>
          <ButtonLink href="/onboarding" variant="secondary">
            Lernstand bearbeiten
          </ButtonLink>
        </Card>
      </div>
    </div>
  );
}
