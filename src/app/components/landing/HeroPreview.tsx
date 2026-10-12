import {
  BoxIcon,
  CheckIcon,
  ClockIcon,
  FlameIcon,
  RefreshIcon,
  ShoppingCartIcon,
} from "@/app/components/ui/icons";
import { cn } from "@/lib/cn";
import { mockMealPlan } from "@/lib/mock-plan";
import { formatNumber, sumMeals } from "@/lib/plan";

const MONDAY = mockMealPlan.days[0];
const TOTALS = sumMeals(MONDAY.meals);

const MACRO_SEGMENTS = [
  { label: "Protein", grams: TOTALS.protein, kcal: TOTALS.protein * 4, color: "var(--color-macro-protein)" },
  { label: "Kohlenhydrate", grams: TOTALS.carbs, kcal: TOTALS.carbs * 4, color: "var(--color-macro-carbs)" },
  { label: "Fett", grams: TOTALS.fat, kcal: TOTALS.fat * 9, color: "var(--color-macro-fat)" },
];

const TOTAL_KCAL = MACRO_SEGMENTS.reduce((sum, segment) => sum + segment.kcal, 0);

const SHOPPING = [
  { name: "Haferflocken", amount: "320 g", done: true },
  { name: "Hähnchenbrust", amount: "1,4 kg", done: true },
  { name: "Brokkoli", amount: "1,4 kg", done: false },
];

/** Donut chart of the energy split – pure SVG so it themes via CSS variables. */
function MacroRing() {
  const total = TOTAL_KCAL;
  const radius = 34;
  const circumference = 2 * Math.PI * radius;
  const arcs = MACRO_SEGMENTS.map((segment, index) => ({
    ...segment,
    length: (segment.kcal / total) * circumference,
    offset: MACRO_SEGMENTS.slice(0, index).reduce((sum, prev) => sum + (prev.kcal / total) * circumference, 0),
  }));

  return (
    <svg viewBox="0 0 88 88" className="size-24 -rotate-90">
      <circle cx="44" cy="44" r={radius} fill="none" stroke="var(--color-surface-sunken)" strokeWidth="9" />
      {arcs.map((arc) => (
        <circle
          key={arc.label}
          cx="44"
          cy="44"
          r={radius}
          fill="none"
          stroke={arc.color}
          strokeWidth="9"
          strokeDasharray={`${Math.max(arc.length - 2.5, 0)} ${circumference}`}
          strokeDashoffset={-(arc.offset + 1.25)}
        />
      ))}
    </svg>
  );
}

/**
 * Static, theme-aware product mock for the hero. Purely illustrative – exposed to assistive tech
 * as a single image with a description.
 */
