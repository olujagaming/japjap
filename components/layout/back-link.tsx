import Link from "next/link";

export function BackLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link href={href} className="inline-flex text-sm text-muted hover:text-fg">
      ← {children}
    </Link>
  );
}
