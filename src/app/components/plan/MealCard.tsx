"use client";

import { useState } from "react";

import ConfirmModal from "@/app/components/ui/ConfirmModal";
import {
  BoxIcon,
  ChevronDownIcon,
  ClockIcon,
  FlameIcon,
  RefreshIcon,
} from "@/app/components/ui/icons";
import { cn } from "@/lib/cn";
import { formatNumber, type Meal } from "@/lib/plan";

const MACROS = [
  { key: "protein", label: "Protein", short: "P", kcalPerGram: 4, color: "bg-macro-protein" },
  { key: "carbs", label: "Kohlenhydrate", short: "K", kcalPerGram: 4, color: "bg-macro-carbs" },
  { key: "fat", label: "Fett", short: "F", kcalPerGram: 9, color: "bg-macro-fat" },
] as const;

type MealCardProps = {
  meal: Meal;
  /** Omit to hide the swap action (e.g. in the demo). */
  onReplace?: () => void;
  isReplacing?: boolean;
  /** Another meal is currently being swapped – prevents parallel requests. */
  isLocked?: boolean;
};

export function MealCard({ meal, onReplace, isReplacing = false, isLocked = false }: MealCardProps) {
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  const energy = MACROS.map((macro) => meal[macro.key] * macro.kcalPerGram);
  const totalEnergy = energy.reduce((sum, value) => sum + value, 0) || 1;

  return (
    <article
      aria-busy={isReplacing || undefined}
      className="group/meal relative flex flex-col rounded-card border border-line bg-surface p-5 shadow-card transition-[border-color,box-shadow,transform] duration-300 hover:-translate-y-0.5 hover:border-line-strong hover:shadow-float"
    >
      <header className="flex items-start justify-between gap-3">
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="rounded-full bg-brand-50 px-2.5 py-1 text-xs font-semibold text-brand-700">
            {meal.type}
          </span>
          {meal.mealPrep ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-success-soft px-2.5 py-1 text-xs font-semibold text-success">
              <BoxIcon size={12} strokeWidth={2.25} />
              Meal Prep
            </span>
          ) : null}
        </div>

        {onReplace ? (
          <button
            type="button"
            onClick={() => setIsConfirmOpen(true)}
            disabled={isReplacing || isLocked}
            title="Gericht tauschen"
            aria-label={`${meal.name} austauschen`}
            className="group/swap -mr-1 -mt-1 flex size-9 shrink-0 items-center justify-center rounded-full border border-line text-fg-muted transition-colors hover:border-brand-300 hover:bg-brand-50 hover:text-brand-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <RefreshIcon
              size={16}
              className={cn(
                "transition-transform duration-500 ease-(--ease-out-expo)",
                isReplacing ? "animate-spin" : "group-hover/swap:rotate-180",
              )}
            />
          </button>
        ) : null}
      </header>

      <h3 className="mt-3 text-balance text-lg font-semibold leading-snug tracking-tight text-fg">
        {meal.name}
      </h3>

      <p className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-fg-muted">
        <span className="inline-flex items-center gap-1">
          <FlameIcon size={14} className="text-accent-500" />
          <span className="font-semibold tabular-nums text-fg">{formatNumber(meal.calories)}</span> kcal
        </span>
        <span className="inline-flex items-center gap-1">
          <ClockIcon size={14} />
          {meal.prepTime} Min.
        </span>
      </p>

      <div
        role="img"
        aria-label={MACROS.map((macro) => `${macro.label} ${meal[macro.key]} Gramm`).join(", ")}
        className="mt-4 flex h-1.5 gap-0.5 overflow-hidden rounded-full bg-surface-sunken"
      >
        {MACROS.map((macro, index) => (
          <span
            key={macro.key}
            className={cn("h-full", macro.color)}
            style={{ width: `${(energy[index] / totalEnergy) * 100}%` }}
          />
        ))}
      </div>
      <dl className="mt-2 grid grid-cols-3 text-xs" aria-hidden="true">
        {MACROS.map((macro) => (
          <div key={macro.key} className="flex items-center gap-1.5">
            <span className={cn("size-1.5 rounded-full", macro.color)} />
            <dt className="text-fg-subtle">{macro.short}</dt>
            <dd className="font-semibold tabular-nums text-fg">{meal[macro.key]} g</dd>
          </div>
        ))}
      </dl>

      <div className="mt-5 border-t border-line pt-4">
        <h4 className="text-xs font-semibold uppercase tracking-[0.12em] text-fg-subtle">Zutaten</h4>
        <ul className="mt-2 space-y-1.5 text-sm">
          {meal.ingredients.map((ingredient, index) => (
            <li key={`${ingredient.name}-${index}`} className="flex items-baseline justify-between gap-3">
              <span className="text-fg">{ingredient.name}</span>
              <span className="shrink-0 tabular-nums text-fg-muted">
                {ingredient.amount.toLocaleString("de-DE")} {ingredient.unit}
              </span>
            </li>
          ))}
        </ul>
      </div>

      <details className="group/details mt-4 rounded-control bg-surface-muted">
        <summary className="flex cursor-pointer list-none items-center justify-between gap-2 rounded-control px-3.5 py-2.5 text-sm font-medium text-fg transition-colors hover:bg-surface-sunken [&::-webkit-details-marker]:hidden">
          Zubereitung
          <span className="flex items-center gap-2 text-xs text-fg-subtle">
            {meal.instructions.length} {meal.instructions.length === 1 ? "Schritt" : "Schritte"}
            <ChevronDownIcon
              size={16}
              className="transition-transform duration-300 group-open/details:rotate-180"
            />
          </span>
        </summary>
        <ol className="space-y-2.5 px-3.5 pb-3.5 pt-1 text-sm leading-relaxed text-fg-muted">
          {meal.instructions.map((instruction, index) => (
            <li key={index} className="flex gap-3">
              <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-surface text-[0.6875rem] font-semibold tabular-nums text-fg shadow-xs">
                {index + 1}
              </span>
              <span>{instruction}</span>
            </li>
          ))}
        </ol>
      </details>

      {isReplacing ? (
        <div className="absolute inset-0 flex animate-fade-in flex-col items-center justify-center gap-3 rounded-card bg-surface/75 backdrop-blur-sm">
          <span
            aria-hidden="true"
            className="size-8 animate-spin rounded-full border-2 border-brand-500 border-r-transparent"
          />
          <p className="text-sm font-medium text-fg">Neues Gericht wird gesucht …</p>
        </div>
      ) : null}

      {onReplace ? (
        <ConfirmModal
          isOpen={isConfirmOpen}
          title="Gericht tauschen?"
          message={`„${meal.name}“ wird durch ein neues Gericht mit ähnlichen Makros ersetzt. Die Einkaufsliste passt sich automatisch an.`}
          yesLabel="Gericht tauschen"
          noLabel="Behalten"
          onYes={() => {
            setIsConfirmOpen(false);
            onReplace();
          }}
          onNo={() => setIsConfirmOpen(false)}
        />
      ) : null}
    </article>
  );
}
