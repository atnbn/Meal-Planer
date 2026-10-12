import { mealPlanSchema, type MealPlan } from "@/lib/schema";

export type Day = MealPlan["days"][number];
export type Meal = Day["meals"][number];
export type ShoppingItem = MealPlan["shoppingList"][number];

export type MacroTotals = {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
};

export const PLAN_STORAGE_KEY = "meal-plan";
export const SHOPPING_STORAGE_KEY = "meal-plan-shopping-checked";

const EMPTY_TOTALS: MacroTotals = { calories: 0, protein: 0, carbs: 0, fat: 0 };

const amountFormat = new Intl.NumberFormat("de-DE", { maximumFractionDigits: 1 });

export function sumMeals(meals: readonly Meal[]): MacroTotals {
  return meals.reduce(
    (totals, meal) => ({
      calories: totals.calories + meal.calories,
      protein: totals.protein + meal.protein,
      carbs: totals.carbs + meal.carbs,
      fat: totals.fat + meal.fat,
    }),
    EMPTY_TOTALS,
  );
}

export function averageDailyTotals(plan: MealPlan): MacroTotals {
  const totals = plan.days.map((day) => sumMeals(day.meals));
  const count = Math.max(totals.length, 1);
  return {
    calories: Math.round(totals.reduce((sum, day) => sum + day.calories, 0) / count),
    protein: Math.round(totals.reduce((sum, day) => sum + day.protein, 0) / count),
    carbs: Math.round(totals.reduce((sum, day) => sum + day.carbs, 0) / count),
    fat: Math.round(totals.reduce((sum, day) => sum + day.fat, 0) / count),
  };
}

/** Groups identical meal-prep dishes so they can be cooked in one batch. */
export function collectMealPrep(days: readonly Day[]) {
  const batches = new Map<string, { meal: Meal; days: string[] }>();
  for (const day of days) {
    for (const meal of day.meals) {
      if (!meal.mealPrep) continue;
      const entry = batches.get(meal.name) ?? { meal, days: [] };
      entry.days.push(day.day);
      batches.set(meal.name, entry);
    }
  }
  return [...batches.values()];
}

/**
 * Re-aggregates the shopping list from all ingredients, e.g. after a meal was swapped.
 * Categories are kept from the previous list where possible.
 */
export function rebuildShoppingList(plan: MealPlan): MealPlan["shoppingList"] {
  const categories = new Map(plan.shoppingList.map((item) => [item.name.toLowerCase(), item.category]));
  const totals = new Map<string, { name: string; amount: number; unit: string }>();

  for (const day of plan.days) {
    for (const meal of day.meals) {
      for (const ingredient of meal.ingredients) {
        const key = `${ingredient.name.toLowerCase()}\u0000${ingredient.unit}`;
        const current = totals.get(key);
        totals.set(key, {
          name: current?.name ?? ingredient.name,
          unit: ingredient.unit,
          amount: (current?.amount ?? 0) + ingredient.amount,
        });
      }
    }
  }

  return [...totals.values()].map((item) => ({
    name: item.name,
    amount: `${amountFormat.format(item.amount)} ${item.unit}`.trim(),
    category: categories.get(item.name.toLowerCase()) ?? "Weitere Zutaten",
  }));
}

export function replaceMealAt(
  plan: MealPlan,
  dayIndex: number,
  mealIndex: number,
  replacement: Meal,
): MealPlan {
  const updated: MealPlan = {
    ...plan,
    days: plan.days.map((day, index) =>
      index !== dayIndex
        ? day
        : { ...day, meals: day.meals.map((meal, i) => (i === mealIndex ? replacement : meal)) },
    ),
  };
  return { ...updated, shoppingList: rebuildShoppingList(updated) };
}

/** Reads and validates the stored plan – corrupted or outdated data is treated as "no plan". */
export function loadStoredPlan(): MealPlan | null {
  try {
    const raw = sessionStorage.getItem(PLAN_STORAGE_KEY);
    if (!raw) return null;
    const parsed = mealPlanSchema.safeParse(JSON.parse(raw));
    return parsed.success ? parsed.data : null;
  } catch {
    return null;
  }
}

/** Persists the plan. A brand-new plan also resets the ticked-off shopping items. */
export function storePlan(plan: MealPlan, { keepShoppingProgress = false } = {}) {
  try {
    sessionStorage.setItem(PLAN_STORAGE_KEY, JSON.stringify(plan));
    if (!keepShoppingProgress) sessionStorage.removeItem(SHOPPING_STORAGE_KEY);
  } catch {
    // Storage full or blocked – the plan stays usable for this page view.
  }
}

export const dayAnchor = (day: string) =>
  `tag-${day
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")}`;

export const formatNumber = (value: number) => Math.round(value).toLocaleString("de-DE");
