import Link from "next/link";
import { SettingsIcon } from "@/components/ui/icons";
import { ThemeToggle } from "./theme-toggle";
import { Wordmark } from "./wordmark";

export function MobileTopBar() {
  return (
    <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-line bg-bg/95 px-4 backdrop-blur lg:hidden">
      <Wordmark />
      <div className="flex items-center gap-1">
        <ThemeToggle />
        <Link
          href="/settings"
          aria-label="Einstellungen"
          className="rounded-md p-2 text-muted hover:bg-surface-2 hover:text-fg"
        >
          <SettingsIcon size={20} />
        </Link>
      </div>
    </header>
  );
}
