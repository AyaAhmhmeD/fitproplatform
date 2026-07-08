import type { ActivityLevel, Gender, Goal, NutritionTargets } from "@/types";

const ACTIVITY_MULTIPLIER: Record<ActivityLevel, number> = {
  SEDENTARY: 1.2,
  LIGHT: 1.375,
  MODERATE: 1.55,
  ACTIVE: 1.725,
  VERY_ACTIVE: 1.9,
};

/** Body Mass Index. */
export function calculateBMI(weightKg: number, heightCm: number): number {
  const heightM = heightCm / 100;
  return Number((weightKg / (heightM * heightM)).toFixed(1));
}

/** Basal Metabolic Rate — Mifflin-St Jeor equation (most accurate general-purpose formula). */
export function calculateBMR(params: {
  weightKg: number;
  heightCm: number;
  age: number;
  gender: Gender;
}): number {
  const { weightKg, heightCm, age, gender } = params;
  const base = 10 * weightKg + 6.25 * heightCm - 5 * age;
  return Math.round(gender === "MALE" ? base + 5 : base - 161);
}

/** Total Daily Energy Expenditure. */
export function calculateTDEE(bmr: number, activityLevel: ActivityLevel): number {
  return Math.round(bmr * ACTIVITY_MULTIPLIER[activityLevel]);
}

const GOAL_CALORIE_ADJUSTMENT: Record<Goal, number> = {
  FAT_LOSS: -0.2, // ~20% deficit
  MUSCLE_GAIN: 0.12, // ~12% surplus
  RECOMPOSITION: -0.05, // small deficit, protein-forward
  MAINTENANCE: 0,
};

/** Macro split as { proteinG per kg, fat % of calories }, carbs fill the remainder. */
const GOAL_MACRO_PROFILE: Record<Goal, { proteinPerKg: number; fatPctOfCalories: number }> = {
  FAT_LOSS: { proteinPerKg: 2.2, fatPctOfCalories: 0.3 },
  MUSCLE_GAIN: { proteinPerKg: 2.0, fatPctOfCalories: 0.25 },
  RECOMPOSITION: { proteinPerKg: 2.4, fatPctOfCalories: 0.28 },
  MAINTENANCE: { proteinPerKg: 1.8, fatPctOfCalories: 0.3 },
};

export interface MacroTargets {
  calories: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
}

export function calculateCalorieTarget(tdee: number, goal: Goal): number {
  return Math.round(tdee * (1 + GOAL_CALORIE_ADJUSTMENT[goal]));
}

export function calculateMacros(params: {
  calories: number;
  weightKg: number;
  goal: Goal;
}): MacroTargets {
  const { calories, weightKg, goal } = params;
  const profile = GOAL_MACRO_PROFILE[goal];

  const proteinG = Math.round(weightKg * profile.proteinPerKg);
  const proteinCalories = proteinG * 4;

  const fatCalories = calories * profile.fatPctOfCalories;
  const fatG = Math.round(fatCalories / 9);

  const remainingCalories = Math.max(calories - proteinCalories - fatG * 9, 0);
  const carbsG = Math.round(remainingCalories / 4);

  return { calories, proteinG, carbsG, fatG };
}

/** Recommended daily water intake in mL: 35ml/kg body weight, +500ml for active/very active. */
export function calculateWaterIntake(weightKg: number, activityLevel: ActivityLevel): number {
  const base = weightKg * 35;
  const bonus = activityLevel === "ACTIVE" || activityLevel === "VERY_ACTIVE" ? 500 : 0;
  return Math.round((base + bonus) / 50) * 50; // round to nearest 50ml
}

/** Runs the full pipeline: BMI → BMR → TDEE → calories → macros → water. */
export function calculateNutritionTargets(params: {
  weightKg: number;
  heightCm: number;
  age: number;
  gender: Gender;
  activityLevel: ActivityLevel;
  goal: Goal;
}): NutritionTargets {
  const bmi = calculateBMI(params.weightKg, params.heightCm);
  const bmr = calculateBMR(params);
  const tdee = calculateTDEE(bmr, params.activityLevel);
  const calories = calculateCalorieTarget(tdee, params.goal);
  const macros = calculateMacros({ calories, weightKg: params.weightKg, goal: params.goal });
  const waterMl = calculateWaterIntake(params.weightKg, params.activityLevel);

  return {
    bmi,
    bmr,
    tdee,
    calories: macros.calories,
    proteinG: macros.proteinG,
    carbsG: macros.carbsG,
    fatG: macros.fatG,
    waterMl,
  };
}

export function bmiCategory(bmi: number): "underweight" | "normal" | "overweight" | "obese" {
  if (bmi < 18.5) return "underweight";
  if (bmi < 25) return "normal";
  if (bmi < 30) return "overweight";
  return "obese";
}
