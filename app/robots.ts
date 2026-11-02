import type { MetadataRoute } from "next";
import { baseUrl, noindexRoutes } from "@/config/site";

/** Section 12.2: allow all; disallow the API and the results shell; point at the sitemap. */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: "*", allow: "/", disallow: ["/api/", ...noindexRoutes] }],
    sitemap: new URL("/sitemap.xml", baseUrl).toString(),
  };
}
