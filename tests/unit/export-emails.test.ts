import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { dailyReminder, goalReached } from "@/content/emails/reminders";
import { welcomeSequence } from "@/content/emails/welcome";
import { marketingReasons, renderMarketingEmail } from "@/lib/email/render";

/**
 * `npm run emails:export` — renders the welcome sequence and reminder templates to
 * emails-out/ (git-ignored) as HTML + text, ready to load into the email provider's
 * automations. Skipped in normal runs. It refuses to export without the config mailing
 * address, because every marketing email must carry it (Section 14.4).
 */
describe.runIf(process.env.EXPORT_EMAILS === "1")("export email templates", () => {
  it("writes every template", () => {
    const out = path.resolve(__dirname, "../../emails-out");
    mkdirSync(out, { recursive: true });
    const jobs = [
      ...welcomeSequence.map((t) => ({
        file: `${t.id}-day-${t.sendDay}`,
        email: renderMarketingEmail(t, { reason: marketingReasons.list }),
      })),
      {
        file: "reminder-daily-example-day-12",
        email: renderMarketingEmail(dailyReminder(12, 30), { reason: marketingReasons.reminders }),
      },
      {
        file: "reminder-complete-example-30",
        email: renderMarketingEmail(goalReached(30), { reason: marketingReasons.reminders }),
      },
    ];
    for (const { file, email } of jobs) {
      writeFileSync(path.join(out, `${file}.html`), email.html);
      writeFileSync(path.join(out, `${file}.txt`), `Subject: ${email.subject}\n\n${email.text}`);
    }
    expect(jobs).toHaveLength(welcomeSequence.length + 2);
  });
});
