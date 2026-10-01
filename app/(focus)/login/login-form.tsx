"use client";

import { useActionState, useState } from "react";
import { Button } from "@/components/ui/button";
import { Tabs } from "@/components/ui/tabs";
import { magicLinkAuth, passwordAuth, type AuthFormState } from "./actions";

const initial: AuthFormState = { status: "idle" };

const inputClass =
  "h-11 w-full rounded-md border border-line bg-surface px-3 text-base text-fg placeholder:text-faint focus:border-accent/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/25";

function FormMessage({ state }: { state: AuthFormState }) {
  if (state.status === "idle" || !state.message) return null;
  return (
    <p
      role={state.status === "error" ? "alert" : "status"}
      className={state.status === "error" ? "text-sm text-akane" : "text-sm text-matcha"}
    >
      {state.message}
    </p>
  );
}

function Field({ label, ...props }: { label: string } & React.ComponentProps<"input">) {
  return (
    <label className="flex flex-col gap-1.5 text-sm font-medium">
      {label}
      <input className={inputClass} {...props} />
    </label>
  );
}

export function LoginForm() {
  const [tab, setTab] = useState<"signin" | "signup" | "magic">("signin");
  const [passwordState, passwordAction, passwordPending] = useActionState(passwordAuth, initial);
  const [magicState, magicAction, magicPending] = useActionState(magicLinkAuth, initial);

  return (
    <Tabs
      label="Anmeldeart"
      value={tab}
      onChange={setTab}
      items={[
        { value: "signin", label: "Anmelden" },
        { value: "signup", label: "Registrieren" },
        { value: "magic", label: "Per E-Mail-Link" },
      ]}
    >
      {tab === "magic" ? (
        <form action={magicAction} className="flex flex-col gap-4">
          <Field label="E-Mail" name="email" type="email" autoComplete="email" required />
          <FormMessage state={magicState} />
          <Button type="submit" disabled={magicPending}>
            {magicPending ? "Wird gesendet …" : "Anmeldelink senden"}
          </Button>
        </form>
      ) : (
        <form action={passwordAction} className="flex flex-col gap-4">
          <input type="hidden" name="mode" value={tab} />
          <Field label="E-Mail" name="email" type="email" autoComplete="email" required />
          <Field
            label="Passwort"
            name="password"
            type="password"
            minLength={8}
            autoComplete={tab === "signup" ? "new-password" : "current-password"}
            required
          />
          <FormMessage state={passwordState} />
          <Button type="submit" disabled={passwordPending}>
            {passwordPending ? "Bitte warten …" : tab === "signup" ? "Konto erstellen" : "Anmelden"}
          </Button>
        </form>
      )}
    </Tabs>
  );
}
