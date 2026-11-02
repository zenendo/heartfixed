import { LegalPage } from "@/components/content/LegalPage";
import { Callout } from "@/components/ui/Callout";
import { affiliateSlots } from "@/config/affiliates";
import { routes } from "@/config/site";
import { affiliateDisclosurePage as d } from "@/content/legal/affiliate-disclosure";
import { renderableSlot } from "@/lib/affiliates";
import { metadataFor } from "@/lib/seo/metadata";

export const metadata = metadataFor(routes.affiliateDisclosure);

/**
 * /affiliate-disclosure/ — Section 14.5. The status line counts live on-site slots
 * from config, so it is true on the day it's read. Email slots aren't on-site links.
 */
export default function AffiliateDisclosurePage() {
  const live = affiliateSlots.filter(
    (s) => !s.page.startsWith("email:") && renderableSlot(s.id) !== null,
  ).length;
  return (
    <LegalPage doc={d.doc} route={routes.affiliateDisclosure}>
      <Callout className="mt-6" data-testid="affiliate-status">
        <p>{live === 0 ? d.status.none : d.status.some(live)}</p>
      </Callout>
    </LegalPage>
  );
}
