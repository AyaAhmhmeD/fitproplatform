import { z } from "zod";

export const clientIntakeSchema = z.object({
  name: z.string().min(2, "Name is too short"),
  email: z.string().email(),
  age: z.coerce.number().int().min(10).max(100),
  gender: z.enum(["MALE", "FEMALE"]),
  heightCm: z.coerce.number().min(100).max(250),
  weightKg: z.coerce.number().min(30).max(300),
  goal: z.enum(["FAT_LOSS", "MUSCLE_GAIN", "RECOMPOSITION", "MAINTENANCE"]),
  activityLevel: z.enum(["SEDENTARY", "LIGHT", "MODERATE", "ACTIVE", "VERY_ACTIVE"]),
  experience: z.enum(["BEGINNER", "INTERMEDIATE", "ADVANCED"]),
  injuries: z.string().optional(),
  diseases: z.string().optional(),
  sleepHours: z.coerce.number().min(0).max(14).optional(),
  waterIntakeMl: z.coerce.number().min(0).max(10000).optional(),
});
export type ClientIntakeFormValues = z.infer<typeof clientIntakeSchema>;

export const measurementSchema = z.object({
  weightKg: z.coerce.number().min(20).max(400).optional(),
  bodyFatPct: z.coerce.number().min(1).max(70).optional(),
  muscleMassKg: z.coerce.number().min(10).max(150).optional(),
  waistCm: z.coerce.number().min(30).max(250).optional(),
  chestCm: z.coerce.number().min(30).max(250).optional(),
  hipCm: z.coerce.number().min(30).max(250).optional(),
  armCm: z.coerce.number().min(10).max(100).optional(),
  thighCm: z.coerce.number().min(10).max(150).optional(),
  notes: z.string().optional(),
});
export type MeasurementFormValues = z.infer<typeof measurementSchema>;

export const mealPlanGenerateSchema = z.object({
  clientId: z.string().uuid(),
  variantSeed: z.coerce.number().int().min(0).max(50).optional(),
});

export const workoutPlanGenerateSchema = z.object({
  clientId: z.string().uuid(),
  style: z.enum([
    "PUSH_PULL_LEGS",
    "UPPER_LOWER",
    "BRO_SPLIT",
    "FULL_BODY",
    "STRENGTH",
    "HYPERTROPHY",
    "FAT_LOSS",
    "HOME_WORKOUT",
    "GYM_WORKOUT",
  ]),
  daysPerWeek: z.coerce.number().int().min(2).max(6).optional(),
  equipment: z.string().optional(),
});

export const createTrainerSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  phone: z.string().optional(),
  bio: z.string().optional(),
  specialties: z.array(z.string()).optional(),
});

export const notificationSchema = z.object({
  recipientId: z.string().uuid().optional(),
  broadcastRole: z.enum(["ADMIN", "TRAINER", "CLIENT"]).optional(),
  type: z.enum([
    "MEAL_REMINDER",
    "WORKOUT_REMINDER",
    "WATER_REMINDER",
    "SLEEP_REMINDER",
    "WEEKLY_REPORT",
    "GENERAL",
  ]),
  title: z.string().min(1),
  titleAr: z.string().optional(),
  body: z.string().min(1),
  bodyAr: z.string().optional(),
});
