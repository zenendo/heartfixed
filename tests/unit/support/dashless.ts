/**
 * Brief parity without em dashes — quiz v2 amendment brief, 2.6. The sweep replaced each
 * em dash with a comma, period or colon "as the sentence requires", so shipped text
 * matches a brief line when it is the line word for word with every em dash (and the
 * spaces round it) swapped for one of those, and the next word capitalised or not.
 */
const escape = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const eitherCase = (c: string) => `[${c.toUpperCase()}${c.toLowerCase()}]`;

/** Matches the whole shipped string against a brief line that may hold em dashes. */
export function dashless(brief: string): RegExp {
  const body = brief
    .split(/\s*—\s*/)
    .map((part, i) =>
      i > 0 && /^[a-z]/i.test(part)
        ? eitherCase(part.charAt(0)) + escape(part.slice(1))
        : escape(part),
    )
    .join("[,.:]?\\s+");
  return new RegExp(`^${body}$`);
}

/**
 * True when a shipped line appears in the brief text, allowing any of its commas,
 * periods or colons to have been an em dash there.
 */
export function inBrief(brief: string, shipped: string): boolean {
  // [text, punctuation, text, punctuation, …, text]
  const pieces = shipped.split(/([,.:])\s+/);
  let body = escape(pieces[0]!);
  for (let i = 1; i < pieces.length; i += 2) {
    const next = pieces[i + 1]!;
    const word = /^[a-z]/i.test(next)
      ? eitherCase(next.charAt(0)) + escape(next.slice(1))
      : escape(next);
    body += `(?:${escape(pieces[i]!)}\\s+|\\s*—\\s*)${word}`;
  }
  return new RegExp(body).test(brief);
}
