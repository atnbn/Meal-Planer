import { CheckIcon } from "@/app/components/ui/icons";
import { cn } from "@/lib/cn";
import { dayAnchor, type Day, formatNumber, sumMeals } from "@/lib/plan";

import { MealCard } from "./MealCard";

type DaySectionProps = {
  day: Day;
  index: number;
  targetCalories: number;
  replacingKey: string | null;
  onReplace?: (mealIndex: number) => void;
};

/** Days within ±5 % of the target count as "on target". */
const TOLERANCE = 0.05;

export function DaySection({ day, index, targetCalories, replacingKey, onReplace }: DaySectionProps) {
  const totals = sumMeals(day.meals);
  const delta = totals.calories - targetCalories;
  const onTarget = targetCalories > 0 && Math.abs(delta) <= targetCalories * TOLERANCE;
  const headingId = `${dayAnchor(day.day)}-title`;

  return (
    <section
      id={dayAnchor(day.day)}
      aria-labelledby={headingId}
      data-day-section
      className="scroll-mt-36 reveal"
    >
      <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-3 border-b border-line pb-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-brand-700">Tag {index + 1}</p>
          <h2 id={headingId} className="mt-1 text-2xl font-semibold tracking-tight text-fg sm:text-3xl">
            {day.day}
          </h2>
        </div>

        <dl className="flex flex-wrap items-center gap-2 text-sm">
          <div className="flex items-center gap-1.5 rounded-full border border-line bg-surface px-3 py-1.5 shadow-xs">
            <dt className="sr-only">Kalorien</dt>
            <dd className="font-semibold tabular-nums text-fg">{formatNumber(totals.calories)} kcal</dd>
            {targetCalories > 0 ? (
              <dd
                className={cn(
                  "ml-1 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold",
                  onTarget ? "bg-success-soft text-success" : "bg-warning-soft text-warning",
                )}
              >
                {onTarget ? (
                  <>
                    <CheckIcon size={12} strokeWidth={2.75} />
                    im Ziel
                  </>
                ) : (
                  <>
                    {delta > 0 ? "+" : "−"}
                    {formatNumber(Math.abs(delta))}
                    <span className="sr-only"> kcal zum Ziel</span>
                  </>
                )}
              </dd>
            ) : null}
          </div>
          {(
            [
              ["Protein", totals.protein, "bg-macro-protein"],
              ["Kohlenhydrate", totals.carbs, "bg-macro-carbs"],
              ["Fett", totals.fat, "bg-macro-fat"],
            ] as const
          ).map(([label, value, color]) => (
            <div
              key={label}
              className="flex items-center gap-1.5 rounded-full border border-line bg-surface px-3 py-1.5 shadow-xs"
            >
              <span aria-hidden="true" className={cn("size-2 rounded-full", color)} />
              <dt className="text-fg-muted max-sm:sr-only">{label}</dt>
              <dd className="font-semibold tabular-nums text-fg">{formatNumber(value)} g</dd>
            </div>
          ))}
        </dl>
      </div>

      <div className="mt-5 grid items-start gap-4 md:grid-cols-2 xl:grid-cols-3">
        {day.meals.map((meal, mealIndex) => {
          const key = `${index}-${mealIndex}`;
          return (
            <MealCard
              key={`${key}-${meal.name}`}
              meal={meal}
              isReplacing={replacingKey === key}
              isLocked={replacingKey !== null && replacingKey !== key}
              onReplace={onReplace ? () => onReplace(mealIndex) : undefined}
            />
          );
        })}
      </div>
    </section>
  );
}
