export type UserPreferences = {
  goal: "lose_weight" | "build_muscle" | "maintain";

  age: number;
  gender: "male" | "female";

  height: number;
  weight: number;
  targetWeight: number;

  activityLevel: "sedentary" | "light" | "moderate" | "active" | "very_active";

  diet:
    | "normal"
    | "vegan"
    | "vegetarian"
    | "pescetarian"
    | "keto"
    | "low_carb"
    | "high_protein";

  allergies: string[];
  blacklist: string[];

  mealsPerDay: number;
  snacks: boolean;

  mealPrep: "yes" | "partial" | "no";

  budget: number;
  budgetPeriod: "week" | "month";

  maxCookingTime: number;
};
