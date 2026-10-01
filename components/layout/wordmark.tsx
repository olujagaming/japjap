import Link from "next/link";

export function Wordmark() {
  return (
    <Link href="/" className="inline-flex items-baseline gap-2.5" aria-label="japjap – Startseite">
      <span
        lang="ja"
        aria-hidden="true"
        className="grid size-7 place-items-center rounded-[5px] bg-fg text-[0.95rem] leading-none text-bg"
      >
        語
      </span>
      <span className="text-[1.05rem] font-semibold tracking-tight">japjap</span>
    </Link>
  );
}
