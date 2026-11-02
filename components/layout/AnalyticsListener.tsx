"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { routes } from "@/config/site";
import { analyticsEnabled, looksSafe, track, type AnalyticsEvent } from "@/lib/analytics";

/** Checks before sending, so markup that drifts never throws, even in development. */
function send(event: AnalyticsEvent) {
  if (looksSafe(event)) track(event);
}

/**
 * Page views plus the delegated events (Section 16.1), read from data attributes so the
 * server-rendered pages stay server components:
 * - crisis_link_click: any link to the crisis page; placement from the nearest
 *   [data-crisis-placement], or "footer" inside the footer.
 * - guide_tool_click: a link inside [data-guide][data-guide-tool].
 * - affiliate_click / affiliate_slot_view: [data-slot-id] (slots ship disabled).
 */
export function AnalyticsListener() {
  const pathname = usePathname();

  useEffect(() => {
    if (!analyticsEnabled()) return;
    const notFound = document.querySelector("[data-page-not-found]") !== null;
    send({
      name: "page_view",
      params: { page_path: pathname, ...(notFound && { not_found: true }) },
    });
  }, [pathname]);

  useEffect(() => {
    if (!analyticsEnabled()) return;
    function onClick(e: MouseEvent) {
      const link = (e.target as Element | null)?.closest?.("a");
      if (!link) return;
      const href = link.getAttribute("href");
      if (href === routes.crisis) {
        const marked = link
          .closest("[data-crisis-placement]")
          ?.getAttribute("data-crisis-placement");
        const placement = marked ?? (link.closest("footer") ? "footer" : null);
        if (placement) send({ name: "crisis_link_click", params: { placement } } as AnalyticsEvent);
      }
      const guide = link.closest("[data-guide][data-guide-tool]");
      if (guide) {
        send({
          name: "guide_tool_click",
          params: {
            guide: guide.getAttribute("data-guide") ?? "",
            tool: guide.getAttribute("data-guide-tool"),
          },
        } as AnalyticsEvent);
      }
      const slot = link.closest("[data-slot-id]")?.getAttribute("data-slot-id");
      if (slot) send({ name: "affiliate_click", params: { slot_id: slot } });
    }
    document.addEventListener("click", onClick, { capture: true });
    return () => document.removeEventListener("click", onClick, { capture: true });
  }, []);

  useEffect(() => {
    if (!analyticsEnabled() || typeof IntersectionObserver === "undefined") return;
    const seen = new Set<string>();
    const observer = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        const id = entry.target.getAttribute("data-slot-id");
        if (entry.isIntersecting && id && !seen.has(id)) {
          seen.add(id);
          send({ name: "affiliate_slot_view", params: { slot_id: id } });
        }
      }
    });
    document.querySelectorAll("[data-slot-id]").forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [pathname]);

  return null;
}
