import { z } from "zod";

import {
  ACTIVITY_LEVELS,
  BUDGET_PERIODS,
  BULK_STYLES,
  DIETS,
  GENDERS,
  GOALS,
  LIMITS,
  MEAL_PREP_LABEL_VALUES,
} from "./constants";

const range = (key: Exclude<keyof typeof LIMITS, "customEntry">) =>
  z.coerce.number().min(LIMITS[key].min).max(LIMITS[key].max);

/**
 * Free-text entries end up in an LLM prompt, so keep them short and restricted
 * to characters that plausibly appear in food names.
 */
export const customEntrySchema = z
  .string()
  .trim()
  .min(1)
  .max(LIMITS.customEntry.maxLength)
  .regex(/^[\p{L}\p{N}][\p{L}\p{N} .,'’&()/-]*$/u);

const entryList = z
  .array(customEntrySchema)
  .max(LIMITS.customEntry.maxItems)
  .default([]);

/** Shared contract between the onboarding client and `/api/generate-plan`. */
export const preferencesSchema = z
  .object({
    goal: z.enum(GOALS),
    age: range("age").int(),
    gender: z.enum(GENDERS),
    height: range("height"),
    weight: range("weight"),
    activityLevel: z.enum(ACTIVITY_LEVELS),
    calorieSurplus: z.coerce.number().min(0).max(LIMITS.calorieSurplus.max).default(0),
    bulkStyle: z.enum(BULK_STYLES).nullable().optional(),
    diet: z.enum(DIETS),
    allergies: entryList,
    blacklist: entryList,
    mealsPerDay: range("mealsPerDay").int(),
    snacks: z.boolean(),
    mealPrep: z.enum(MEAL_PREP_LABEL_VALUES),
    budget: range("budget"),
    budgetPeriod: z.enum(BUDGET_PERIODS),
    maxCookingTime: range("cookingTime").int(),
    targetCalories: range("targetCalories").int().optional(),
    targetProtein: range("targetProtein").int().optional(),
    targetCarbs: range("targetCarbs").int().optional(),
    targetFat: range("targetFat").int().optional(),
    useManualTargets: z.boolean().optional(),
  })
  .superRefine((value, ctx) => {
    if (
      value.goal === "Muskelaufbau" &&
      (value.calorieSurplus < LIMITS.calorieSurplus.min ||
        value.calorieSurplus > LIMITS.calorieSurplus.max)
    ) {
      ctx.addIssue({
        code: "custom",
        path: ["calorieSurplus"],
        message: "Kalorienüberschuss außerhalb des erlaubten Bereichs.",
      });
    }
  });

export type PreferencesInput = z.input<typeof preferencesSchema>;
export type Preferences = z.output<typeof preferencesSchema>;
