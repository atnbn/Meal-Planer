import { BoxIcon } from "@/app/components/ui/icons";
import { collectMealPrep, type Day } from "@/lib/plan";

type MealPrepPanelProps = {
  days: readonly Day[];
};

export function MealPrepPanel({ days }: MealPrepPanelProps) {
  const batches = collectMealPrep(days);
  if (batches.length === 0) return null;

  return (
    <section
      aria-labelledby="meal-prep-title"
      className="reveal rounded-panel border border-line bg-surface p-6 shadow-card sm:p-7"
    >
      <div className="flex items-center gap-3">
        <span className="flex size-11 items-center justify-center rounded-[0.9rem] bg-success-soft text-success">
          <BoxIcon size={20} />
        </span>
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-success">Meal Prep</p>
          <h2 id="meal-prep-title" className="text-xl font-semibold tracking-tight text-fg">
            Einmal kochen, mehrfach essen
          </h2>
        </div>
      </div>

      <ul className="mt-6 space-y-3">
        {batches.map(({ meal, days: servedOn }) => (
          <li key={meal.name} className="rounded-card border border-line bg-surface-muted p-4">
            <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
              <h3 className="font-semibold text-fg">{meal.name}</h3>
              <span className="rounded-full bg-surface px-2.5 py-0.5 text-xs font-semibold tabular-nums text-fg-muted shadow-xs">
                {servedOn.length}× Portionen
              </span>
            </div>
            <p className="mt-1 text-sm text-fg-muted">{servedOn.join(" · ")}</p>
            <p className="mt-3 text-xs font-semibold uppercase tracking-[0.12em] text-fg-subtle">
              Zutaten pro Portion
            </p>
            <ul className="mt-1.5 flex flex-wrap gap-1.5 text-sm">
              {meal.ingredients.map((ingredient, index) => (
                <li
                  key={`${ingredient.name}-${index}`}
                  className="rounded-full border border-line bg-surface px-2.5 py-0.5 text-fg-muted"
                >
                  <span className="tabular-nums text-fg">
                    {ingredient.amount.toLocaleString("de-DE")} {ingredient.unit}
                  </span>{" "}
                  {ingredient.name}
                </li>
              ))}
            </ul>
          </li>
        ))}
      </ul>
    </section>
  );
}
