"use client";

import { useEffect, useRef, useState } from "react";

import { Button } from "@/app/components/ui/Button";
import { CheckIcon, SparklesIcon } from "@/app/components/ui/icons";
import { cn } from "@/lib/cn";

const PHASES = [
  "Kalorien und Makros auf die Mahlzeiten verteilen",
  "Passende Rezepte auswählen",
  "Meal-Prep-Schritte planen",
  "Einkaufsliste zusammenstellen",
] as const;

const PHASE_DURATION_MS = 4500;

type GeneratingOverlayProps = {
  onCancel: () => void;
};

export function GeneratingOverlay({ onCancel }: GeneratingOverlayProps) {
  const [phase, setPhase] = useState(0);
  const cancelRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    cancelRef.current?.focus();
  }, []);

  useEffect(() => {
    const interval = window.setInterval(() => {
      setPhase((current) => Math.min(current + 1, PHASES.length - 1));
    }, PHASE_DURATION_MS);

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onCancel();
    };
    document.addEventListener("keydown", onKeyDown);

    return () => {
      window.clearInterval(interval);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [onCancel]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-scrim px-4 backdrop-blur-md animate-fade-up">
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="generating-title"
        aria-describedby="generating-status"
        className="w-full max-w-md rounded-panel border border-line bg-surface p-7 shadow-panel sm:p-9"
      >
        <div className="relative mx-auto flex size-24 items-center justify-center" aria-hidden="true">
          <span className="absolute inset-0 animate-spin rounded-full bg-[conic-gradient(from_0deg,var(--color-brand-500),var(--color-accent-400),var(--color-brand-300),var(--color-brand-500))] opacity-90 blur-[2px] [animation-duration:2.4s]" />
          <span className="absolute inset-1.5 rounded-full bg-surface" />
          <span className="relative flex size-14 items-center justify-center rounded-full bg-linear-to-br from-brand-400 to-brand-solid text-on-brand shadow-brand">
            <SparklesIcon size={24} />
          </span>
        </div>

        <h2 id="generating-title" className="mt-7 text-center text-2xl font-semibold tracking-tight text-fg">
          Dein Wochenplan entsteht
        </h2>
        <p id="generating-status" className="mt-2 text-center text-sm text-fg-muted">
          Wir stimmen sieben Tage auf dein Ziel, deinen Alltag und dein Budget ab.
        </p>
        <p aria-live="polite" className="sr-only">
          {PHASES[phase]}
        </p>

        <ol className="mt-7 space-y-3" aria-hidden="true">
          {PHASES.map((label, index) => (
            <li key={label} className="flex items-center gap-3 text-sm">
              <span
                className={cn(
                  "flex size-6 shrink-0 items-center justify-center rounded-full border transition-all duration-500",
                  index < phase && "border-success bg-success text-surface",
                  index === phase && "border-brand-500 bg-brand-50",
                  index > phase && "border-line bg-surface",
                )}
              >
                {index < phase ? (
                  <CheckIcon size={13} strokeWidth={3} className="animate-pop" />
                ) : index === phase ? (
                  <span className="size-2 animate-pulse rounded-full bg-brand-500" />
                ) : null}
              </span>
              <span className={cn("transition-colors", index <= phase ? "text-fg" : "text-fg-subtle")}>
                {label}
              </span>
            </li>
          ))}
        </ol>

        <div className="mt-8 h-1 overflow-hidden rounded-full bg-surface-sunken" aria-hidden="true">
          <div className="h-full w-2/5 animate-indeterminate rounded-full bg-linear-to-r from-brand-400 via-brand-600 to-accent-400" />
        </div>

        <div className="mt-6 flex items-center justify-between gap-3">
          <p className="text-xs text-fg-subtle">Das kann bis zu einer Minute dauern.</p>
          <Button ref={cancelRef} size="sm" variant="ghost" onClick={onCancel}>
            Abbrechen
          </Button>
        </div>
      </section>
    </div>
  );
}
