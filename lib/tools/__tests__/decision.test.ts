// Night-send is local time; pin the zone so the fixtures mean the same thing everywhere.
process.env.TZ = "America/New_York";

import { describe, expect, it } from "vitest";
import {
  BREAKUP_BANDS,
  CONTACT_BANDS,
  PURPOSES,
  checkDraft,
  decide,
  decisionRules,
  isNightSend,
  type DecisionInput,
} from "@/lib/tools/decision";

const DAY = new Date(2026, 9, 31, 14, 0); // 14:00 local
const NIGHT = new Date(2026, 9, 31, 1, 30); // 01:30 local

const CLEAN_DRAFT = "Hi — when works for me to pick up the boxes from your place this week?";
const TWO_PRESSURE = "After everything, you owe me a conversation. When can I get my stuff?";

const DRAFTS = { none: null, clean: CLEAN_DRAFT, pressured: TWO_PRESSURE } as const;
const TIMES = { day: DAY, night: NIGHT } as const;

/** Every combination of inputs, drafts and send times: the decision input space. */
function* inputSpace() {
  for (const sinceBreakup of BREAKUP_BANDS)
    for (const sinceContact of CONTACT_BANDS)
      for (const purpose of PURPOSES)
        for (const alcohol of [false, true])
          for (let intensity = 0; intensity <= 10; intensity++)
            for (const draftedAndDeleted of [false, true])
              for (const [draftName, draft] of Object.entries(DRAFTS))
                for (const [timeName, sentAt] of Object.entries(TIMES)) {
                  const input: DecisionInput = {
                    sinceBreakup,
                    sinceContact,
                    purpose,
                    alcohol,
                    intensity,
                    draftedAndDeleted,
                  };
                  yield { input, draft, sentAt, draftName, timeName };
                }
}

const space = [...inputSpace()];

describe("decision fixtures (Section 16.2)", () => {
  it("covers the whole input space", () => {
    // 3 × 3 × 6 purposes × 2 × 11 intensities × 2 × 3 drafts × 2 times
    expect(space).toHaveLength(14_256);
  });

  it("alcohol = yes forces dont_send for every combination of other inputs", () => {
    const drunk = space.filter((c) => c.input.alcohol);
    expect(drunk.length).toBe(7_128);
    for (const c of drunk) {
      expect(decide(c.input, c.draft, c.sentAt), JSON.stringify(c.input)).toMatchObject({
        outcome: "dont_send",
        ruleId: "forced-alcohol",
      });
    }
  });

  it("intensity ≥ 8 forces dont_send for every combination of other inputs", () => {
    for (const c of space.filter((x) => x.input.intensity >= 8)) {
      expect(decide(c.input, c.draft, c.sentAt).outcome).toBe("dont_send");
    }
  });

  it("intensity 7 is not forced (the edge is ≥ 8)", () => {
    const input: DecisionInput = {
      sinceBreakup: "over-3-months",
      sinceContact: "over-30-days",
      purpose: "logistics",
      alcohol: false,
      intensity: 7,
      draftedAndDeleted: false,
    };
    expect(decide(input, CLEAN_DRAFT, DAY).outcome).toBe("logistics_ok");
    expect(decide({ ...input, intensity: 8 }, CLEAN_DRAFT, DAY).outcome).toBe("dont_send");
  });

  it("logistics + clean state + clean draft is the ONLY path to logistics_ok", () => {
    let reached = 0;
    for (const c of space) {
      const { outcome } = decide(c.input, c.draft, c.sentAt);
      const onlyPath =
        c.input.purpose === "logistics" &&
        !c.input.alcohol &&
        c.input.intensity < 8 &&
        !c.input.draftedAndDeleted &&
        c.draftName === "clean" &&
        c.timeName === "day";
      expect(outcome === "logistics_ok", JSON.stringify(c)).toBe(onlyPath);
      if (onlyPath) reached++;
    }
    expect(reached).toBeGreaterThan(0); // the path exists, not just its absence
  });

  it("a draft containing two listed pressure patterns cannot produce logistics_ok", () => {
    const check = checkDraft(TWO_PRESSURE, DAY);
    expect(check.pressurePhrases).toEqual(["you owe me", "after everything"]);
    for (const c of space.filter((x) => x.draftName === "pressured")) {
      expect(decide(c.input, c.draft, c.sentAt).outcome).not.toBe("logistics_ok");
    }
  });

  it("a 01:30 local timestamp sets the night-send flag", () => {
    expect(isNightSend(NIGHT)).toBe(true);
    expect(checkDraft(CLEAN_DRAFT, NIGHT)).toMatchObject({ nightSend: true, clean: false });
  });
});

