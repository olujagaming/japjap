import type { ReactNode } from "react";
import { KeyboardShortcuts } from "./keyboard-shortcuts";
import { MobileNavigation } from "./mobile-navigation";
import { MobileTopBar } from "./mobile-top-bar";
import { Sidebar } from "./sidebar";

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-dvh">
      <a
        href="#main"
        className="sr-only z-50 rounded-md bg-accent px-4 py-2 text-accent-fg focus:not-sr-only focus:fixed focus:top-3 focus:left-3"
      >
        Zum Inhalt springen
      </a>
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <MobileTopBar />
        <main
          id="main"
          tabIndex={-1}
          className="mx-auto w-full max-w-6xl flex-1 px-4 pt-6 pb-28 focus:outline-none sm:px-6 lg:px-10 lg:pt-12 lg:pb-16"
        >
          {children}
        </main>
      </div>
      <MobileNavigation />
      <KeyboardShortcuts />
    </div>
  );
}
