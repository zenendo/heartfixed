import { routes } from "@/config/site";

export interface Redirect {
  source: string;
  destination: string;
}

const SECTION_6 = new Set<string>(Object.values(routes));

/**
 * Rules for config/redirects.ts (Section 6: a renamed slug gets a 301, never a silent
 * rename). Returns problems; empty means every redirect is safe to ship.
 */
export function checkRedirects(list: readonly Redirect[]): string[] {
  const problems: string[] = [];
  const sources = new Set<string>();
  for (const { source, destination } of list) {
    if (!/^\/([a-z0-9-]+\/)*$/.test(source)) {
      problems.push(`${source}: source must be a lowercase path ending in "/"`);
    }
    if (SECTION_6.has(source)) problems.push(`${source}: would shadow a live Section 6 route`);
    if (!SECTION_6.has(destination)) {
      problems.push(`${source}: destination ${destination} is not a Section 6 route`);
    }
    if (sources.has(source)) problems.push(`${source}: duplicate source`);
    sources.add(source);
  }
  for (const { source, destination } of list) {
    if (sources.has(destination)) problems.push(`${source}: chains through ${destination}`);
  }
  return problems;
}
