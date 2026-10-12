import { z } from "zod";

const ingredientSchema = z.object({
  name: z.string(),
  amount: z.number(),
  unit: z.string(),
});

const mealSchema = z.object({
  type: z.string(),
  name: z.string(),
  mealPrep: z.boolean().default(false),

  calories: z.number(),
  protein: z.number(),
  carbs: z.number(),
  fat: z.number(),

  prepTime: z.number(),

  ingredients: z.array(ingredientSchema),
  instructions: z.array(z.string()),
});

const daySchema = z.object({
  day: z.string(),
  meals: z.array(mealSchema),
});

const shoppingItemSchema = z.object({
  name: z.string(),
  amount: z.string(),
  category: z.string(),
});

export const mealPlanSchema = z.object({
  dailyCalories: z.number(),

  days: z.array(daySchema).length(7),

  shoppingList: z.array(shoppingItemSchema),
});

export type MealPlan = z.infer<typeof mealPlanSchema>;
