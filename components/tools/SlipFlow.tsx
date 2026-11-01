"use client";

import { useId, useState, type FormEvent } from "react";
import { Button } from "@/components/ui/Button";
import { RadioCard } from "@/components/ui/RadioCard";
import { trackerCopy } from "@/content/tracker";
import { SLIP_TYPES, type SlipType } from "@/lib/tools/tracker";

const t = trackerCopy.slip;

/** "I broke no contact" — exactly one question, then the counter restarts. */
export function SlipFlow({
  onConfirm,
  onCancel,
}: {
  onConfirm: (type: SlipType) => void;
  onCancel: () => void;
}) {
  const id = useId();
  const [type, setType] = useState<SlipType | null>(null);
  const [error, setError] = useState<string | null>(null);

  function submit(e: FormEvent) {
    e.preventDefault();
    if (!type) return setError(t.chooseError);
    onConfirm(type);
  }

  return (
    <form onSubmit={submit} noValidate className="space-y-4">
      <fieldset aria-describedby={`${id}-help ${id}-error`}>
        <legend>
          <h2 id="slip-heading" tabIndex={-1} className="text-xl font-semibold">
            {t.heading}
          </h2>
        </legend>
        <p id={`${id}-help`} className="mt-1 text-muted">
          {t.help}
        </p>
        <div className="mt-3 grid gap-2">
          {SLIP_TYPES.map((slipType) => (
            <RadioCard
              key={slipType}
              name={`${id}-type`}
              value={slipType}
              checked={type === slipType}
              onChange={() => {
                setType(slipType);
                setError(null);
              }}
              label={t.types[slipType]}
            />
          ))}
        </div>
        <p id={`${id}-error`} aria-live="polite" className="mt-2 font-semibold">
          {error}
        </p>
      </fieldset>
      <div className="flex flex-wrap gap-3">
        <Button type="submit" variant="secondary">
          {t.confirm}
        </Button>
        <Button variant="quiet" onClick={onCancel}>
          {t.cancel}
        </Button>
      </div>
    </form>
  );
}
