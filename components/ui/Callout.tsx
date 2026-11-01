import type { ComponentProps } from "react";

type Tone = "info" | "warning" | "success";

const tones: Record<Tone, string> = {
  info: "border-primary bg-panel",
  warning: "border-accent bg-warning",
  success: "border-success bg-panel",
};

/** A calm notice panel. Never red (Section 8.1). */
export function Callout({
  tone = "info",
  className = "",
  ...props
}: ComponentProps<"div"> & { tone?: Tone }) {
  return (
    <div
      className={`rounded-card border-l-4 px-4 py-3 text-ink ${tones[tone]} ${className}`}
      {...props}
    />
  );
}
