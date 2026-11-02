import { ButtonLink } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { tools, type ToolKey } from "@/config/site";
import { toolBlocks } from "@/content/guides";

/** The tool block every guide ends with (Section 6). */
export function ToolBlock({
  tool,
  heading,
  body,
  className = "",
}: {
  tool: ToolKey;
  heading?: string;
  body?: string;
  className?: string;
}) {
  const copy = toolBlocks[tool];
  const href = tools.find((t) => t.key === tool)!.href;
  return (
    <Card className={`bg-panel ${className}`} data-testid="tool-block" data-tool={tool}>
      <h2 className="text-xl font-semibold">{heading ?? copy.heading}</h2>
      <p className="mt-2">{body ?? copy.body}</p>
      <ButtonLink href={href} className="mt-4">
        {copy.cta}
      </ButtonLink>
    </Card>
  );
}
