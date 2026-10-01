"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Drawer } from "@/components/ui/dialog";
import { MoreIcon } from "@/components/ui/icons";
import { isActivePath, MOBILE_MORE_NAV, MOBILE_NAV } from "@/lib/navigation";
import { cn } from "@/lib/utils";

export function MobileNavigation() {
  const pathname = usePathname();
  const [moreOpen, setMoreOpen] = useState(false);
  const moreActive = MOBILE_MORE_NAV.some((item) => isActivePath(pathname, item.href));

  return (
    <>
      <nav
        aria-label="Hauptnavigation"
        className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-bg/95 pb-[env(safe-area-inset-bottom)] backdrop-blur lg:hidden"
      >
        <ul className="mx-auto grid h-16 max-w-lg grid-cols-5">
          {MOBILE_NAV.map((item) => {
            const active = isActivePath(pathname, item.href);
            const Icon = item.icon;
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "flex h-full flex-col items-center justify-center gap-1 text-[0.7rem] transition-colors",
                    active ? "text-accent" : "text-muted hover:text-fg",
                  )}
                >
                  <Icon size={21} />
                  <span className={active ? "font-medium" : undefined}>{item.label}</span>
                </Link>
              </li>
            );
          })}
          <li>
            <button
              type="button"
              onClick={() => setMoreOpen(true)}
              aria-haspopup="dialog"
              aria-expanded={moreOpen}
              className={cn(
                "flex h-full w-full flex-col items-center justify-center gap-1 text-[0.7rem] transition-colors",
                moreActive ? "text-accent" : "text-muted hover:text-fg",
              )}
            >
              <MoreIcon size={21} />
              <span className={moreActive ? "font-medium" : undefined}>Mehr</span>
            </button>
          </li>
        </ul>
      </nav>

      <Drawer
        side="bottom"
        open={moreOpen}
        onClose={() => setMoreOpen(false)}
        title="Alle Bereiche"
      >
        <ul className="grid grid-cols-2 gap-2 pb-2 sm:grid-cols-3">
          {MOBILE_MORE_NAV.map((item) => {
            const active = isActivePath(pathname, item.href);
            const Icon = item.icon;
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={() => setMoreOpen(false)}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "flex items-center gap-3 rounded-md border px-3 py-3 text-sm",
                    active
                      ? "border-accent/40 bg-accent-soft text-fg"
                      : "border-line text-muted hover:text-fg",
                  )}
                >
                  <Icon size={18} />
                  <span className="flex-1">{item.label}</span>
                  <span lang="ja" aria-hidden="true" className="text-xs text-faint">
                    {item.ja}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </Drawer>
    </>
  );
}