describe("rule table order and outcomes (Section 11.2)", () => {
  it("is ordered: forced-wait rules, then logistics eligibility, then the default", () => {
    expect(decisionRules.map((r) => r.id)).toEqual([
      "forced-alcohol",
      "forced-intensity",
      "logistics-clean",
      "logistics-not-yet",
      "closure-clean",
      "default",
    ]);
  });

  it("every outcome is one of the three; nothing ever says 'send it'", () => {
    const outcomes = new Set(space.map((c) => decide(c.input, c.draft, c.sentAt).outcome));
    expect([...outcomes].sort()).toEqual(["dont_send", "logistics_ok", "wait_24h"]);
  });

  const calm: DecisionInput = {
    sinceBreakup: "over-3-months",
    sinceContact: "over-30-days",
    purpose: "apology-closure",
    alcohol: false,
    intensity: 3,
    draftedAndDeleted: false,
  };
  const closure = "I wanted to say I'm sorry for how I handled the end. I hope you're well.";

  it("closure/apology with a clean draft, not too soon → wait 24 hours", () => {
    expect(decide(calm, closure, DAY)).toMatchObject({
      outcome: "wait_24h",
      ruleId: "closure-clean",
    });
  });

  it("closure/apology too soon (contact < 7 days or breakup < 14 days) → don't send", () => {
    expect(decide({ ...calm, sinceContact: "under-7-days" }, closure, DAY).outcome).toBe(
      "dont_send",
    );
    expect(decide({ ...calm, sinceBreakup: "under-14-days" }, closure, DAY).outcome).toBe(
      "dont_send",
    );
  });

  it("closure/apology without a draft, or with a flagged one → don't send", () => {
    expect(decide(calm, null, DAY).outcome).toBe("dont_send");
    expect(decide(calm, closure, NIGHT).outcome).toBe("dont_send");
  });

  it.each(["miss-them", "want-them-back", "upset-by-them", "no-reason"] as const)(
    "%s → don't send, even calm with a clean draft",
    (purpose) => {
      expect(decide({ ...calm, purpose }, CLEAN_DRAFT, DAY).outcome).toBe("dont_send");
    },
  );

  it("logistics without a draft, with a flagged draft, or drafted-and-deleted → wait 24 hours", () => {
    const logistics = { ...calm, purpose: "logistics" as const };
    expect(decide(logistics, null, DAY).outcome).toBe("wait_24h");
    expect(decide(logistics, TWO_PRESSURE, DAY).outcome).toBe("wait_24h");
    expect(decide({ ...logistics, draftedAndDeleted: true }, CLEAN_DRAFT, DAY).outcome).toBe(
      "wait_24h",
    );
  });

  it("treats a whitespace-only draft as no draft", () => {
    expect(decide({ ...calm, purpose: "logistics" }, "   \n ", DAY).draft).toBeNull();
  });

  it("rejects out-of-range input", () => {
    expect(() => decide({ ...calm, intensity: 11 }, null, DAY)).toThrow();
    expect(() => decide({ ...calm, intensity: 2.5 }, null, DAY)).toThrow();
  });
});

describe("draft check observations (Section 11.2, step 4)", () => {
  it("flags length over 600 characters", () => {
    expect(checkDraft("a".repeat(600), DAY).tooLong).toBe(false);
    expect(checkDraft("a".repeat(601), DAY).tooLong).toBe(true);
  });

  it("counts question marks and flags more than two", () => {
    expect(checkDraft("Why? How? When?", DAY)).toMatchObject({
      questionMarks: 3,
      manyQuestions: true,
    });
    expect(checkDraft("When works?", DAY)).toMatchObject({
      questionMarks: 1,
      manyQuestions: false,
    });
  });

  it("flags apologies stacked more than twice", () => {
    expect(checkDraft("Sorry. I'm sorry. I apologise.", DAY).stackedApologies).toBe(true);
    expect(checkDraft("Sorry, I'm so sorry.", DAY).stackedApologies).toBe(false);
  });

  it("detects ultimatums", () => {
    expect(checkDraft("If you don't reply tonight, that's it.", DAY).ultimatums).toEqual([
      "if you don't",
    ]);
  });

  it("matches phrases case-insensitively, across curly quotes and line breaks", () => {
    expect(checkDraft("JUST\nREPLY please", DAY).pressurePhrases).toEqual(["just reply"]);
    expect(checkDraft("If you don’t answer", DAY).ultimatums).toEqual(["if you don't"]);
  });

  it("matches whole phrases only", () => {
    expect(checkDraft("I'll just replyguy this", DAY).pressurePhrases).toEqual([]);
  });

  it("night-send covers 23:00–04:59 local and nothing else", () => {
    const at = (h: number, m = 0) => isNightSend(new Date(2026, 9, 31, h, m));
    expect([at(22, 59), at(23), at(0), at(4, 59), at(5), at(12)]).toEqual([
      false,
      true,
      true,
      true,
      false,
      false,
    ]);
  });

  it("returns flags and counts only — never the draft text", () => {
    const secret = "Remember the lake house? You owe me.";
    const result = JSON.stringify(
      decide(
        {
          sinceBreakup: "over-3-months",
          sinceContact: "over-30-days",
          purpose: "logistics",
          alcohol: false,
          intensity: 2,
          draftedAndDeleted: false,
        },
        secret,
        DAY,
      ),
    );
    expect(result).not.toContain("lake house");
    expect(result).not.toContain(secret);
  });
});
