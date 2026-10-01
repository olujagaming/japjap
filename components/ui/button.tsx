import Link from "next/link";
import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

type Variant = "primary" | "secondary" | "ghost" | "danger";
type Size = "sm" | "md" | "lg" | "icon";

const base =
  "inline-flex items-center justify-center gap-2 rounded-md font-medium whitespace-nowrap " +
  "transition-[background-color,border-color,color,box-shadow] duration-150 ease-[var(--ease-calm)] " +
  "disabled:pointer-events-none disabled:opacity-45 select-none";

const variants: Record<Variant, string> = {
  primary: "bg-accent text-accent-fg hover:bg-accent-hover",
  secondary: "border border-line-strong bg-surface text-fg hover:border-fg/40 hover:bg-surface-2",
  ghost: "text-muted hover:bg-surface-2 hover:text-fg",
  danger: "border border-akane/40 text-akane hover:bg-akane-soft",
};

const sizes: Record<Size, string> = {
  sm: "h-8 px-3 text-sm",
  md: "h-10 px-4 text-sm",
  lg: "h-12 px-6 text-base",
  icon: "size-10",
};

export type ButtonStyleProps = { variant?: Variant; size?: Size };

export function buttonClasses({ variant = "primary", size = "md" }: ButtonStyleProps = {}) {
  return cn(base, variants[variant], sizes[size]);
}

export function Button({
  variant,
  size,
  className,
  type = "button",
  ...props
}: ComponentProps<"button"> & ButtonStyleProps) {
  return (
    <button type={type} className={cn(buttonClasses({ variant, size }), className)} {...props} />
  );
}

export function ButtonLink({
  variant,
  size,
  className,
  ...props
}: ComponentProps<typeof Link> & ButtonStyleProps) {
  return <Link className={cn(buttonClasses({ variant, size }), className)} {...props} />;
}
