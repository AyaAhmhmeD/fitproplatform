import type { ExperienceLevel, TrainingStyle, WorkoutSchedule } from "@/types";
import { generateWithAI, extractJson } from "@/lib/ai/providers";
import { generateDeterministicWorkoutPlan } from "@/lib/workout/generator";
import { EXERCISE_POOLS } from "@/lib/workout/exercise-pools";

export interface GeneratedWorkoutPlan {
  schedule: WorkoutSchedule;
  source: "ai" | "template";
}

const ALL_SLUGS = Object.values(EXERCISE_POOLS)
  .flat()
  .map((e) => `${e.slug} (${e.name})`)
  .filter((v, i, arr) => arr.indexOf(v) === i)
  .join(", ");

const SYSTEM_PROMPT = `You are a certified strength & conditioning coach building a structured weekly training program.
Respond with STRICT JSON only, matching this TypeScript shape (no markdown, no commentary):
{
  "days": [
    {
      "day": string,
      "focus": string,
      "isRestDay": boolean (optional),
      "exercises": [
        { "exerciseSlug": string, "exerciseName": string, "sets": number, "reps": string, "restSeconds": number, "tempo": string, "notes": string (optional) }
      ]
    }
  ]
}
You MUST only use "exerciseSlug" values from this exact allowed list (pick the closest match, never invent new slugs): ${ALL_SLUGS}.
Produce exactly 7 entries in "days" (training days plus rest days) representing one full week.`;

function buildPrompt(params: {
  style: TrainingStyle;
  experience: ExperienceLevel;
  daysPerWeek: number;
  injuries?: string;
  equipment?: string;
}): string {
  return `Client profile:
- Training style requested: ${params.style}
- Experience level: ${params.experience}
- Training days per week: ${params.daysPerWeek}
- Injuries to work around: ${params.injuries || "none"}
- Available equipment: ${params.equipment || "full commercial gym"}

Generate the full weekly training schedule now as JSON only.`;
}

/**
 * Generates a full weekly workout plan. Tries the configured LLM provider
 * first; falls back to the deterministic template generator (same output
 * shape) if no provider is configured or the AI call fails/returns
 * malformed data — the feature always works with zero API keys.
 */
export async function generateWorkoutPlan(params: {
  style: TrainingStyle;
  experience: ExperienceLevel;
  daysPerWeek: number;
  injuries?: string;
  equipment?: string;
}): Promise<GeneratedWorkoutPlan> {
  const aiResponse = await generateWithAI({
    system: SYSTEM_PROMPT,
    prompt: buildPrompt(params),
    json: true,
    maxTokens: 3000,
  });

  if (aiResponse) {
    const parsed = extractJson<WorkoutSchedule>(aiResponse);
    if (parsed?.days?.length) {
      return { schedule: parsed, source: "ai" };
    }
  }

  const schedule = generateDeterministicWorkoutPlan(params);
  return { schedule, source: "template" };
}
