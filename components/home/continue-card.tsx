"use client";

import Link from "next/link";
import { ArrowRightIcon } from "@/components/ui/icons";
import { useLearnerProfile } from "@/hooks/use-user-data";
import { recommendNextStep } from "@/lib/profile";

/** Die eine primäre Handlung auf der Startseite. */
export function ContinueCard() {
  const { data: profile, loading } = useLearnerProfile();
  if (loading) {
    return <div aria-hidden="true" className="h-36 animate-pulse rounded-lg bg-surface-2" />;
  }
  const next = recommendNextStep(profile);
  return (
    <Link
      href={next.href}
      className="group relative block overflow-hidden rounded-lg bg-accent p-6 text-accent-fg transition-colors hover:bg-accent-hover sm:p-8"
    >
      <span
        lang="ja"
        aria-hidden="true"
        className="pointer-events-none absolute -right-2 -bottom-8 font-jp text-[9rem] leading-none opacity-[0.07]"
      >
        続
      </span>
      <p className="text-xs font-medium tracking-[0.18em] uppercase opacity-70">
        {profile ? "Weiterlernen" : "Loslegen"}
      </p>
      <p className="mt-2 text-xl font-semibold tracking-tight sm:text-2xl">{next.title}</p>
      <p className="mt-1.5 max-w-lg text-sm leading-relaxed opacity-80">{next.description}</p>
      <span className="mt-5 inline-flex items-center gap-2 text-sm font-medium">
        {profile ? "Fortsetzen" : "Lernstand festlegen"}
        <ArrowRightIcon size={16} className="transition-transform group-hover:translate-x-0.5" />
      </span>
    </Link>
  );
}
