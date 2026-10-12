import { z } from "zod";

import {
  calculateNutritionTargets,
  type NutritionTargets,
} from "@/lib/calorie-target";

import {
  ACTIVITY_LEVELS,
  BUDGET_PERIODS,
  type ActivityLevel,
  type BudgetPeriod,
  type BulkStyle,
  COOKING_TIME_OPTIONS,
  DIET_IMPLIED_EXCLUSIONS,
  DIETS,
  type Diet,
  GENDERS,
  type Gender,
  GOALS,
  type Goal,
  LIMITS,
  MEAL_COUNT_OPTIONS,
  MEAL_PREP_LABELS,
  MEAL_PREP_PREFERENCES,
  type MealPrepPreference,
} from "./constants";
import { customEntrySchema, type PreferencesInput } from "./schema";

export type FormState = {
  goal: Goal | "";
  age: string;
  gender: Gender | "";
  height: string;
  weight: string;
  activityLevel: ActivityLevel | "";
  calorieSurplus: number;
  useManualTargets: boolean;
  targetCalories: string;
  targetProtein: string;
  targetCarbs: string;
  targetFat: string;
  diet: Diet | "";
  allergies: string[];
  blacklist: string[];
  mealsPerDay: number;
  snacks: boolean;
  mealPrep: MealPrepPreference;
  budget: string;
  budgetPeriod: BudgetPeriod;
  maxCookingTime: number;
};

export type FieldKey = keyof FormState;
export type FieldErrors = Partial<Record<FieldKey, string>>;

export const DEFAULT_FORM: FormState = {
  goal: "",
  age: "",
  gender: "",
  height: "",
  weight: "",
  activityLevel: "",
  calorieSurplus: 250,
  useManualTargets: false,
  targetCalories: "",
  targetProtein: "",
  targetCarbs: "",
  targetFat: "",
  diet: "",
  allergies: [],
  blacklist: [],
  mealsPerDay: 3,
  snacks: false,
  mealPrep: "partial",
  budget: "",
  budgetPeriod: "week",
  maxCookingTime: 30,
};

export const STEPS = [
  {
    id: "goal",
    title: "Was ist dein Ziel?",
    label: "Ziel",
    description: "Darauf optimieren wir Kalorien, Makros und Rezeptauswahl.",
  },
  {
    id: "body",
    title: "Erzähl uns von dir",
    label: "Über dich",
    description: "Mit diesen Angaben berechnen wir deinen täglichen Energiebedarf.",
  },
  {
    id: "diet",
    title: "Wie ernährst du dich?",
    label: "Ernährung",
    description: "Wir planen ausschließlich Gerichte, die zu deiner Ernährungsweise passen.",
  },
  {
    id: "allergies",
    title: "Was soll nicht auf den Teller?",
    label: "Ausschlüsse",
    description: "Optional – Allergien und Abneigungen werden konsequent berücksichtigt.",
  },
  {
    id: "preferences",
    title: "Wie sieht dein Alltag aus?",
    label: "Alltag & Budget",
    description: "Damit der Plan zu deinem Rhythmus, deiner Zeit und deinem Geldbeutel passt.",
  },
  {
    id: "summary",
    title: "Alles bereit – passt das so?",
    label: "Übersicht",
    description: "Prüfe deine Angaben und Zielwerte. Du kannst jeden Bereich direkt bearbeiten.",
  },
] as const;

export const SUMMARY_STEP = STEPS.length - 1;

/** Fields per step, in visual order – used for focusing the first invalid field. */
export const STEP_FIELDS: Record<number, FieldKey[]> = {
  0: ["goal"],
  1: ["age", "gender", "height", "weight", "activityLevel", "calorieSurplus"],
  2: ["diet"],
  3: ["allergies", "blacklist"],
  4: ["mealsPerDay", "snacks", "mealPrep", "maxCookingTime", "budget", "budgetPeriod"],
  5: ["targetCalories", "targetProtein", "targetCarbs", "targetFat"],
};

