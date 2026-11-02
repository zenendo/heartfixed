import { baseUrl } from "@/config/site";
import type { CollectRequest } from "@/lib/analyticsSchema";

/**
 * Server half of Section 16.1: forwards already-validated events to GA4's Measurement
 * Protocol. Booleans become "true"/"false"; page paths become absolute page_location.
 * Requires NEXT_PUBLIC_GA_MEASUREMENT_ID and the server-only GA4_API_SECRET; without
 * both, events are dropped (nothing is stored here — there is no database).
 */
export interface Ga4Config {
  measurementId: string;
  apiSecret: string;
  fetch?: typeof fetch;
}

export function ga4ConfigFromEnv(env: Record<string, string | undefined>): Ga4Config | null {
  const measurementId = env.NEXT_PUBLIC_GA_MEASUREMENT_ID;
  const apiSecret = env.GA4_API_SECRET;
  return measurementId && apiSecret ? { measurementId, apiSecret } : null;
}

export function toMeasurementProtocol(req: CollectRequest) {
  return {
    client_id: req.client_id,
    events: req.events.map((event) => {
      const params: Record<string, string | number> = {
        session_id: req.session_id,
        engagement_time_msec: 1,
      };
      for (const [key, value] of Object.entries(event.params)) {
        if (key === "page_path") params.page_location = new URL(String(value), baseUrl).toString();
        else params[key] = typeof value === "boolean" ? String(value) : (value as string | number);
      }
      return { name: event.name, params };
    }),
  };
}

export async function forwardToGa4(req: CollectRequest, config: Ga4Config): Promise<void> {
  const http = config.fetch ?? fetch;
  const url = new URL("https://www.google-analytics.com/mp/collect");
  url.searchParams.set("measurement_id", config.measurementId);
  url.searchParams.set("api_secret", config.apiSecret);
  await http(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(toMeasurementProtocol(req)),
    signal: AbortSignal.timeout(2000),
  });
}
