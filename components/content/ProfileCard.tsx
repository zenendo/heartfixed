import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { profilePages } from "@/content/attachment-styles";
import { profiles, type ProfileId } from "@/lib/quiz";

/** A profile summary card (Section 7.2) — the hub and the homepage share it. */
export function ProfileCard({ id, linkLabel }: { id: ProfileId; linkLabel: string }) {
  return (
    <Card className="flex h-full flex-col" data-testid="profile-card">
      <h3 className="text-lg font-semibold">{profiles[id].label}</h3>
      <p className="mt-2 flex-1 text-muted">{profilePages[id].summary}</p>
      <Link
        href={profiles[id].route}
        className="mt-3 inline-flex min-h-11 items-center font-semibold text-primary underline"
      >
        {linkLabel}
      </Link>
    </Card>
  );
}
