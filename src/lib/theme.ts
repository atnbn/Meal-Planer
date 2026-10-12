/**
 * Theme store – tiny framework-agnostic module that owns the colour scheme.
 *
 * - `data-theme` on <html> holds the *resolved* theme (light | dark) and drives the CSS tokens.
 * - `data-theme-preference` holds the user's *choice* (light | dark | system) so UI like the
 *   toggle can render the correct state with pure CSS before React hydrates.
 */

export type ThemePreference = "light" | "dark" | "system";
export type ResolvedTheme = "light" | "dark";

export const THEME_STORAGE_KEY = "theme";
export const THEME_PREFERENCES: readonly ThemePreference[] = ["light", "dark", "system"];

/** Matches --color-canvas in both themes; used for the browser UI (theme-color meta). */
export const THEME_COLORS: Record<ResolvedTheme, string> = {
  light: "#f9f9fd",
  dark: "#0e0e15",
};

const CHANGE_EVENT = "app:themechange";
const DARK_QUERY = "(prefers-color-scheme: dark)";

function isPreference(value: unknown): value is ThemePreference {
  return typeof value === "string" && (THEME_PREFERENCES as readonly string[]).includes(value);
}

export function readPreference(): ThemePreference {
  try {
    const stored = window.localStorage.getItem(THEME_STORAGE_KEY);
    return isPreference(stored) ? stored : "system";
  } catch {
    return "system";
  }
}

export function resolveTheme(preference: ThemePreference): ResolvedTheme {
  if (preference !== "system") return preference;
  return window.matchMedia(DARK_QUERY).matches ? "dark" : "light";
}

export function applyTheme(preference: ThemePreference) {
  const root = document.documentElement;
  const resolved = resolveTheme(preference);
  root.dataset.theme = resolved;
  root.dataset.themePreference = preference;
  root.style.colorScheme = resolved;
  document
    .querySelectorAll<HTMLMetaElement>('meta[name="theme-color"]')
    .forEach((meta) => meta.setAttribute("content", THEME_COLORS[resolved]));
}

export function setThemePreference(preference: ThemePreference) {
  try {
    if (preference === "system") window.localStorage.removeItem(THEME_STORAGE_KEY);
    else window.localStorage.setItem(THEME_STORAGE_KEY, preference);
  } catch {
    // Storage blocked (private mode, quotas) – the choice still applies for this page view.
  }
  applyTheme(preference);
  window.dispatchEvent(new Event(CHANGE_EVENT));
}

/** Notifies on in-app changes, changes from other tabs and OS-level scheme changes. */
export function subscribeTheme(callback: () => void) {
  const media = window.matchMedia(DARK_QUERY);
  const onStorage = (event: StorageEvent) => {
    if (event.key === null || event.key === THEME_STORAGE_KEY) callback();
  };
  window.addEventListener(CHANGE_EVENT, callback);
  window.addEventListener("storage", onStorage);
  media.addEventListener("change", callback);
  return () => {
    window.removeEventListener(CHANGE_EVENT, callback);
    window.removeEventListener("storage", onStorage);
    media.removeEventListener("change", callback);
  };
}

/**
 * Runs synchronously in <head> before first paint (see layout.tsx). Kept dependency-free and
 * ES5-compatible because it executes before any bundle is loaded.
 */
export const themeInitScript = `(function(){try{var d=document.documentElement,p=localStorage.getItem(${JSON.stringify(
  THEME_STORAGE_KEY,
)});if(p!=="light"&&p!=="dark")p="system";var r=p==="system"?(matchMedia(${JSON.stringify(
  DARK_QUERY,
)}).matches?"dark":"light"):p;d.setAttribute("data-theme",r);d.setAttribute("data-theme-preference",p);d.style.colorScheme=r}catch(e){}})()`;
