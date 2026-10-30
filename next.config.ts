import type { NextConfig } from "next";
import { redirects } from "./config/redirects";

const nextConfig: NextConfig = {
  // Section 6 slugs all end in a slash; keep URLs consistent with them.
  trailingSlash: true,
  poweredByHeader: false,
  reactStrictMode: true,
  async redirects() {
    return redirects.map((r) => ({ ...r, permanent: true }));
  },
};

export default nextConfig;
