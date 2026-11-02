import type { Section } from "@/content/guides/types";

/** A legal page: rendered by components/content/LegalPage.tsx with the guide blocks. */
export interface LegalDoc {
  h1: string;
  intro: readonly string[];
  sections: readonly Section[];
}
