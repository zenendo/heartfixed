import Link from "next/link";
import { Card } from "@/components/ui/Card";
import type { Guide } from "@/content/guides";

export function GuideCard({ guide }: { guide: Guide }) {
  return (
    <Card className="flex h-full flex-col" data-testid="guide-card">
      <h3 className="text-lg font-semibold">
        <Link
          href={guide.route}
          className="inline-flex min-h-11 items-center text-primary underline"
        >
          {guide.shortTitle}
        </Link>
      </h3>
      <p className="mt-1 text-muted">{guide.summary}</p>
    </Card>
  );
}
