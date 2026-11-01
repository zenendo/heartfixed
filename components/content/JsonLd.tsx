import { jsonLd } from "@/lib/seo/schema";

export function JsonLd({ data }: { data: unknown }) {
  const html = { __html: jsonLd(data) };
  return <script type="application/ld+json" dangerouslySetInnerHTML={html} />;
}
