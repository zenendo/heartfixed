import { renderAppleIcon } from "@/lib/seo/og";

/** Home-screen icon and the Organization schema logo, at /apple-touch-icon/. */
export const dynamic = "force-static";

export function GET() {
  return renderAppleIcon();
}
