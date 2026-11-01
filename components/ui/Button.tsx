import Link from "next/link";
import type { ComponentProps } from "react";

type Variant = "primary" | "secondary" | "quiet";

// Accent is for calls to action only (Section 8.2). Ink text + ink border keep the
// amber button above the WCAG contrast minimums for both label and boundary.
const variants: Record<Variant, string> = {
  primary: "border-ink bg-accent text-ink hover:bg-accent/90",
  secondary: "border-primary bg-surface text-primary hover:bg-panel",
  quiet: "border-transparent bg-transparent px-0 text-primary underline",
};

const base =
  "inline-flex min-h-11 items-center justify-center rounded-lg border px-5 py-2 text-body font-semibold no-underline transition-colors";

export function ButtonLink({
  variant = "primary",
  className = "",
  ...props
}: ComponentProps<typeof Link> & { variant?: Variant }) {
  return <Link className={`${base} ${variants[variant]} ${className}`} {...props} />;
}

export function Button({
  variant = "primary",
  className = "",
  type = "button",
  ...props
}: ComponentProps<"button"> & { variant?: Variant }) {
  return (
    <button
      type={type}
      className={`${base} ${variants[variant]} disabled:cursor-not-allowed disabled:opacity-60 ${className}`}
      {...props}
    />
  );
}
