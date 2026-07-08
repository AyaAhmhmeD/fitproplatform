import type { ClientIntakeInput, MealPlanContent, NutritionTargets } from "@/types";
import { generateWithAI, extractJson } from "@/lib/ai/providers";
import { generateDeterministicMealPlan } from "@/lib/nutrition/generator";

export interface GeneratedMealPlan {
  meals: MealPlanContent;
  supplements: string[];
  alternatives: string[];
  shoppingList: string[];
  source: "ai" | "template";
}

const SYSTEM_PROMPT = `You are a certified sports nutritionist creating a precise, structured daily meal plan.
Always respond with STRICT JSON only, matching exactly this TypeScript shape (no markdown, no commentary):
{
  "meals": {
    "breakfast": { "name": string, "nameAr": string, "calories": number, "proteinG": number, "carbsG": number, "fatG": number, "items": string[] },
    "morningSnack": { ...same shape... },
    "lunch": { ...same shape... },
    "afternoonSnack": { ...same shape... },
    "dinner": { ...same shape... }
  },
  "supplements": string[],
  "alternatives": string[],
  "shoppingList": string[]
}
The sum of each meal's calories must be very close to the client's total daily calorie target. Respect the client's injuries/diseases by avoiding contraindicated foods. Give practical, regionally-common foods (include Middle Eastern staples like chicken, rice, lentils, labneh, hummus when appropriate). "nameAr" must be a natural Arabic translation of the meal name.`;

function buildPrompt(intake: ClientIntakeInput, targets: NutritionTargets): string {
  return `Client profile:
- Age: ${intake.age}, Gender: ${intake.gender}
- Height: ${intake.heightCm}cm, Weight: ${intake.weightKg}kg
- Goal: ${intake.goal}
- Activity level: ${intake.activityLevel}
- Training experience: ${intake.experience}
- Injuries: ${intake.injuries || "none"}
- Diseases: ${intake.diseases || "none"}

Calculated targets (MUST match, do not recompute):
- BMI: ${targets.bmi}
- BMR: ${targets.bmr} kcal
- TDEE: ${targets.tdee} kcal
- Daily calorie target: ${targets.calories} kcal
- Protein: ${targets.proteinG}g, Carbs: ${targets.carbsG}g, Fat: ${targets.fatG}g
- Water: ${targets.waterMl}ml

Generate the full daily meal plan now as JSON only.`;
}

/**
 * Generates a complete meal plan. Tries the configured LLM provider first for
 * a personalized plan; transparently falls back to the deterministic
 * template generator (same output shape) if no provider is configured or the
 * AI call fails/returns malformed JSON — the feature always works.
 */
export async function generateMealPlan(
  intake: ClientIntakeInput,
  targets: NutritionTargets,
  variantSeed = 0,
): Promise<GeneratedMealPlan> {
  const aiResponse = await generateWithAI({
    system: SYSTEM_PROMPT,
    prompt: buildPrompt(intake, targets),
    json: true,
    maxTokens: 2200,
  });

  if (aiResponse) {
    const parsed = extractJson<Omit<GeneratedMealPlan, "source">>(aiResponse);
    if (parsed?.meals?.breakfast && parsed.meals.dinner) {
      return { ...parsed, source: "ai" };
    }
  }

  const fallback = generateDeterministicMealPlan(targets, intake.goal, variantSeed);
  return { ...fallback, source: "template" };
}
