"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Callout } from "@/components/ui/Callout";
import { decisionCopy } from "@/content/decision";
import type { UnsentVault as Vault } from "@/lib/tools/unsent";

const t = decisionCopy.vault;

function savedWhen(iso: string): string {
  return new Date(iso).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

/**
 * The unsent list and the decision tool's "Your data" panel. Everything shown here is
 * stored only on this device; clearing really deletes it.
 */
export function UnsentVault({
  vault,
  onDelete,
  onClearAll,
}: {
  vault: Vault;
  onDelete: (id: string) => void;
  onClearAll: () => void;
}) {
  const [confirming, setConfirming] = useState(false);

  return (
    <div className="space-y-6">
      {vault.entries.length > 0 && (
        <section aria-labelledby="vault-heading" className="space-y-3">
          <h2 id="vault-heading" className="text-xl font-semibold">
            {t.heading}
          </h2>
          <p className="text-sm text-muted">{t.help}</p>
          <ul className="space-y-3">
            {vault.entries.map((entry) => (
              <li key={entry.id} data-testid="vault-entry" className="rounded-card bg-panel p-4">
                <p className="text-sm text-muted">{t.savedOn(savedWhen(entry.savedAt))}</p>
                <p className="mt-2 whitespace-pre-wrap break-words">{entry.text}</p>
                <Button variant="quiet" className="mt-1" onClick={() => onDelete(entry.id)}>
                  {t.delete}
                </Button>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section
        aria-labelledby="decision-data-heading"
        className="space-y-2 rounded-card bg-panel p-4"
      >
        <h2 id="decision-data-heading" className="font-semibold">
          {decisionCopy.data.heading}
        </h2>
        <p className="text-sm text-muted">{decisionCopy.data.body}</p>
        {confirming ? (
          <Callout tone="warning" className="space-y-3">
            <p className="font-semibold">{t.confirmHeading}</p>
            <p>{t.confirmBody}</p>
            <div className="flex flex-wrap gap-3">
              <Button
                variant="secondary"
                onClick={() => {
                  onClearAll();
                  setConfirming(false);
                }}
              >
                {t.confirmYes}
              </Button>
              <Button variant="secondary" onClick={() => setConfirming(false)}>
                {t.confirmNo}
              </Button>
            </div>
          </Callout>
        ) : (
          <Button variant="quiet" onClick={() => setConfirming(true)}>
            {t.clear}
          </Button>
        )}
      </section>
    </div>
  );
}
