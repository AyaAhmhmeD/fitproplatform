// Shared domain types for the FitPro mobile app.
//
// These are hand-mirrored from the web app's `web/src/types/index.ts` and its
// `web/prisma/schema.prisma`. The two projects are separate npm packages (a
// Next.js server app and an Expo app), so there's no way to literally import
// one's types into the other — keep this file in sync by hand whenever the
// backend's shapes change.

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

// ── AI nutrition content ────────────────────────────────────────────────

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

// ── Workout content ─────────────────────────────────────────────────────

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

// ── Persisted entities (mirrors prisma/schema.prisma) ───────────────────
// Dates come back over JSON as ISO strings, not Date instances.

export interface UserSummary {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string | null;
  phone?: string | null;
  createdAt?: string;
  isActive?: boolean;
}

export interface TrainerProfile {
  id: string;
  userId: string;
  user: UserSummary;
  bio?: string | null;
  specialties: string[];
  yearsExperience?: number | null;
  createdAt: string;
  _count?: { clients: number };
}

export interface Measurement {
  id: string;
  clientId: string;
  date: string;
  weightKg?: number | null;
  bodyFatPct?: number | null;
  muscleMassKg?: number | null;
  bmi?: number | null;
  waistCm?: number | null;
  chestCm?: number | null;
  hipCm?: number | null;
  armCm?: number | null;
  thighCm?: number | null;
  notes?: string | null;
  source: MeasurementSource;
  createdAt: string;
}

export interface ProgressPhoto {
  id: string;
  clientId: string;
  url: string;
  angle: PhotoAngle;
  takenAt: string;
  notes?: string | null;
  createdAt: string;
}

export interface BodyAnalysisReport {
  id: string;
  clientId: string;
  uploadedById: string;
  fileUrl: string;
  fileName: string;
  extractedData: unknown;
  summary?: string | null;
  createdAt: string;
}

export interface Attendance {
  id: string;
  clientId: string;
  date: string;
  status: AttendanceStatus;
  notes?: string | null;
}

export interface MealPlan {
  id: string;
  clientId: string;
  goal: Goal;
  bmr: number;
  tdee: number;
  calories: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
  waterMl: number;
  meals: MealPlanContent;
  supplements?: string[] | null;
  alternatives?: string[] | null;
  shoppingList?: string[] | null;
  generatedBy: PlanGeneratedBy;
  status: PlanStatus;
  weekStart: string;
  createdAt: string;
  updatedAt: string;
}

export interface WorkoutPlan {
  id: string;
  clientId: string;
  style: TrainingStyle;
  experience: ExperienceLevel;
  daysPerWeek: number;
  schedule: WorkoutSchedule;
  generatedBy: PlanGeneratedBy;
  status: PlanStatus;
  weekStart: string;
  createdAt: string;
  updatedAt: string;
}

export interface ClientProfile {
  id: string;
  userId: string;
  user: UserSummary;
  trainerId?: string | null;
  trainer?: (TrainerProfile & { user: { name: string; id?: string } }) | null;

  age?: number | null;
  gender?: Gender | null;
  heightCm?: number | null;
  goal: Goal;
  activityLevel: ActivityLevel;
  experience: ExperienceLevel;
  injuries?: string | null;
  diseases?: string | null;
  sleepHours?: number | null;
  waterIntakeMl?: number | null;

  subscriptionStatus: SubscriptionStatus;
  subscriptionStart?: string | null;
  subscriptionEnd?: string | null;

  createdAt: string;
  updatedAt: string;

  // Present depending on which endpoint returned this object — the list
  // endpoint (`GET /api/clients`) only includes the latest measurement,
  // while `GET /api/clients/:id` includes full history + plans + photos.
  measurements?: Measurement[];
  bodyAnalyses?: BodyAnalysisReport[];
  progressPhotos?: ProgressPhoto[];
  mealPlans?: MealPlan[];
  workoutPlans?: WorkoutPlan[];
  attendances?: Attendance[];
}

export interface Exercise {
  id: string;
  name: string;
  nameAr?: string | null;
  slug: string;
  muscleGroup: string;
  secondaryMuscles: string[];
  difficulty: Difficulty;
  equipment: string;
  instructions: string;
  instructionsAr?: string | null;
  commonMistakes?: string | null;
  imageUrl?: string | null;
  videoUrl?: string | null;
  animationUrl?: string | null;
  alternativeSlugs: string[];
  createdAt: string;
}

export interface AppNotification {
  id: string;
  recipientId: string;
  senderId?: string | null;
  type: NotificationType;
  title: string;
  titleAr?: string | null;
  body: string;
  bodyAr?: string | null;
  read: boolean;
  createdAt: string;
}
