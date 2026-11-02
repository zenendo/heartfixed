import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { GuidePage } from "@/components/content/GuidePage";
import { guides } from "@/config/content";
import { metadataFor } from "@/lib/seo/metadata";

const PREFIX = "/guides/";

/** Guides under /guides/ (Section 6). /no-contact-rule/ has its own route. */
const guideRoutes = guides.map((g) => g.route).filter((route) => route.startsWith(PREFIX));
const routeFor = (slug: string) => `${PREFIX}${slug}/`;

type Params = Promise<{ slug: string }>;

export const dynamicParams = false;

export function generateStaticParams() {
  return guideRoutes.map((route) => ({ slug: route.slice(PREFIX.length, -1) }));
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;
  if (!guideRoutes.includes(routeFor(slug))) notFound();
  return metadataFor(routeFor(slug));
}

export default async function GuideRoute({ params }: { params: Params }) {
  const { slug } = await params;
  if (!guideRoutes.includes(routeFor(slug))) notFound();
  return <GuidePage route={routeFor(slug)} />;
}
