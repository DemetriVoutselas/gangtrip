"use client";

import { useSyncExternalStore } from "react";

// No-op subscription: this value never changes after mount, so there's
// nothing to subscribe to — we only care about server vs. client snapshot.
function subscribe() {
  return () => {};
}

/**
 * Standard hydration-safety hook: returns false during SSR / the initial
 * client hydration pass, then true on every render after that. Use this
 * (instead of a store-driven flag) to gate any UI that reads persisted /
 * localStorage-backed state, so the gate can never hang on a middleware
 * callback that fails to fire, and without triggering React's
 * "no setState in effect" cascading-render warning.
 */
export function useMounted(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => true,
    () => false
  );
}