/* -------------------------------------------------------------------------- */
/* Numbers                                                                     */
/* -------------------------------------------------------------------------- */

const NUMERIC_PATTERN = /^\d+(?:[.,]\d+)?$/;

/** Accepts both "75,5" and "75.5". Returns NaN for anything that is not a plain number. */
export const parseNumber = (value: string) => {
  const trimmed = value.trim();
  return NUMERIC_PATTERN.test(trimmed) ? Number(trimmed.replace(",", ".")) : Number.NaN;
};

/** Strips everything that can't be part of a positive decimal number while typing. */
export const sanitizeNumericInput = (value: string, allowDecimal: boolean) => {
  if (!allowDecimal) {
    // "28,5" → "28" instead of the misleading "285".
    return value.split(/[.,]/)[0].replace(/\D/g, "").slice(0, 3);
  }
  const cleaned = value.replace(/[^\d.,]/g, "");
  const [head, ...rest] = cleaned.split(/[.,]/);
  const separator = cleaned.match(/[.,]/)?.[0];
  return (separator ? `${head}${separator}${rest.join("").slice(0, 1)}` : head).slice(0, 6);
};

type NumberRule = {
  min: number;
  max: number;
  integer?: boolean;
  messages: { empty: string; range: string };
};

const validateNumber = (value: string, rule: NumberRule) => {
  if (!value.trim()) {
    return rule.messages.empty;
  }
  const parsed = parseNumber(value);
  if (!Number.isFinite(parsed)) {
    return "Bitte gib eine gültige Zahl ein.";
  }
  if (rule.integer && !Number.isInteger(parsed)) {
    return "Bitte gib eine ganze Zahl ein.";
  }
  if (parsed < rule.min || parsed > rule.max) {
    return rule.messages.range;
  }
  return undefined;
};

const isValidNumber = (value: string, rule: Omit<NumberRule, "messages">) => {
  const parsed = parseNumber(value);
  return (
    Number.isFinite(parsed) &&
    parsed >= rule.min &&
    parsed <= rule.max &&
    (!rule.integer || Number.isInteger(parsed))
  );
};

const formatRange = (min: number, max: number, unit: string) =>
  `${min.toLocaleString("de-DE")} und ${max.toLocaleString("de-DE")} ${unit}`;

const TARGET_RULES = {
  targetCalories: { ...LIMITS.targetCalories, integer: true, label: "Kalorien", unit: "kcal" },
  targetProtein: { ...LIMITS.targetProtein, integer: true, label: "Protein", unit: "g" },
  targetCarbs: { ...LIMITS.targetCarbs, integer: true, label: "Kohlenhydrate", unit: "g" },
  targetFat: { ...LIMITS.targetFat, integer: true, label: "Fett", unit: "g" },
} as const;
export type TargetKey = keyof typeof TARGET_RULES;
export const TARGET_KEYS = Object.keys(TARGET_RULES) as TargetKey[];
export const getTargetRule = (key: TargetKey) => TARGET_RULES[key];

/* -------------------------------------------------------------------------- */
/* Validation                                                                  */
/* -------------------------------------------------------------------------- */

