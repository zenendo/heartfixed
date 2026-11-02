import { LegalPage } from "@/components/content/LegalPage";
import { routes } from "@/config/site";
import { privacyPolicy } from "@/content/legal/privacy";
import { metadataFor } from "@/lib/seo/metadata";

export const metadata = metadataFor(routes.privacy);

/** /privacy-policy/ — Section 14.4. */
export default function PrivacyPolicyPage() {
  return <LegalPage doc={privacyPolicy} route={routes.privacy} />;
}
