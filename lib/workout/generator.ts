import type { ExperienceLevel, TrainingStyle, WorkoutDay, WorkoutSchedule } from "@/types";
import { EXERCISE_POOLS, type MuscleFocus, type PoolExercise } from "@/lib/workout/exercise-pools";

interface DayPlanTemplate {
  focus: string;
  pools: { pool: MuscleFocus; count: number }[];
}

interface StyleConfig {
  cycle: DayPlanTemplate[];
  sets: number;
  reps: string;
  restSeconds: number;
  tempo: string;
  notes?: string;
}

const DEFAULT_DAYS_BY_EXPERIENCE: Record<ExperienceLevel, number> = {
  BEGINNER: 3,
  INTERMEDIATE: 4,
  ADVANCED: 5,
};

const PPL_CYCLE: DayPlanTemplate[] = [
  { focus: "Push (Chest, Shoulders, Triceps)", pools: [{ pool: "chest", count: 2 }, { pool: "shoulders", count: 2 }, { pool: "arms", count: 1 }] },
  { focus: "Pull (Back, Biceps)", pools: [{ pool: "back", count: 3 }, { pool: "arms", count: 1 }] },
  { focus: "Legs", pools: [{ pool: "legs", count: 4 }, { pool: "core", count: 1 }] },
];

const UPPER_LOWER_CYCLE: DayPlanTemplate[] = [
  { focus: "Upper Body", pools: [{ pool: "chest", count: 2 }, { pool: "back", count: 2 }, { pool: "shoulders", count: 1 }, { pool: "arms", count: 1 }] },
  { focus: "Lower Body", pools: [{ pool: "legs", count: 4 }, { pool: "core", count: 1 }] },
];

const BRO_SPLIT_CYCLE: DayPlanTemplate[] = [
  { focus: "Chest", pools: [{ pool: "chest", count: 4 }, { pool: "core", count: 1 }] },
  { focus: "Back", pools: [{ pool: "back", count: 4 }, { pool: "core", count: 1 }] },
  { focus: "Legs", pools: [{ pool: "legs", count: 5 }] },
  { focus: "Shoulders", pools: [{ pool: "shoulders", count: 4 }] },
  { focus: "Arms", pools: [{ pool: "arms", count: 4 }, { pool: "core", count: 1 }] },
];

const FULL_BODY_CYCLE: DayPlanTemplate[] = [
  { focus: "Full Body A", pools: [{ pool: "legs", count: 2 }, { pool: "chest", count: 1 }, { pool: "back", count: 1 }, { pool: "core", count: 1 }] },
  { focus: "Full Body B", pools: [{ pool: "legs", count: 1 }, { pool: "shoulders", count: 1 }, { pool: "back", count: 1 }, { pool: "arms", count: 1 }, { pool: "core", count: 1 }] },
];

const HOME_CYCLE: DayPlanTemplate[] = [
  { focus: "Full Body (Home) A", pools: [{ pool: "fullBodyHome", count: 5 }] },
  { focus: "Full Body (Home) B", pools: [{ pool: "fullBodyHome", count: 4 }, { pool: "cardio", count: 2 }] },
];

const FAT_LOSS_CYCLE: DayPlanTemplate[] = [
  { focus: "Full Body Circuit A", pools: [{ pool: "legs", count: 2 }, { pool: "chest", count: 1 }, { pool: "back", count: 1 }, { pool: "cardio", count: 2 }] },
  { focus: "Full Body Circuit B", pools: [{ pool: "shoulders", count: 1 }, { pool: "arms", count: 1 }, { pool: "core", count: 2 }, { pool: "cardio", count: 2 }] },
];

const STYLE_CONFIG: Record<TrainingStyle, StyleConfig> = {
  PUSH_PULL_LEGS: { cycle: PPL_CYCLE, sets: 4, reps: "8-12", restSeconds: 90, tempo: "2-0-2-0" },
  UPPER_LOWER: { cycle: UPPER_LOWER_CYCLE, sets: 4, reps: "8-12", restSeconds: 90, tempo: "2-0-2-0" },
  BRO_SPLIT: { cycle: BRO_SPLIT_CYCLE, sets: 4, reps: "8-15", restSeconds: 75, tempo: "2-0-2-0" },
  FULL_BODY: { cycle: FULL_BODY_CYCLE, sets: 3, reps: "10-12", restSeconds: 75, tempo: "2-0-2-0" },
  STRENGTH: { cycle: UPPER_LOWER_CYCLE, sets: 5, reps: "3-6", restSeconds: 150, tempo: "2-1-X-1", notes: "Prioritize progressive overload on the main compound lift each session." },
  HYPERTROPHY: { cycle: PPL_CYCLE, sets: 4, reps: "8-15", restSeconds: 60, tempo: "3-0-1-1", notes: "Chase a controlled eccentric and a full stretch on every rep." },
  FAT_LOSS: { cycle: FAT_LOSS_CYCLE, sets: 3, reps: "15-20", restSeconds: 30, tempo: "1-0-1-0", notes: "Keep rest short — treat each round as a circuit where possible." },
  HOME_WORKOUT: { cycle: HOME_CYCLE, sets: 3, reps: "12-20", restSeconds: 45, tempo: "2-0-2-0", notes: "No equipment required — add a backpack of books for extra resistance as you progress." },
  GYM_WORKOUT: { cycle: UPPER_LOWER_CYCLE, sets: 4, reps: "8-12", restSeconds: 90, tempo: "2-0-2-0" },
};

function takeExercises(pool: MuscleFocus, count: number, offset: number): PoolExercise[] {
  const list = EXERCISE_POOLS[pool];
  const result: PoolExercise[] = [];
  for (let i = 0; i < count; i++) {
    result.push(list[(offset + i) % list.length]);
  }
  return result;
}

/**
 * Deterministic (no-AI) workout-plan generator — always available.
 * `daysPerWeek` defaults from experience level but can be overridden.
 */
export function generateDeterministicWorkoutPlan(params: {
  style: TrainingStyle;
  experience: ExperienceLevel;
  daysPerWeek?: number;
}): WorkoutSchedule {
  const config = STYLE_CONFIG[params.style];
  const daysPerWeek = Math.min(
    6,
    Math.max(2, params.daysPerWeek ?? DEFAULT_DAYS_BY_EXPERIENCE[params.experience]),
  );

  const days: WorkoutDay[] = [];

  for (let i = 0; i < daysPerWeek; i++) {
    const template = config.cycle[i % config.cycle.length];
    const exercises = template.pools.flatMap(({ pool, count }) =>
      takeExercises(pool, count, i).map((ex) => ({
        exerciseSlug: ex.slug,
        exerciseName: ex.name,
        sets: config.sets,
        reps: config.reps,
        restSeconds: config.restSeconds,
        tempo: config.tempo,
        notes: config.notes,
      })),
    );

    days.push({
      day: `Day ${i + 1}`,
      focus: template.focus,
      exercises,
    });
  }

  const restDaysCount = 7 - daysPerWeek;
  for (let i = 0; i < restDaysCount; i++) {
    days.push({
      day: `Day ${daysPerWeek + i + 1}`,
      focus: "Rest & Recovery",
      exercises: [],
      isRestDay: true,
    });
  }

  return { days };
}
