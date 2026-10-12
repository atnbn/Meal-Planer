"use client";

import { useLayoutEffect } from "react";

import { applyTheme, readPreference, subscribeTheme } from "@/lib/theme";

/**
 * Keeps <html data-theme> in sync after hydration:
 * - re-applies the stored theme when React's dev Strict Mode remount strips the attributes the
 *   inline script set (no-op in production),
 * - follows OS scheme changes while the preference is "system",
 * - mirrors theme changes made in other tabs.
 */
export function ThemeSync() {
  useLayoutEffect(() => {
    const sync = () => applyTheme(readPreference());
    sync();
    return subscribeTheme(sync);
  }, []);

  return null;
}