export function HeroPreview() {
  return (
    <div
      role="img"
      aria-label={`Vorschau eines Wochenplans: Montag mit ${MONDAY.meals.length} Mahlzeiten und ${formatNumber(TOTALS.calories)} Kilokalorien, Makro-Verteilung und Einkaufsliste.`}
      className="relative mx-auto w-full max-w-md animate-fade-up [animation-delay:200ms] lg:max-w-none"
    >
      <div aria-hidden="true" className="absolute inset-8 -z-10 rounded-full bg-brand-400/30 blur-3xl" />

      {/* Main "app window" */}
      <div className="relative rounded-panel border border-line bg-surface/90 p-2 shadow-float backdrop-blur-xl">
        <div className="flex items-center gap-1.5 px-3 py-2">
          <span className="size-2.5 rounded-full bg-line-strong" />
          <span className="size-2.5 rounded-full bg-line-strong" />
          <span className="size-2.5 rounded-full bg-line-strong" />
          <span className="ml-3 h-5 flex-1 rounded-full bg-surface-sunken" />
        </div>

        <div className="rounded-[1.35rem] border border-line bg-canvas p-4 sm:p-5">
          <div className="flex items-end justify-between">
            <div>
              <p className="text-[0.6875rem] font-semibold uppercase tracking-[0.16em] text-brand-700">Tag 1</p>
              <p className="text-xl font-semibold tracking-tight text-fg">{MONDAY.day}</p>
            </div>
            <span className="inline-flex items-center gap-1 rounded-full bg-success-soft px-2.5 py-1 text-xs font-semibold text-success">
              <CheckIcon size={12} strokeWidth={2.75} />
              {formatNumber(TOTALS.calories)} kcal
            </span>
          </div>

          <ul className="mt-4 space-y-2">
            {MONDAY.meals.map((meal, index) => (
              <li
                key={meal.name}
                className={cn(
                  "flex items-center gap-3 rounded-card border border-line bg-surface p-3 shadow-xs",
                  index === 1 && "ring-2 ring-brand-300/70",
                )}
              >
                <span className="flex size-10 shrink-0 items-center justify-center rounded-[0.8rem] bg-brand-50 text-xs font-bold text-brand-700">
                  {meal.type.slice(0, 2)}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-fg">{meal.name}</p>
                  <p className="mt-0.5 flex items-center gap-2.5 text-xs text-fg-muted">
                    <span className="inline-flex items-center gap-1">
                      <FlameIcon size={12} className="text-accent-500" />
                      {meal.calories} kcal
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <ClockIcon size={12} />
                      {meal.prepTime} Min.
                    </span>
                  </p>
                </div>
                {meal.mealPrep ? (
                  <span className="flex size-7 items-center justify-center rounded-full bg-success-soft text-success">
                    <BoxIcon size={13} />
                  </span>
                ) : (
                  <span className="flex size-7 items-center justify-center rounded-full border border-line text-fg-subtle">
                    <RefreshIcon size={13} />
                  </span>
                )}
              </li>
            ))}
          </ul>

          <div className="mt-4 flex h-2 gap-0.5 overflow-hidden rounded-full bg-surface-sunken">
            {MACRO_SEGMENTS.map((segment) => (
              <span
                key={segment.label}
                className="h-full"
                style={{ width: `${(segment.kcal / TOTAL_KCAL) * 100}%`, background: segment.color }}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Floating: macro ring */}
      <div className="absolute -right-3 -top-8 hidden animate-float rounded-card border border-line bg-surface/95 p-3 shadow-float backdrop-blur sm:block lg:-right-8">
        <div className="relative">
          <MacroRing />
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-sm font-semibold tabular-nums text-fg">{TOTALS.protein} g</span>
            <span className="text-[0.625rem] text-fg-muted">Protein</span>
          </div>
        </div>
      </div>

      {/* Floating: shopping list */}
      <div className="absolute -bottom-10 -left-4 hidden w-56 animate-float rounded-card border border-line bg-surface/95 p-4 shadow-float backdrop-blur [animation-delay:-3.5s] sm:block lg:-left-10">
        <p className="flex items-center gap-2 text-xs font-semibold text-fg">
          <span className="flex size-6 items-center justify-center rounded-lg bg-brand-50 text-brand-700">
            <ShoppingCartIcon size={13} />
          </span>
          Einkaufsliste
          <span className="ml-auto tabular-nums text-fg-subtle">2/3</span>
        </p>
        <ul className="mt-3 space-y-2 text-xs">
          {SHOPPING.map((item) => (
            <li key={item.name} className="flex items-center gap-2">
              <span
                className={cn(
                  "flex size-4 items-center justify-center rounded-[0.3rem] border",
                  item.done ? "border-brand-solid bg-brand-solid text-on-brand" : "border-fg-subtle",
                )}
              >
                {item.done ? <CheckIcon size={10} strokeWidth={3} /> : null}
              </span>
              <span className={cn("flex-1", item.done ? "text-fg-subtle line-through" : "text-fg")}>{item.name}</span>
              <span className="tabular-nums text-fg-muted">{item.amount}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Floating: swap toast */}
      <div className="absolute -bottom-5 right-6 hidden items-center gap-2 rounded-full border border-line bg-surface/95 py-1.5 pl-1.5 pr-3.5 text-xs font-medium text-fg shadow-float backdrop-blur sm:flex">
        <span className="flex size-6 items-center justify-center rounded-full bg-brand-solid text-on-brand">
          <RefreshIcon size={12} />
        </span>
        Gericht getauscht · Makros bleiben gleich
      </div>
    </div>
  );
}
