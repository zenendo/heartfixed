/**
 * Fetches lazily loaded modules once the browser is idle, so a later screen renders
 * without a wait but the first paint never queues behind them. Returns a cancel.
 */
export function preloadWhenIdle(loaders: Array<() => Promise<unknown>>): () => void {
  const run = () => loaders.forEach((load) => void load().catch(() => {}));
  if (typeof window.requestIdleCallback === "function") {
    const id = window.requestIdleCallback(run, { timeout: 3000 });
    return () => window.cancelIdleCallback(id);
  }
  const id = window.setTimeout(run, 1500);
  return () => window.clearTimeout(id);
}
