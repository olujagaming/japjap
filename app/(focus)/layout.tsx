import { Wordmark } from "@/components/layout/wordmark";

/** Reduziertes Layout ohne Navigation – für Anmeldung und Onboarding. */
export default function FocusLayout({ children }: LayoutProps<"/">) {
  return (
    <div className="flex min-h-dvh flex-col">
      <header className="px-4 pt-6 sm:px-8">
        <Wordmark />
      </header>
      <main id="main" className="mx-auto flex w-full max-w-xl flex-1 flex-col px-4 py-10 sm:py-16">
        {children}
      </main>
    </div>
  );
}
