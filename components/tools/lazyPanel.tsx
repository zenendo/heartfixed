import { Suspense, lazy, type ComponentType } from "react";

/**
 * A panel that loads on its own the first time it renders (Section 16.3 LCP budget),
 * with React's lazy() rather than next/dynamic: the tool pages then carry no loader code
 * of their own, which on these pages decides whether LCP fits the budget.
 */
export function lazyPanel<P extends object>(load: () => Promise<ComponentType<P>>) {
  const Lazy = lazy(() => load().then((Component) => ({ default: Component })));
  function Panel(props: P) {
    return (
      <Suspense fallback={null}>
        <Lazy {...props} />
      </Suspense>
    );
  }
  return Panel;
}