export function validateStep(stepIndex: number, form: FormState): FieldErrors {
  const errors: FieldErrors = {};

  switch (stepIndex) {
    case 0:
      if (!form.goal) errors.goal = "Wähle ein Ziel, damit wir deinen Plan darauf ausrichten können.";
      break;

    case 1: {
      errors.age = validateNumber(form.age, {
        ...LIMITS.age,
        integer: true,
        messages: {
          empty: "Bitte gib dein Alter an.",
          range: `Dein Alter muss zwischen ${formatRange(LIMITS.age.min, LIMITS.age.max, "Jahren")} liegen.`,
        },
      });
      if (!form.gender) {
        errors.gender = "Bitte wähle eine Option – „Keine Angabe“ ist auch in Ordnung.";
      }

      const height = parseNumber(form.height);
      errors.height =
        Number.isFinite(height) && height >= 1 && height < 2.5
          ? "Bitte gib deine Größe in Zentimetern an, z. B. 180 statt 1,80."
          : validateNumber(form.height, {
              ...LIMITS.height,
              messages: {
                empty: "Bitte gib deine Größe an.",
                range: `Deine Größe muss zwischen ${formatRange(LIMITS.height.min, LIMITS.height.max, "cm")} liegen.`,
              },
            });
      errors.weight = validateNumber(form.weight, {
        ...LIMITS.weight,
        messages: {
          empty: "Bitte gib dein Gewicht an.",
          range: `Dein Gewicht muss zwischen ${formatRange(LIMITS.weight.min, LIMITS.weight.max, "kg")} liegen.`,
        },
      });
      if (!form.activityLevel) errors.activityLevel = "Wähle, wie aktiv dein Alltag ist.";
      if (
        form.goal === "Muskelaufbau" &&
        (form.calorieSurplus < LIMITS.calorieSurplus.min ||
          form.calorieSurplus > LIMITS.calorieSurplus.max)
      ) {
        errors.calorieSurplus = `Wähle einen Überschuss zwischen ${LIMITS.calorieSurplus.min} und ${LIMITS.calorieSurplus.max} kcal.`;
      }
      break;
    }

    case 2:
      if (!form.diet) errors.diet = "Wähle deine Ernährungsweise.";
      break;

    case 3:
      if (form.allergies.length > LIMITS.customEntry.maxItems) {
        errors.allergies = `Bitte wähle höchstens ${LIMITS.customEntry.maxItems} Einträge.`;
      }
      if (form.blacklist.length > LIMITS.customEntry.maxItems) {
        errors.blacklist = `Bitte wähle höchstens ${LIMITS.customEntry.maxItems} Einträge.`;
      }
      break;

    case 4:
      if (!MEAL_COUNT_OPTIONS.includes(form.mealsPerDay as (typeof MEAL_COUNT_OPTIONS)[number])) {
        errors.mealsPerDay = "Wähle, wie viele Mahlzeiten du am Tag essen möchtest.";
      }
      if (!COOKING_TIME_OPTIONS.includes(form.maxCookingTime as (typeof COOKING_TIME_OPTIONS)[number])) {
        errors.maxCookingTime = "Wähle eine maximale Kochzeit.";
      }
      errors.budget = validateNumber(form.budget, {
        ...LIMITS.budget,
        messages: {
          empty: "Bitte gib dein Budget an.",
          range: `Dein Budget muss zwischen ${formatRange(LIMITS.budget.min, LIMITS.budget.max, "€")} liegen.`,
        },
      });
      break;

    case 5:
      if (form.useManualTargets) {
        for (const key of TARGET_KEYS) {
          const rule = TARGET_RULES[key];
          errors[key] = validateNumber(form[key], {
            ...rule,
            messages: {
              empty: `Bitte gib einen Wert für ${rule.label} an.`,
              range: `${rule.label}: zwischen ${formatRange(rule.min, rule.max, rule.unit)}.`,
            },
          });
        }
      }
      break;
  }

  return Object.fromEntries(
    Object.entries(errors).filter(([, message]) => Boolean(message)),
  ) as FieldErrors;
}

export const hasErrors = (errors: FieldErrors) => Object.keys(errors).length > 0;

/* -------------------------------------------------------------------------- */
/* Derived values                                                              */
/* -------------------------------------------------------------------------- */

export const getBulkStyle = (calorieSurplus: number): BulkStyle => {
  if (calorieSurplus <= 250) return "Lean Bulk";
  if (calorieSurplus <= 375) return "Moderater Bulk";
  return "Dirty Bulk";
};

