import type { MealPlan } from "./schema";

const meal = (
  type: string,
  name: string,
  calories: number,
  protein: number,
  carbs: number,
  fat: number,
  prepTime: number,
  ingredients: MealPlan["days"][number]["meals"][number]["ingredients"],
  instructions: string[],
  mealPrep = false,
): MealPlan["days"][number]["meals"][number] => ({
  type,
  name,
  mealPrep,
  calories,
  protein,
  carbs,
  fat,
  prepTime,
  ingredients,
  instructions,
});

const dayNames = [
  "Montag",
  "Dienstag",
  "Mittwoch",
  "Donnerstag",
  "Freitag",
  "Samstag",
  "Sonntag",
];

export const mockMealPlan: MealPlan = {
  dailyCalories: 2500,
  days: dayNames.map((day, index) => ({
    day,
    meals: [
      meal(
        "Frühstück",
        index % 2 === 0 ? "Haferflocken mit Beeren" : "Rührei mit Vollkornbrot",
        550,
        30,
        65,
        18,
        10,
        index % 2 === 0
          ? [
              { name: "Haferflocken", amount: 80, unit: "g" },
              { name: "Beeren", amount: 100, unit: "g" },
              { name: "Skyr", amount: 200, unit: "g" },
            ]
          : [
              { name: "Eier", amount: 3, unit: "Stück" },
              { name: "Vollkornbrot", amount: 2, unit: "Scheiben" },
              { name: "Tomate", amount: 100, unit: "g" },
            ],
        [
          "Zutaten vorbereiten und miteinander anrichten.",
          "Servieren und genießen.",
        ],
        true,
      ),
      meal(
        "Mittagessen",
        "Hähnchen mit Reis und Gemüse",
        850,
        58,
        90,
        24,
        25,
        [
          { name: "Hähnchenbrust", amount: 200, unit: "g" },
          { name: "Reis", amount: 100, unit: "g" },
          { name: "Brokkoli", amount: 200, unit: "g" },
          { name: "Olivenöl", amount: 10, unit: "ml" },
        ],
        [
          "Reis kochen und Gemüse dünsten.",
          "Hähnchen anbraten und alles zusammen servieren.",
        ],
        true,
      ),
      meal(
        "Abendessen",
        "Lachs mit Kartoffeln und Salat",
        700,
        48,
        55,
        26,
        25,
        [
          { name: "Lachs", amount: 180, unit: "g" },
          { name: "Kartoffeln", amount: 250, unit: "g" },
          { name: "Blattsalat", amount: 100, unit: "g" },
          { name: "Joghurt", amount: 50, unit: "g" },
        ],
        [
          "Kartoffeln garen und Lachs braten.",
          "Salat mit Joghurt-Dressing anrichten.",
        ],
      ),
    ],
  })),
  shoppingList: [
    { name: "Haferflocken", amount: "560 g", category: "Getreide" },
    { name: "Beeren", amount: "350 g", category: "Obst" },
    { name: "Skyr", amount: "1,4 kg", category: "Milchprodukte" },
    { name: "Eier", amount: "11 Stück", category: "Eier" },
    { name: "Vollkornbrot", amount: "8 Scheiben", category: "Brot" },
    { name: "Hähnchenbrust", amount: "1,4 kg", category: "Fleisch" },
    { name: "Reis", amount: "700 g", category: "Getreide" },
    { name: "Brokkoli", amount: "1,4 kg", category: "Gemüse" },
    { name: "Lachs", amount: "1,26 kg", category: "Fisch" },
    { name: "Kartoffeln", amount: "1,75 kg", category: "Gemüse" },
    { name: "Blattsalat", amount: "700 g", category: "Gemüse" },
    { name: "Olivenöl", amount: "70 ml", category: "Öle" },
  ],
};
