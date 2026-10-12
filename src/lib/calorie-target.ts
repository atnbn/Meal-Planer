const ACTIVITY_FACTORS = {
  "Wenig aktiv": 1.2,
  "Leicht aktiv": 1.375,
  "Moderat aktiv": 1.55,
  "Sehr aktiv": 1.725,
} as const;

const GOAL_ADJUSTMENTS = {
  Abnehmen: -400,
  "Gewicht halten": 0,
  "Gesünder leben": 0,
} as const;

const GENDER_BMR_ADJUSTMENTS = {
  Männlich: 5,
  Weiblich: -161,
  Divers: -78,
  "Keine Angabe": -78,
} as const;

const PROTEIN_PER_KG = {
  Abnehmen: 2,
  Muskelaufbau: 2,
  "Gewicht halten": 1.8,
  "Gesünder leben": 1.6,
} as const;

const FAT_PER_KG = {
  Abnehmen: 0.8,
  Muskelaufbau: 0.9,
  "Gewicht halten": 0.9,
  "Gesünder leben": 0.9,
} as const;

export type CalorieGoal =
  | keyof typeof GOAL_ADJUSTMENTS
  | "Muskelaufbau";
export type CalorieGender = keyof typeof GENDER_BMR_ADJUSTMENTS;
export type CalorieActivityLevel = keyof typeof ACTIVITY_FACTORS;

export type CalorieCalculationInput = {
  age: number;
  gender: CalorieGender;
  height: number;
  weight: number;
  activityLevel: CalorieActivityLevel;
  goal: CalorieGoal;
  calorieSurplus?: number;
};

export type CalorieCalculationResult = {
  bmr: number;
  activityFactor: number;
  maintenanceCalories: number;
  goalAdjustment: number;
  targetCalories: number;
};

export type NutritionTargets = CalorieCalculationResult & {
  targetProtein: number;
  targetCarbs: number;
  targetFat: number;
};

const roundToNearestTen = (value: number) => Math.round(value / 10) * 10;

export function calculateCalorieTarget({
  age,
  gender,
  height,
  weight,
  activityLevel,
  goal,
  calorieSurplus = 0,
}: CalorieCalculationInput): CalorieCalculationResult {
  const bmr =
    10 * weight +
    6.25 * height -
    5 * age +
    GENDER_BMR_ADJUSTMENTS[gender];

  const activityFactor = ACTIVITY_FACTORS[activityLevel];
  const maintenanceCalories = bmr * activityFactor;
  const goalAdjustment =
    goal === "Muskelaufbau"
      ? calorieSurplus
      : GOAL_ADJUSTMENTS[goal];

  const targetCalories = Math.max(
    1200,
    roundToNearestTen(maintenanceCalories + goalAdjustment),
  );

  return {
    bmr: roundToNearestTen(bmr),
    activityFactor,
    maintenanceCalories: roundToNearestTen(maintenanceCalories),
    goalAdjustment,
    targetCalories,
  };
}

export function calculateNutritionTargets(
  input: CalorieCalculationInput,
): NutritionTargets {
  const calorieTarget = calculateCalorieTarget(input);
  const proteinCalories = input.weight * PROTEIN_PER_KG[input.goal] * 4;
  let fatGrams = input.weight * FAT_PER_KG[input.goal];
  let fatCalories = fatGrams * 9;

  const minimumCarbCalories = 120 * 4;

  if (
    calorieTarget.targetCalories - proteinCalories - fatCalories <
    minimumCarbCalories
  ) {
    fatCalories = Math.max(
      40 * 9,
      calorieTarget.targetCalories - proteinCalories - minimumCarbCalories,
    );
    fatGrams = fatCalories / 9;
  }

  const carbCalories = Math.max(
    minimumCarbCalories,
    calorieTarget.targetCalories - proteinCalories - fatCalories,
  );

  return {
    ...calorieTarget,
    targetProtein: Math.round((proteinCalories / 4) / 5) * 5,
    targetCarbs: Math.round((carbCalories / 4) / 5) * 5,
    targetFat: Math.round(fatGrams / 5) * 5,
  };
}
