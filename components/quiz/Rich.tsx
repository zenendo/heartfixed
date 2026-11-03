import { Fragment } from "react";

/** Renders the brief's *emphasis* markers as <em>; everything else is plain text. */
export function Rich({ text }: { text: string }) {
  return (
    <>
      {text
        .split(/\*([^*]+)\*/)
        .map((part, i) =>
          i % 2 === 1 ? <em key={i}>{part}</em> : <Fragment key={i}>{part}</Fragment>,
        )}
    </>
  );
}
