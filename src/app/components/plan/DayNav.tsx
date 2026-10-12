"use client";

import { useEffect, useState } from "react";

import { ShoppingCartIcon } from "@/app/components/ui/icons";
import { cn } from "@/lib/cn";
import { dayAnchor, type Day, formatNumber, sumMeals } from "@/lib/plan";

type DayNavProps = {
  days: readonly Day[];
};

/** Sticky jump navigation with scroll-spy for the seven days plus the shopping list. */
export function DayNav({ days }: DayNavProps) {
  const [active, setActive] = useState<string | null>(null);

  useEffect(() => {
    const targets = [
      ...days.map((day) => document.getElementById(dayAnchor(day.day))),
      document.getElementById("einkaufsliste"),
    ].filter((element): element is HTMLElement => element !== null);

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];
        if (visible) setActive(visible.target.id);
      },
      // A thin band below the sticky headers decides which section is "current".
      { rootMargin: "-140px 0px -60% 0px" },
    );
    targets.forEach((target) => observer.observe(target));
    return () => observer.disconnect();
  }, [days]);

  const linkClass = (isActive: boolean) =>
    cn(
      "flex shrink-0 snap-start flex-col items-center rounded-[0.9rem] px-3.5 py-1.5 text-center transition-colors",
      isActive ? "bg-brand-solid text-on-brand shadow-brand" : "text-fg-muted hover:bg-surface-sunken hover:text-fg",
    );

  return (
    <nav
      aria-label="Wochentage"
      className="sticky top-16 z-30 -mx-4 border-b border-line bg-canvas/85 px-4 py-2.5 backdrop-blur-xl sm:-mx-6 sm:px-6"
    >
      <ul className="mx-auto flex max-w-6xl snap-x gap-1 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {days.map((day) => {
          const id = dayAnchor(day.day);
          const isActive = active === id;
          return (
            <li key={id}>
              <a href={`#${id}`} aria-current={isActive ? "location" : undefined} className={linkClass(isActive)}>
                <span className="text-sm font-semibold">
                  <span className="sm:hidden">{day.day.slice(0, 2)}</span>
                  <span className="max-sm:hidden">{day.day}</span>
                </span>
                <span
                  className={cn("text-[0.6875rem] tabular-nums", isActive ? "text-on-brand/80" : "text-fg-subtle")}
                >
                  {formatNumber(sumMeals(day.meals).calories)} kcal
                </span>
              </a>
            </li>
          );
        })}
        <li className="ml-auto pl-2">
          <a
            href="#einkaufsliste"
            aria-current={active === "einkaufsliste" ? "location" : undefined}
            className={cn(linkClass(active === "einkaufsliste"), "h-full flex-row justify-center gap-2")}
          >
            <ShoppingCartIcon size={16} />
            <span className="text-sm font-semibold max-sm:sr-only">Einkauf</span>
          </a>
        </li>
      </ul>
    </nav>
  );
}
