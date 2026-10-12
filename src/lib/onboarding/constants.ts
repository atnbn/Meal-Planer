export const GOALS = [
  "Abnehmen",
  "Muskelaufbau",
  "Gewicht halten",
  "Gesünder leben",
] as const;
export type Goal = (typeof GOALS)[number];

export const GENDERS = ["Männlich", "Weiblich", "Divers", "Keine Angabe"] as const;
export type Gender = (typeof GENDERS)[number];

export const ACTIVITY_LEVELS = [
  "Wenig aktiv",
  "Leicht aktiv",
  "Moderat aktiv",
  "Sehr aktiv",
] as const;
export type ActivityLevel = (typeof ACTIVITY_LEVELS)[number];

export const DIETS = ["Omnivor", "Vegetarisch", "Vegan", "Pescetarisch"] as const;
export type Diet = (typeof DIETS)[number];

export const MEAL_PREP_PREFERENCES = ["full", "partial", "fresh"] as const;
export type MealPrepPreference = (typeof MEAL_PREP_PREFERENCES)[number];

export const MEAL_PREP_LABELS = {
  full: "Viel vorbereiten",
  partial: "Teilweise vorbereiten",
  fresh: "Lieber frisch kochen",
} as const satisfies Record<MealPrepPreference, string>;
export const MEAL_PREP_LABEL_VALUES = [
  MEAL_PREP_LABELS.full,
  MEAL_PREP_LABELS.partial,
  MEAL_PREP_LABELS.fresh,
] as const;

export const BUDGET_PERIODS = ["week", "month"] as const;
export type BudgetPeriod = (typeof BUDGET_PERIODS)[number];
export const BUDGET_PERIOD_LABELS: Record<BudgetPeriod, string> = {
  week: "Woche",
  month: "Monat",
};

export const BULK_STYLES = ["Lean Bulk", "Moderater Bulk", "Dirty Bulk"] as const;
export type BulkStyle = (typeof BULK_STYLES)[number];

export const MEAL_COUNT_OPTIONS = [2, 3, 4, 5] as const;
export const COOKING_TIME_OPTIONS = [15, 30, 45, 60] as const;

export const LIMITS = {
  age: { min: 14, max: 100 },
  height: { min: 120, max: 230 },
  weight: { min: 35, max: 250 },
  budget: { min: 1, max: 1000 },
  mealsPerDay: { min: 2, max: 5 },
  cookingTime: { min: 10, max: 120 },
  calorieSurplus: { min: 150, max: 500, step: 25 },
  targetCalories: { min: 1200, max: 7000 },
  targetProtein: { min: 40, max: 400 },
  targetCarbs: { min: 50, max: 900 },
  targetFat: { min: 30, max: 250 },
  customEntry: { maxLength: 40, maxItems: 20 },
} as const;

export const DEFAULT_ALLERGIES = ["Laktose", "Gluten", "Nüsse", "Eier", "Soja"];
export const DEFAULT_EXCLUSIONS = ["Rindfleisch", "Schwein", "Geflügel", "Fisch", "Pilze"];

/** Exclusions that a diet already covers – offering them again would be contradictory. */
export const DIET_IMPLIED_EXCLUSIONS: Record<Diet, readonly string[]> = {
  Omnivor: [],
  Pescetarisch: ["Rindfleisch", "Schwein", "Geflügel"],
  Vegetarisch: ["Rindfleisch", "Schwein", "Geflügel", "Fisch"],
  Vegan: ["Rindfleisch", "Schwein", "Geflügel", "Fisch"],
};
