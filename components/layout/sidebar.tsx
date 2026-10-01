"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { isActivePath, PRIMARY_NAV, SECONDARY_NAV, type NavItem } from "@/lib/navigation";
import { cn } from "@/lib/utils";
import { Wordmark } from "./wordmark";

function SidebarLink({ item, active }: { item: NavItem; active: boolean }) {
  const Icon = item.icon;
  return (
    <Link
      href={item.href}
      aria-current={active ? "page" : undefined}
      className={cn(
        "group relative flex h-9 items-center gap-3 rounded-md px-3 text-sm transition-colors",
        active
          ? "bg-surface-2 font-medium text-fg"
          : "text-muted hover:bg-surface-2/60 hover:text-fg",
      )}
    >
      {active ? (
        <span
          aria-hidden="true"
          className="absolute inset-y-2 left-0 w-0.5 rounded-full bg-accent"
        />
      ) : null}
      <Icon size={18} className={active ? "text-accent" : "text-faint group-hover:text-muted"} />
      <span className="flex-1">{item.label}</span>
      <span
        lang="ja"
        aria-hidden="true"
        className="text-[0.7rem] text-faint opacity-0 transition-opacity group-hover:opacity-100"
      >
        {item.ja}
      </span>
    </Link>
  );
}

export function Sidebar() {
  const pathname = usePathname();
  return (
    <aside className="sticky top-0 hidden h-dvh w-60 shrink-0 flex-col border-r border-line bg-bg lg:flex">
      <div className="px-6 pt-6 pb-8">
        <Wordmark />
      </div>
      <nav aria-label="Hauptnavigation" className="flex-1 overflow-y-auto px-3">
        <ul className="flex flex-col gap-0.5">
          {PRIMARY_NAV.map((item) => (
            <li key={item.href}>
              <SidebarLink item={item} active={isActivePath(pathname, item.href)} />
            </li>
          ))}
        </ul>
      </nav>
      <nav aria-label="Konto und Einstellungen" className="border-t border-line px-3 py-3">
        <ul className="flex flex-col gap-0.5">
          {SECONDARY_NAV.map((item) => (
            <li key={item.href}>
              <SidebarLink item={item} active={isActivePath(pathname, item.href)} />
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
}