export const getBulkHint = (calorieSurplus: number) => {
  if (calorieSurplus <= 250) {
    return "Kleiner Überschuss für kontrollierten Aufbau mit möglichst wenig Fettzunahme.";
  }
  if (calorieSurplus <= 375) {
    return "Solider Mittelweg zwischen Muskelaufbau und etwas schnellerem Gewichtszuwachs.";
  }
  return "Deutlicher Überschuss für aggressiven Aufbau – meist mit mehr Fettzunahme.";
};

export function computeRecommendedTargets(form: FormState): NutritionTargets | null {
  if (
    !form.goal ||
    !form.gender ||
    !form.activityLevel ||
    !isValidNumber(form.age, { ...LIMITS.age, integer: true }) ||
    !isValidNumber(form.height, LIMITS.height) ||
    !isValidNumber(form.weight, LIMITS.weight)
  ) {
    return null;
  }

  return calculateNutritionTargets({
    age: parseNumber(form.age),
    gender: form.gender,
    height: parseNumber(form.height),
    weight: parseNumber(form.weight),
    activityLevel: form.activityLevel,
    goal: form.goal,
    calorieSurplus: form.goal === "Muskelaufbau" ? form.calorieSurplus : 0,
  });
}

export type Targets = Record<TargetKey, number>;

export function getEffectiveTargets(
  form: FormState,
  recommended: NutritionTargets | null,
): Targets | null {
  if (!recommended) return null;

  return Object.fromEntries(
    TARGET_KEYS.map((key) => [
      key,
      form.useManualTargets && isValidNumber(form[key], TARGET_RULES[key])
        ? parseNumber(form[key])
        : recommended[key],
    ]),
  ) as Targets;
}

export const macroCalories = (targets: Pick<Targets, "targetProtein" | "targetCarbs" | "targetFat">) =>
  targets.targetProtein * 4 + targets.targetCarbs * 4 + targets.targetFat * 9;

export const getDailyBudget = (form: FormState) => {
  const budget = parseNumber(form.budget);
  if (!Number.isFinite(budget) || budget <= 0) return null;
  return form.budgetPeriod === "week" ? budget / 7 : budget / 30;
};

export const getImpliedExclusions = (diet: Diet | "") =>
  diet ? DIET_IMPLIED_EXCLUSIONS[diet] : [];

export function buildPayload(
  form: FormState,
  recommended: NutritionTargets | null,
): PreferencesInput {
  const targets = getEffectiveTargets(form, recommended);
  const implied = getImpliedExclusions(form.diet);
  const isBulk = form.goal === "Muskelaufbau";

  return {
    goal: form.goal as Goal,
    age: parseNumber(form.age),
    gender: form.gender as Gender,
    height: parseNumber(form.height),
    weight: parseNumber(form.weight),
    activityLevel: form.activityLevel as ActivityLevel,
    calorieSurplus: isBulk ? form.calorieSurplus : 0,
    bulkStyle: isBulk ? getBulkStyle(form.calorieSurplus) : null,
    diet: form.diet as Diet,
    allergies: form.allergies,
    blacklist: form.blacklist.filter((item) => !implied.includes(item)),
    mealsPerDay: form.mealsPerDay,
    snacks: form.snacks,
    mealPrep: MEAL_PREP_LABELS[form.mealPrep],
    budget: parseNumber(form.budget),
    budgetPeriod: form.budgetPeriod,
    maxCookingTime: form.maxCookingTime,
    useManualTargets: form.useManualTargets,
    ...(targets ?? {}),
  };
}

/* -------------------------------------------------------------------------- */
/* Custom entries                                                              */
/* -------------------------------------------------------------------------- */

export const normalizeEntry = (value: string) => {
  const collapsed = value.trim().replace(/\s+/g, " ");
  return collapsed ? collapsed.charAt(0).toLocaleUpperCase("de-DE") + collapsed.slice(1) : "";
};

