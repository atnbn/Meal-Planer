"use client";

import { useId, useRef, useSyncExternalStore, type ComponentType } from "react";

import { MonitorIcon, MoonIcon, SunIcon } from "@/app/components/ui/icons";
import { cn } from "@/lib/cn";
import {
  readPreference,
  resolveTheme,
  setThemePreference,
  subscribeTheme,
  type ThemePreference,
} from "@/lib/theme";

type Point = { x: number; y: number };

type Option = {
  value: ThemePreference;
  label: string;
  Icon: ComponentType<{ size?: number }>;
  /** Keyed off <html data-theme-preference> so the active state is correct before hydration. */
  activeClass: string;
};

const OPTIONS: readonly Option[] = [
  { value: "light", label: "Hell", Icon: SunIcon, activeClass: "[[data-theme-preference=light]_&]:text-fg" },
  { value: "dark", label: "Dunkel", Icon: MoonIcon, activeClass: "[[data-theme-preference=dark]_&]:text-fg" },
  {
    value: "system",
    label: "System",
    Icon: MonitorIcon,
    activeClass: "[[data-theme-preference=system]_&]:text-fg",
  },
];

/** Applies the theme without letting every `transition-colors` element animate. */
function withoutTransitions(mutate: () => void) {
  const root = document.documentElement;
  root.setAttribute("data-theme-switching", "");
  mutate();
  // Force a style flush so the new colours land while transitions are disabled.
  void window.getComputedStyle(root).color;
  requestAnimationFrame(() => root.removeAttribute("data-theme-switching"));
}

function switchTheme(next: ThemePreference, origin: Point) {
  const root = document.documentElement;
  const flip = () => withoutTransitions(() => setThemePreference(next));
  const changesAppearance = resolveTheme(readPreference()) !== resolveTheme(next);
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (!changesAppearance || reducedMotion || typeof document.startViewTransition !== "function") {
    flip();
    return;
  }

  // Circular reveal from the pointer / control position.
  root.setAttribute("data-theme-reveal", "");
  const transition = document.startViewTransition(flip);
  const radius = Math.hypot(
    Math.max(origin.x, window.innerWidth - origin.x),
    Math.max(origin.y, window.innerHeight - origin.y),
  );

  transition.ready
    .then(() => {
      root.animate(
        {
          clipPath: [
            `circle(0px at ${origin.x}px ${origin.y}px)`,
            `circle(${radius}px at ${origin.x}px ${origin.y}px)`,
          ],
        },
        {
          duration: 560,
          easing: "cubic-bezier(0.16, 1, 0.3, 1)",
          pseudoElement: "::view-transition-new(root)",
        },
      );
    })
    .catch(() => {});
  transition.finished.finally(() => root.removeAttribute("data-theme-reveal"));
}

type ThemeToggleProps = {
  className?: string;
};

/** Segmented Light / Dark / System switch built on native radios (arrow keys work out of the box). */
export function ThemeToggle({ className }: ThemeToggleProps) {
  const name = useId();
  const pointer = useRef<Point | null>(null);
  const preference = useSyncExternalStore(subscribeTheme, readPreference, () => null);

  return (
    <fieldset
      onPointerDown={(event) => {
        pointer.current = { x: event.clientX, y: event.clientY };
      }}
      className={cn(
        "relative inline-grid shrink-0 grid-cols-3 rounded-full border border-line bg-surface-sunken p-0.5",
        className,
      )}
    >
      <legend className="sr-only">Farbschema</legend>
      <span
        aria-hidden="true"
        className={cn(
          "pointer-events-none absolute top-0.5 left-0.5 size-8 rounded-full border border-line bg-surface shadow-xs",
          "transition-transform duration-300 ease-(--ease-out-expo)",
          "[[data-theme-preference=dark]_&]:translate-x-full",
          "[[data-theme-preference=system]_&]:translate-x-[200%]",
        )}
      />
      {OPTIONS.map(({ value, label, Icon, activeClass }) => (
        <label
          key={value}
          title={label}
          className={cn(
            "focus-ring-within relative flex size-8 cursor-pointer items-center justify-center rounded-full text-fg-subtle transition-colors hover:text-fg",
            activeClass,
          )}
        >
          <input
            type="radio"
            name={name}
            value={value}
            checked={preference === value}
            onChange={(event) => {
              const rect = event.currentTarget.parentElement!.getBoundingClientRect();
              const origin = pointer.current ?? {
                x: rect.left + rect.width / 2,
                y: rect.top + rect.height / 2,
              };
              pointer.current = null;
              switchTheme(value, origin);
            }}
            className="sr-only"
          />
          <Icon size={16} />
          <span className="sr-only">{label}</span>
        </label>
      ))}
    </fieldset>
  );
}
