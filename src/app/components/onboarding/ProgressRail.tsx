import { ThemeToggle } from "@/app/components/theme/ThemeToggle";
import { BrandMark } from "@/app/components/ui/BrandMark";
import { CheckIcon, LockIcon } from "@/app/components/ui/icons";
import { cn } from "@/lib/cn";
import type { Targets } from "@/lib/onboarding/form";

import { MacroBar } from "@/app/components/ui/MacroBar";

type Step = { id: string; label: string };

type ProgressRailProps = {
  steps: readonly Step[];
  current: number;
  furthest: number;
  onNavigate: (step: number) => void;
  targets: Targets | null;
};

/** Desktop step navigation. Completed steps are clickable, future steps stay locked. */
export function ProgressRail({ steps, current, furthest, onNavigate, targets }: ProgressRailProps) {
  return (
    <aside className="hidden lg:block">
      <div className="sticky top-12 space-y-8">
        <div className="flex items-center justify-between gap-3">
          <BrandMark />
          <ThemeToggle />
        </div>

        <nav aria-label="Fortschritt">
          <ol className="relative space-y-1">
            {steps.map((step, index) => {
              const isCurrent = index === current;
              const isDone = index < furthest && !isCurrent;
              const isReachable = index <= furthest;

              return (
                <li key={step.id} className="relative">
                  {index < steps.length - 1 ? (
                    <span
                      aria-hidden="true"
                      className={cn(
                        "absolute left-[1.0625rem] top-10 h-[calc(100%-1.5rem)] w-px transition-colors duration-500",
                        index < furthest ? "bg-brand-300" : "bg-line",
                      )}
                    />
                  ) : null}
                  <button
                    type="button"
                    onClick={() => onNavigate(index)}
                    disabled={!isReachable}
                    aria-current={isCurrent ? "step" : undefined}
                    className={cn(
                      "group/rail flex w-full items-center gap-3 rounded-[0.9rem] px-1.5 py-2 text-left transition-colors",
                      isReachable && !isCurrent && "hover:bg-surface-sunken",
                      !isReachable && "cursor-not-allowed",
                    )}
                  >
                    <span
                      className={cn(
                        "relative flex size-7 shrink-0 items-center justify-center rounded-full border text-xs font-semibold tabular-nums transition-all duration-300",
                        isCurrent &&
                          "border-brand-solid bg-brand-solid text-on-brand shadow-[0_0_0_5px_var(--color-brand-100)]",
                        isDone && "border-brand-200 bg-brand-100 text-brand-700",
                        !isCurrent && !isDone && "border-line-strong bg-surface text-fg-subtle",
                      )}
                    >
                      {isDone ? (
                        <CheckIcon size={14} strokeWidth={2.75} className="animate-pop" />
                      ) : !isReachable ? (
                        <LockIcon size={12} />
                      ) : (
                        index + 1
                      )}
                    </span>
                    <span className="flex flex-col">
                      <span
                        className={cn(
                          "text-sm font-medium transition-colors",
                          isCurrent ? "text-fg" : isReachable ? "text-fg-muted group-hover/rail:text-fg" : "text-fg-subtle",
                        )}
                      >
                        {step.label}
                      </span>
                      <span className="sr-only">
                        {isCurrent ? "(aktueller Schritt)" : isDone ? "(erledigt)" : !isReachable ? "(noch gesperrt)" : ""}
                      </span>
                    </span>
                  </button>
                </li>
              );
            })}
          </ol>
        </nav>

        <div className="rounded-card border border-line bg-surface/80 p-5 shadow-card backdrop-blur">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-brand-700">
            Dein Tagesbedarf
          </p>
          {targets ? (
            <MacroBar targets={targets} variant="compact" className="mt-3 animate-fade-up" />
          ) : (
            <div className="mt-3 space-y-3" aria-hidden="false">
              <div className="h-8 w-32 rounded-lg bg-[linear-gradient(90deg,var(--color-surface-sunken),var(--color-surface-muted),var(--color-surface-sunken))] bg-size-[200%_100%] animate-shimmer" />
              <div className="h-2.5 rounded-full bg-surface-sunken" />
              <p className="text-sm text-fg-muted">
                Wird live berechnet, sobald du „Über dich“ ausgefüllt hast.
              </p>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}

type MobileProgressProps = {
  total: number;
  current: number;
  label: string;
};

export function MobileProgress({ total, current, label }: MobileProgressProps) {
  return (
    <div className="lg:hidden">
      <div className="mb-5 flex items-center justify-between gap-3">
        <BrandMark />
        <ThemeToggle />
      </div>
      <div
        role="progressbar"
        aria-valuemin={1}
        aria-valuemax={total}
        aria-valuenow={current + 1}
        aria-valuetext={`Schritt ${current + 1} von ${total}: ${label}`}
        aria-label="Fortschritt"
        className="flex gap-1.5"
      >
        {Array.from({ length: total }, (_, index) => (
          <span key={index} className="h-1.5 flex-1 overflow-hidden rounded-full bg-line">
            <span
              className={cn(
                "block h-full rounded-full bg-brand-600 transition-[width] duration-500 ease-(--ease-out-expo)",
                index <= current ? "w-full" : "w-0",
              )}
            />
          </span>
        ))}
      </div>
    </div>
  );
}
