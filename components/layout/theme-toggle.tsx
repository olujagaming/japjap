"use client";

import { MoonIcon, SunIcon } from "@/components/ui/icons";
import { useSettings } from "@/hooks/use-settings";

/**
 * Schaltet schnell zwischen Hell und Dunkel. Das gerenderte Icon richtet sich per CSS
 * nach dem tatsächlich aktiven Theme (data-theme), damit kein Hydration-Mismatch entsteht.
 */
export function ThemeToggle() {
  const [, update] = useSettings();
  const toggle = () => {
    const isDark = document.documentElement.dataset.theme === "dark";
    update({ theme: isDark ? "light" : "dark" });
  };
  return (
    <button
      type="button"
      onClick={toggle}
      aria-label="Hell- oder Dunkelmodus umschalten"
      className="rounded-md p-2 text-muted hover:bg-surface-2 hover:text-fg"
    >
      <MoonIcon size={20} className="dark:hidden" />
      <SunIcon size={20} className="hidden dark:block" />
    </button>
  );
}
