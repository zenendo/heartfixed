import { describe, expect, it } from "vitest";
import { site } from "@/config/site";
import { crisisPage, verifiedInternationalLines } from "@/content/crisis";
import { resourcesPage, type Resource } from "@/content/resources";

/**
 * Founder inputs that must exist before launch (Sections 14.3, 14.4, 19.1, 19.2). Skipped
 * in normal runs, because the build proceeds with placeholders until then. Session 14
 * runs `npm run test:launch`, and launch is blocked until it passes.
 */
describe.runIf(process.env.LAUNCH_CHECK === "1")("launch readiness — founder inputs", () => {
  it("a public contact email is set in config/site.ts", () => {
    expect(site.contactEmail).toMatch(/^[^@\s]+@[^@\s]+\.[^@\s]+$/);
  });

  it("a mailing address for email footers is set in config/site.ts", () => {
    expect(site.mailingAddress.trim().length).toBeGreaterThan(10);
  });

  it("the crisis page lists founder-verified international helplines", () => {
    expect(verifiedInternationalLines(crisisPage.international.lines).length).toBeGreaterThan(0);
  });

  it("every recommended resource has an explicit own-use answer", () => {
    const all: readonly Resource[] = [
      ...resourcesPage.pattern.resources,
      ...resourcesPage.deeper.resources,
    ];
    expect(all.filter((r) => r.ownUse === undefined).map((r) => r.name)).toEqual([]);
  });
});
