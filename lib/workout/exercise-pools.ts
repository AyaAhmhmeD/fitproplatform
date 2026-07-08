/**
 * Canonical exercise slugs, grouped by muscle focus. These slugs are the
 * single source of truth shared between the workout generator and the
 * exercise-library seed data (prisma/seed.ts) — every slug referenced here
 * MUST have a matching Exercise row.
 */

export interface PoolExercise {
  slug: string;
  name: string;
}

export const EXERCISE_POOLS = {
  chest: [
    { slug: "barbell-bench-press", name: "Barbell Bench Press" },
    { slug: "incline-dumbbell-press", name: "Incline Dumbbell Press" },
    { slug: "push-up", name: "Push-Up" },
    { slug: "cable-chest-fly", name: "Cable Chest Fly" },
    { slug: "dips-chest", name: "Chest Dips" },
  ],
  back: [
    { slug: "deadlift", name: "Deadlift" },
    { slug: "pull-up", name: "Pull-Up" },
    { slug: "barbell-row", name: "Barbell Bent-Over Row" },
    { slug: "lat-pulldown", name: "Lat Pulldown" },
    { slug: "seated-cable-row", name: "Seated Cable Row" },
  ],
  legs: [
    { slug: "barbell-back-squat", name: "Barbell Back Squat" },
    { slug: "romanian-deadlift", name: "Romanian Deadlift" },
    { slug: "walking-lunge", name: "Walking Lunge" },
    { slug: "leg-press", name: "Leg Press" },
    { slug: "leg-curl", name: "Lying Leg Curl" },
    { slug: "calf-raise", name: "Standing Calf Raise" },
  ],
  shoulders: [
    { slug: "overhead-press", name: "Barbell Overhead Press" },
    { slug: "lateral-raise", name: "Dumbbell Lateral Raise" },
    { slug: "rear-delt-fly", name: "Rear Delt Fly" },
    { slug: "face-pull", name: "Face Pull" },
  ],
  arms: [
    { slug: "barbell-curl", name: "Barbell Curl" },
    { slug: "hammer-curl", name: "Hammer Curl" },
    { slug: "triceps-pushdown", name: "Triceps Pushdown" },
    { slug: "close-grip-bench-press", name: "Close-Grip Bench Press" },
  ],
  core: [
    { slug: "plank", name: "Plank" },
    { slug: "hanging-leg-raise", name: "Hanging Leg Raise" },
    { slug: "cable-crunch", name: "Cable Crunch" },
    { slug: "russian-twist", name: "Russian Twist" },
  ],
  fullBodyHome: [
    { slug: "bodyweight-squat", name: "Bodyweight Squat" },
    { slug: "push-up", name: "Push-Up" },
    { slug: "glute-bridge", name: "Glute Bridge" },
    { slug: "plank", name: "Plank" },
    { slug: "jumping-jack", name: "Jumping Jack" },
    { slug: "mountain-climber", name: "Mountain Climber" },
    { slug: "walking-lunge", name: "Walking Lunge" },
  ],
  cardio: [
    { slug: "burpee", name: "Burpee" },
    { slug: "jumping-jack", name: "Jumping Jack" },
    { slug: "mountain-climber", name: "Mountain Climber" },
    { slug: "high-knees", name: "High Knees" },
  ],
} satisfies Record<string, PoolExercise[]>;

export type MuscleFocus = keyof typeof EXERCISE_POOLS;
