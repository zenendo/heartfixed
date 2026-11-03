import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

/**
 * The tracker's and decision tool's later panels load on their own so the first view
 * stays inside the Section 16.3 LCP budget. A static import would pull them back into
 * the page's first-load script without any test failing, so this checks the imports.
 */

const source = (file: string) =>
  readFileSync(path.resolve(__dirname, "../../components/tools", file), "utf8");

const LAZY: Record<string, string[]> = {
  "Tracker.tsx": ["CheckInForm", "ReminderOptIn", "SlipFlow", "StreakCalendar", "EmailSignup"],
  "DecisionTool.tsx": ["DecisionOutcome", "DraftCheck", "UrgeTimer"],
};

describe("tool panels outside the first view load lazily (Section 16.3)", () => {
  for (const [file, modules] of Object.entries(LAZY)) {
    it(`${file} imports ${modules.join(", ")} only dynamically`, () => {
      const text = source(file);
      for (const name of modules) {
        expect(text, name).not.toMatch(new RegExp(`^import[^;]*/${name}";`, "m"));
        expect(text, name).toMatch(new RegExp(`import\\("@/components/[a-z]+/${name}"\\)`));
      }
    });
  }
});
