import { site } from "@/config/site";
import type { Placement, ReminderSettings } from "./validate";

/**
 * Email provider interface — Section 7.1. Resend by default, reached over its REST API
 * with fetch: no SDK, and nothing outside lib/email/ knows which provider is in use.
 *
 * Consent separation (Section 13.1) lives in the shape of this interface: sending an
 * email and subscribing someone are different methods, and the list and reminders are
 * different subscriptions (in Resend, two Topics, each unsubscribable on its own).
 */

export interface OutgoingEmail {
  to: string;
  subject: string;
  html: string;
  text: string;
  /** Category tags only, e.g. "result-email" — never content. */
  tag: string;
  idempotencyKey?: string;
}

export interface EmailProvider {
  readonly name: string;
  /** (a) A one-off transactional email. Never touches any subscription. */
  send(email: OutgoingEmail): Promise<void>;
  /** (b) The email list, with marketing consent. */
  joinList(email: string, placement: Placement): Promise<void>;
  /** (c) Functional streak reminders — a separate consent from the list. */
  enableReminders(email: string, settings: ReminderSettings): Promise<void>;
}

export class ProviderError extends Error {
  override name = "ProviderError";
  constructor(
    message: string,
    readonly status?: number,
  ) {
    super(message);
  }
}

/** Custom contact properties for reminders. Create them in Resend before launch. */
export const REMINDER_PROPERTIES = {
  startDate: "hf_start_date",
  goalDays: "hf_goal_days",
  hour: "hf_reminder_hour",
  timeZone: "hf_time_zone",
} as const;

export interface ResendConfig {
  apiKey: string;
  from: string;
  /** EMAIL_LIST_ID: the Topic for the email list (Section 17.2). */
  listTopicId: string;
  /** EMAIL_REMINDER_TOPIC_ID: the Topic for tracker reminders. */
  reminderTopicId: string;
  fetch?: typeof fetch;
  baseUrl?: string;
}

/**
 * Resend over REST. Contacts are upserted: create with the topic opt-in, and if the
 * contact already exists, update its properties and topics instead. The update
 * fallback's exact behaviour is confirmed in the Session 9 real-inbox QA.
 */
export function resendProvider(config: ResendConfig): EmailProvider {
  const http = config.fetch ?? fetch;
  const base = config.baseUrl ?? "https://api.resend.com";

  async function call(method: string, path: string, body: unknown, idempotencyKey?: string) {
    const res = await http(`${base}${path}`, {
      method,
      headers: {
        Authorization: `Bearer ${config.apiKey}`,
        "Content-Type": "application/json",
        ...(idempotencyKey && { "Idempotency-Key": idempotencyKey }),
      },
      body: JSON.stringify(body),
    });
    if (!res.ok) throw new ProviderError(`Resend ${method} ${path} failed`, res.status);
    return res;
  }

  async function upsertContact(
    email: string,
    topicId: string,
    properties?: Record<string, string | number>,
  ) {
    const topics = [{ id: topicId, subscription: "opt_in" }];
    try {
      await call("POST", "/contacts", {
        email,
        unsubscribed: false,
        topics,
        ...(properties && { properties }),
      });
    } catch (err) {
      // Auth, quota and rate errors are real failures; anything else is most likely
      // "already exists", so fall through to updating the existing contact.
      if (err instanceof ProviderError && [401, 403, 429].includes(err.status ?? 0)) throw err;
      const id = encodeURIComponent(email);
      // Joining again is an explicit choice, so clear a previous global unsubscribe.
      await call("PATCH", `/contacts/${id}`, {
        unsubscribed: false,
        ...(properties && { properties }),
      });
      await call("PATCH", `/contacts/${id}/topics`, { topics });
    }
  }

  return {
    name: "resend",
    async send(email) {
      await call(
        "POST",
        "/emails",
        {
          from: config.from,
          to: [email.to],
          subject: email.subject,
          html: email.html,
          text: email.text,
          tags: [{ name: "category", value: email.tag }],
        },
        email.idempotencyKey,
      );
    },
    async joinList(email) {
      // Placement is an analytics category (Section 16.1); the provider doesn't need it.
      await upsertContact(email, config.listTopicId);
    },
    async enableReminders(email, settings) {
      await upsertContact(email, config.reminderTopicId, {
        [REMINDER_PROPERTIES.startDate]: settings.startDate,
        [REMINDER_PROPERTIES.goalDays]: settings.goalDays,
        [REMINDER_PROPERTIES.hour]: settings.hour,
        [REMINDER_PROPERTIES.timeZone]: settings.timeZone,
      });
    },
  };
}

export type MemoryCall =
  | { kind: "send"; email: OutgoingEmail }
  | { kind: "joinList"; email: string; placement: Placement }
  | { kind: "enableReminders"; email: string; settings: ReminderSettings };

/** Records calls instead of sending. Tests, local development and preview QA only. */
export function memoryProvider(calls: MemoryCall[] = []): EmailProvider & { calls: MemoryCall[] } {
  return {
    name: "memory",
    calls,
    async send(email) {
      calls.push({ kind: "send", email });
    },
    async joinList(email, placement) {
      calls.push({ kind: "joinList", email, placement });
    },
    async enableReminders(email, settings) {
      calls.push({ kind: "enableReminders", email, settings });
    },
  };
}

/**
 * Picks the provider from the environment (Section 17.2). With an API key: Resend. With
 * EMAIL_PROVIDER=memory: the memory provider (Playwright and local work). Otherwise:
 * null, and the endpoint answers `not_configured` rather than pretending to send.
 */
export function providerFromEnv(env: Record<string, string | undefined>): EmailProvider | null {
  if (env.EMAIL_PROVIDER === "memory") return memoryProvider();
  const { EMAIL_PROVIDER_API_KEY, EMAIL_FROM_ADDRESS, EMAIL_LIST_ID, EMAIL_REMINDER_TOPIC_ID } =
    env;
  if (
    !EMAIL_PROVIDER_API_KEY ||
    !EMAIL_FROM_ADDRESS ||
    !EMAIL_LIST_ID ||
    !EMAIL_REMINDER_TOPIC_ID
  ) {
    return null;
  }
  return resendProvider({
    apiKey: EMAIL_PROVIDER_API_KEY,
    from: `${site.name} <${EMAIL_FROM_ADDRESS}>`,
    listTopicId: EMAIL_LIST_ID,
    reminderTopicId: EMAIL_REMINDER_TOPIC_ID,
  });
}