export type EntryResult =
  | { ok: true; value: string }
  | { ok: false; error: string };

/** Normalises a free-text entry and resolves it against existing options (case-insensitive). */
export function resolveCustomEntry(raw: string, existing: readonly string[]): EntryResult {
  const value = normalizeEntry(raw);
  if (!value) {
    return { ok: false, error: "Bitte gib einen Begriff ein." };
  }
  if (!customEntrySchema.safeParse(value).success) {
    return {
      ok: false,
      error: `Bitte nur Buchstaben, Zahlen und einfache Satzzeichen verwenden (max. ${LIMITS.customEntry.maxLength} Zeichen).`,
    };
  }
  const match = existing.find(
    (option) => option.toLocaleLowerCase("de-DE") === value.toLocaleLowerCase("de-DE"),
  );
  return { ok: true, value: match ?? value };
}

/* -------------------------------------------------------------------------- */
/* Draft persistence                                                           */
/* -------------------------------------------------------------------------- */

const DRAFT_KEY = "onboarding-draft";
const DRAFT_VERSION = 2;

const entryArray = z.array(customEntrySchema).max(50);

const draftSchema = z.object({
  version: z.literal(DRAFT_VERSION),
  step: z.number().int().min(0).max(SUMMARY_STEP).catch(0),
  furthestStep: z.number().int().min(0).max(SUMMARY_STEP).catch(0),
  customAllergies: entryArray.catch([]),
  customExclusions: entryArray.catch([]),
  form: z.object({
    goal: z.enum(GOALS).or(z.literal("")).catch(""),
    age: z.string().max(6).catch(""),
    gender: z.enum(GENDERS).or(z.literal("")).catch(""),
    height: z.string().max(6).catch(""),
    weight: z.string().max(6).catch(""),
    activityLevel: z.enum(ACTIVITY_LEVELS).or(z.literal("")).catch(""),
    calorieSurplus: z
      .number()
      .min(LIMITS.calorieSurplus.min)
      .max(LIMITS.calorieSurplus.max)
      .catch(DEFAULT_FORM.calorieSurplus),
    useManualTargets: z.boolean().catch(false),
    targetCalories: z.string().max(6).catch(""),
    targetProtein: z.string().max(6).catch(""),
    targetCarbs: z.string().max(6).catch(""),
    targetFat: z.string().max(6).catch(""),
    diet: z.enum(DIETS).or(z.literal("")).catch(""),
    allergies: entryArray.catch([]),
    blacklist: entryArray.catch([]),
    mealsPerDay: z.number().int().catch(DEFAULT_FORM.mealsPerDay),
    snacks: z.boolean().catch(DEFAULT_FORM.snacks),
    mealPrep: z.enum(MEAL_PREP_PREFERENCES).catch(DEFAULT_FORM.mealPrep),
    budget: z.string().max(6).catch(""),
    budgetPeriod: z.enum(BUDGET_PERIODS).catch(DEFAULT_FORM.budgetPeriod),
    maxCookingTime: z.number().int().catch(DEFAULT_FORM.maxCookingTime),
  }),
});

export type Draft = Omit<z.infer<typeof draftSchema>, "version">;

export function loadDraft(): Draft | null {
  try {
    const raw = window.sessionStorage.getItem(DRAFT_KEY);
    if (!raw) return null;
    const parsed = draftSchema.safeParse(JSON.parse(raw));
    return parsed.success ? parsed.data : null;
  } catch {
    return null;
  }
}

export function saveDraft(draft: Draft) {
  try {
    window.sessionStorage.setItem(DRAFT_KEY, JSON.stringify({ version: DRAFT_VERSION, ...draft }));
  } catch {
    // Storage may be full or disabled (private mode) – the flow still works without it.
  }
}

export function clearDraft() {
  try {
    window.sessionStorage.removeItem(DRAFT_KEY);
  } catch {
    // ignore
  }
}
