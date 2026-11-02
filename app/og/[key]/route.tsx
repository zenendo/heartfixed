import { OG_KEYS, renderOgImage, type OgKey } from "@/lib/seo/og";

/**
 * Open Graph cards at /og/<key>/ — statically generated at build. A route handler
 * rather than the opengraph-image file convention, whose hashed URLs lack the trailing
 * slash and would 308-redirect under `trailingSlash: true`.
 */
export const dynamic = "force-static";
export const dynamicParams = false;

export function generateStaticParams() {
  return OG_KEYS.map((key) => ({ key }));
}

export async function GET(_req: Request, { params }: { params: Promise<{ key: string }> }) {
  const { key } = await params;
  return renderOgImage(key as OgKey);
}
