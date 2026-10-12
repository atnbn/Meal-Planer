import type { ReactNode } from "react";

import { ThemeToggle } from "@/app/components/theme/ThemeToggle";
import { BrandMark } from "@/app/components/ui/BrandMark";
import { cn } from "@/lib/cn";

type NavItem = { href: string; label: string };

type SiteHeaderProps = {
  nav?: readonly NavItem[];
  actions?: ReactNode;
  className?: string;
};

/** Shared top bar for landing page and planner: brand, optional anchor nav, theme switch, CTA. */
export function SiteHeader({ nav, actions, className }: SiteHeaderProps) {
  return (
    <header
      className={cn(
        "scroll-elevate sticky top-0 z-40 border-b border-line bg-canvas/80 backdrop-blur-xl",
        className,
      )}
    >
      <a
        href="#main"
        className="sr-only rounded-control bg-brand-solid px-4 py-2 text-sm font-semibold text-on-brand focus:not-sr-only focus:absolute focus:top-3 focus:left-3 focus:z-50"
      >
        Zum Inhalt springen
      </a>
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center gap-3 px-4 sm:gap-4 sm:px-6">
        <BrandMark compact />

        {nav?.length ? (
          <nav aria-label="Hauptnavigation" className="ml-6 hidden md:block">
            <ul className="flex items-center gap-1">
              {nav.map((item) => (
                <li key={item.href}>
                  <a
                    href={item.href}
                    className="rounded-full px-3.5 py-2 text-sm font-medium text-fg-muted transition-colors hover:bg-surface-sunken hover:text-fg"
                  >
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        ) : null}

        <div className="ml-auto flex items-center gap-2 sm:gap-3">
          <ThemeToggle />
          {actions}
        </div>
      </div>
    </header>
  );
}
