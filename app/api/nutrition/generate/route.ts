import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireApiRole, isSessionUser } from "@/lib/auth/session";
import { mealPlanGenerateSchema } from "@/lib/validation";
import { calculateNutritionTargets } from "@/lib/nutrition/calculations";
import { generateMealPlan } from "@/lib/nutrition/ai";

/** POST /api/nutrition/generate — computes BMI/BMR/TDEE/macros then generates a full meal plan. */
export async function POST(request: NextRequest) {
  const session = await requireApiRole("ADMIN", "TRAINER");
  if (!isSessionUser(session)) return session;

  const body = await request.json();
  const parsed = mealPlanGenerateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const client = await prisma.clientProfile.findUnique({
    where: { id: parsed.data.clientId },
    include: {
      user: true,
      measurements: { orderBy: { date: "desc" }, take: 1 },
      trainer: true,
    },
  });

  if (!client) return NextResponse.json({ error: "Client not found" }, { status: 404 });
  if (session.role === "TRAINER" && client.trainer?.userId !== session.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  if (!client.age || !client.gender || !client.heightCm || !client.measurements[0]?.weightKg) {
    return NextResponse.json(
      { error: "Client is missing required intake data (age, gender, height, weight)" },
      { status: 422 },
    );
  }

  const intake = {
    name: client.user.name,
    age: client.age,
    gender: client.gender,
    heightCm: client.heightCm,
    weightKg: client.measurements[0].weightKg,
    goal: client.goal,
    activityLevel: client.activityLevel,
    experience: client.experience,
    injuries: client.injuries ?? undefined,
    diseases: client.diseases ?? undefined,
  };

  const targets = calculateNutritionTargets(intake);
  const generated = await generateMealPlan(intake, targets, parsed.data.variantSeed ?? 0);

  await prisma.mealPlan.updateMany({
    where: { clientId: client.id, status: "ACTIVE" },
    data: { status: "ARCHIVED" },
  });

  const mealPlan = await prisma.mealPlan.create({
    data: {
      clientId: client.id,
      goal: client.goal,
      bmr: targets.bmr,
      tdee: targets.tdee,
      calories: targets.calories,
      proteinG: targets.proteinG,
      carbsG: targets.carbsG,
      fatG: targets.fatG,
      waterMl: targets.waterMl,
      meals: generated.meals,
      supplements: generated.supplements,
      alternatives: generated.alternatives,
      shoppingList: generated.shoppingList,
      generatedBy: "AI",
      status: "ACTIVE",
    },
  });

  return NextResponse.json({ mealPlan, targets, source: generated.source });
}
