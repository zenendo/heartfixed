import { GuidePage } from "@/components/content/GuidePage";
import { routes } from "@/config/site";
import { metadataFor } from "@/lib/seo/metadata";

export const metadata = metadataFor(routes.noContactRule);

/** /no-contact-rule/ — Guide 1, the situational cluster's hub (Section 12.3). */
export default function NoContactRulePage() {
  return <GuidePage route={routes.noContactRule} />;
}
