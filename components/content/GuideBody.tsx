import Link from "next/link";
import { AffiliateSlot } from "@/components/content/AffiliateSlot";
import { Callout } from "@/components/ui/Callout";
import type { Block } from "@/content/guides/types";

/** Renders guide content blocks (content/guides/types.ts). */
export function GuideBlocks({ blocks }: { blocks: readonly Block[] }) {
  return (
    <>
      {blocks.map((block, i) => {
        if ("p" in block) {
          return (
            <p key={i} className="mt-3">
              {block.p}
            </p>
          );
        }
        if ("list" in block) {
          const List = block.ordered ? "ol" : "ul";
          return (
            <List
              key={i}
              className={`mt-3 space-y-2 pl-6 ${block.ordered ? "list-decimal" : "list-disc"}`}
            >
              {block.list.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </List>
          );
        }
        if ("terms" in block) {
          const List = block.ordered ? "ol" : "ul";
          return (
            <List
              key={i}
              className={`mt-3 space-y-3 pl-6 ${block.ordered ? "list-decimal" : "list-disc"}`}
            >
              {block.terms.map((item) => (
                <li key={item.term}>
                  <strong>{item.term}</strong>
                  {block.ordered ? ". " : ": "}
                  {item.text}
                </li>
              ))}
            </List>
          );
        }
        if ("callout" in block) {
          return (
            <Callout key={i} className="mt-4">
              <p>{block.callout}</p>
            </Callout>
          );
        }
        if ("links" in block) {
          return (
            <ul key={i} className="mt-2">
              {block.links.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="inline-flex min-h-11 items-center font-semibold text-primary underline"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          );
        }
        return <AffiliateSlot key={i} id={block.slot} className="mt-6" />;
      })}
    </>
  );
}
