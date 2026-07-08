// Shared domain types, mirrored from prisma/schema.prisma.
// Kept as plain string-union types (rather than importing Prisma's generated
// enums) so client components can use them without pulling in server code.

export type Role = "ADMIN" | "TRAINER" | "CLIENT";

export type Gender = "MALE" | "FEMALE";

export type Goal = "FAT_LOSS" | "MUSCLE_GAIN" | "RECOMPOSITION" | "MAINTENANCE";

export type ActivityLevel =
  | "SEDENTARY"
  | "LIGHT"
  | "MODERATE"
  | "ACTIVE"
  | "VERY_ACTIVE";

export type ExperienceLevel = "BEGINNER" | "INTERMEDIATE" | "ADVANCED";

export type TrainingStyle =
  | "PUSH_PULL_LEGS"
  | "UPPER_LOWER"
  | "BRO_SPLIT"
  | "FULL_BODY"
  | "STRENGTH"
  | "HYPERTROPHY"
  | "FAT_LOSS"
  | "HOME_WORKOUT"
  | "GYM_WORKOUT";

export type PlanGeneratedBy = "AI" | "TRAINER";
export type PlanStatus = "DRAFT" | "ACTIVE" | "ARCHIVED";
export type SubscriptionStatus = "TRIAL" | "ACTIVE" | "EXPIRED" | "CANCELLED";
export type NotificationType =
  | "MEAL_REMINDER"
  | "WORKOUT_REMINDER"
  | "WATER_REMINDER"
  | "SLEEP_REMINDER"
  | "WEEKLY_REPORT"
  | "GENERAL";
export type MeasurementSource = "MANUAL" | "PDF_EXTRACTED" | "TRAINER";
export type PhotoAngle = "FRONT" | "SIDE" | "BACK";
export type Difficulty = "BEGINNER" | "INTERMEDIATE" | "ADVANCED";
export type AttendanceStatus = "PRESENT" | "ABSENT" | "EXCUSED";
export type ReportFormat = "PDF" | "EXCEL";
export type ReportKind =
  | "CLIENT_PROGRESS"
  | "MEAL_PLAN"
  | "WORKOUT_PLAN"
  | "ANALYTICS"
  | "ATTENDANCE";

export interface MealEntry {
  name: string;
  nameAr?: string;
  description?: string;
  calories: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
  items: string[];
}

export interface MealPlanContent {
  breakfast: MealEntry;
  morningSnack: MealEntry;
  lunch: MealEntry;
  afternoonSnack: MealEntry;
  dinner: MealEntry;
}

export interface ExerciseSetPrescription {
  exerciseSlug: string;
  exerciseName: string;
  sets: number;
  reps: string; // e.g. "8-12"
  restSeconds: number;
  tempo: string; // e.g. "2-0-2-0"
  notes?: string;
}

export interface WorkoutDay {
  day: string; // e.g. "Monday" or "Day 1"
  focus: string; // e.g. "Push (Chest, Shoulders, Triceps)"
  exercises: ExerciseSetPrescription[];
  isRestDay?: boolean;
}

export interface WorkoutSchedule {
  days: WorkoutDay[];
}

export interface NutritionTargets {
  bmi: number;
  bmr: number;
  tdee: number;
  calories: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
  waterMl: number;
}

export interface ClientIntakeInput {
  name: string;
  age: number;
  gender: Gender;
  heightCm: number;
  weightKg: number;
  goal: Goal;
  activityLevel: ActivityLevel;
  experience: ExperienceLevel;
  injuries?: string;
  diseases?: string;
  sleepHours?: number;
  waterIntakeMl?: number;
}
