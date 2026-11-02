import { LegalPage } from "@/components/content/LegalPage";
import { routes } from "@/config/site";
import { termsOfUse } from "@/content/legal/terms";
import { metadataFor } from "@/lib/seo/metadata";

export const metadata = metadataFor(routes.terms);

/** /terms/ — Section 14.4. */
export default function TermsPage() {
  return <LegalPage doc={termsOfUse} route={routes.terms} />;
}
