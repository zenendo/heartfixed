import path from "node:path";
import { defineConfig } from "vitest/config";

export default defineConfig({
  oxc: { jsx: { runtime: "automatic" } },
  resolve: { alias: { "@": path.resolve(__dirname) } },
  test: {
    include: ["lib/**/__tests__/**/*.test.{ts,tsx}", "tests/unit/**/*.test.{ts,tsx}"],
    environment: "node",
    // Mirrors `trailingSlash: true` in next.config.ts so next/link renders real hrefs.
    env: { __NEXT_TRAILING_SLASH: "true" },
  },
});
