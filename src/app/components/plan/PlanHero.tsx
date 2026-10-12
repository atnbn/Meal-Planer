import { BoxIcon, CalendarIcon, ShoppingCartIcon } from "@/app/components/ui/icons";
import { MacroBar } from "@/app/components/ui/MacroBar";
import { averageDailyTotals, collectMealPrep, formatNumber } from "@/lib/plan";
import type { MealPlan } from "@/lib/schema";

type PlanHeroProps = {
  plan: MealPlan;
  isDemo: boolean;
};

export function PlanHero({ plan, isDemo }: PlanHeroProps) {
  const average = averageDailyTotals(plan);
  const mealCount = plan.days.reduce((sum, day) => sum + day.meals.length, 0);
  const prepCount = collectMealPrep(plan.days).length;

  const stats = [
    { icon: CalendarIcon, value: mealCount, label: "Mahlzeiten" },
    { icon: BoxIcon, value: prepCount, label: prepCount === 1 ? "Meal-Prep-Gericht" : "Meal-Prep-Gerichte" },
    { icon: ShoppingCartIcon, value: plan.shoppingList.length, label: "Artikel im Einkauf" },
  ];

  return (
    <section
      aria-labelledby="plan-title"
      className="relative isolate overflow-hidden rounded-panel border border-line bg-surface p-6 shadow-panel sm:p-10"
    >
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -right-24 -top-32 size-96 rounded-full bg-brand-200/50 blur-3xl" />
        <div className="absolute -bottom-40 left-1/3 size-80 rounded-full bg-accent-100/70 blur-3xl dark:bg-accent-100/30" />
        <div className="bg-dots absolute inset-0 mask-[radial-gradient(ellipse_60%_80%_at_0%_0%,black,transparent)]" />
      </div>

      <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_22rem] lg:items-center">
        <div className="animate-fade-up">
          <p className="inline-flex items-center gap-2 rounded-full border border-brand-200 bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-700">
            <span className="size-1.5 rounded-full bg-brand-500" aria-hidden="true" />
            {isDemo ? "Beispielplan" : "Dein persönlicher Wochenplan"}
          </p>
          <h1 id="plan-title" className="mt-4 text-balance text-display text-fg">
            7 Tage, <span className="text-gradient-brand">abgestimmt auf dich.</span>
          </h1>
          <p className="mt-3 max-w-xl text-pretty text-base leading-relaxed text-fg-muted">
            {isDemo
              ? "So sieht ein fertiger Plan aus: Mahlzeiten mit Makros, Meal-Prep-Hinweise und eine automatisch zusammengefasste Einkaufsliste."
              : `Jeder Tag zielt auf ${formatNumber(plan.dailyCalories)} kcal. Passt ein Gericht nicht? Tausche es mit einem Klick – die Einkaufsliste zieht automatisch mit.`}
          </p>

          <ul className="mt-8 grid grid-cols-3 gap-3">
            {stats.map(({ icon: Icon, value, label }) => (
              <li key={label} className="rounded-card border border-line bg-surface/70 p-3 backdrop-blur sm:p-4">
                <Icon size={18} className="text-brand-600" />
                <p className="mt-2 text-2xl font-semibold tabular-nums tracking-tight text-fg">{value}</p>
                <p className="text-xs leading-snug text-fg-muted sm:text-sm">{label}</p>
              </li>
            ))}
          </ul>
        </div>

        <div className="animate-fade-up rounded-card border border-line bg-surface-muted/80 p-5 backdrop-blur [animation-delay:120ms] sm:p-6">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-brand-700">Ø pro Tag</p>
            <p className="text-xs text-fg-muted">
              Ziel <span className="font-semibold tabular-nums text-fg">{formatNumber(plan.dailyCalories)}</span> kcal
            </p>
          </div>
          <MacroBar
            className="mt-3"
            variant="compact"
            caption="kcal"
            targets={{
              targetCalories: average.calories,
              targetProtein: average.protein,
              targetCarbs: average.carbs,
              targetFat: average.fat,
            }}
          />
        </div>
      </div>
    </section>
  );
}
