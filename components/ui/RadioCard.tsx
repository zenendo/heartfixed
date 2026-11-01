import type { ComponentProps, ReactNode } from "react";

/** A real radio input under card styling (Section 8.3), at least 44px tall. */
export function RadioCard({
  label,
  description,
  className = "",
  ...input
}: Omit<ComponentProps<"input">, "type"> & { label: ReactNode; description?: ReactNode }) {
  return (
    <label
      className={`flex min-h-11 cursor-pointer items-start gap-3 rounded-lg border border-muted bg-surface px-4 py-2.5 has-[:checked]:border-primary has-[:checked]:bg-panel ${className}`}
    >
      <input type="radio" className="mt-1 h-5 w-5 shrink-0 accent-primary" {...input} />
      <span>
        <span className="font-semibold">{label}</span>
        {description && <span className="mt-0.5 block text-sm text-muted">{description}</span>}
      </span>
    </label>
  );
}
