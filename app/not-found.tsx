import { ButtonLink } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/states";

export default function NotFound() {
  return (
    <main className="mx-auto flex min-h-dvh max-w-xl items-center px-4">
      <EmptyState
        className="w-full"
        ja="迷子"
        title="Diese Seite gibt es nicht."
        description="Vielleicht hat sich die Adresse geändert. Über die Suche oder die Startseite findest du weiter."
        action={<ButtonLink href="/">Zur Startseite</ButtonLink>}
      />
    </main>
  );
}
