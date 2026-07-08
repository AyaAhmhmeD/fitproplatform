import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireApiRole, isSessionUser } from "@/lib/auth/session";
import { uploadFile } from "@/lib/storage/upload";
import {
  generateClientProgressPdf,
  generateMealPlanPdf,
  generateWorkoutPlanPdf,
} from "@/lib/reports/pdf";
import type { MealPlanContent, ReportKind, WorkoutSchedule } from "@/types";

const VALID_KINDS = ["progress", "meal", "workout"] as const;
type PdfKind = (typeof VALID_KINDS)[number];

const KIND_MAP: Record<PdfKind, ReportKind> = {
  progress: "CLIENT_PROGRESS",
  meal: "MEAL_PLAN",
  workout: "WORKOUT_PLAN",
};

/** POST /api/reports/pdf — generates a branded PDF report and stores it in Supabase Storage. */
export async function POST(request: NextRequest) {
  const session = await requireApiRole("ADMIN", "TRAINER");
  if (!isSessionUser(session)) return session;

  const body = await request.json();
  const { clientId, kind } = body as { clientId?: string; kind?: string };

  if (!clientId || typeof clientId !== "string") {
    return NextResponse.json({ error: "clientId is required" }, { status: 400 });
  }
  if (!kind || !VALID_KINDS.includes(kind as PdfKind)) {
    return NextResponse.json(
      { error: "kind must be one of: progress, meal, workout" },
      { status: 400 },
    );
  }
  const pdfKind = kind as PdfKind;

  const client = await prisma.clientProfile.findUnique({
    where: { id: clientId },
    include: {
      user: { select: { name: true, email: true } },
      trainer: true,
    },
  });

  if (!client) return NextResponse.json({ error: "Client not found" }, { status: 404 });
  if (session.role === "TRAINER" && client.trainer?.userId !== session.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  let buffer: Buffer;

  if (pdfKind === "progress") {
    const [measurements, mealPlan, workoutPlan] = await Promise.all([
      prisma.measurement.findMany({ where: { clientId }, orderBy: { date: "asc" } }),
      prisma.mealPlan.findFirst({ where: { clientId, status: "ACTIVE" }, orderBy: { createdAt: "desc" } }),
      prisma.workoutPlan.findFirst({ where: { clientId, status: "ACTIVE" }, orderBy: { createdAt: "desc" } }),
    ]);

    buffer = await generateClientProgressPdf({
      client: { name: client.user.name, email: client.user.email, goal: client.goal },
      measurements,
      mealPlan: mealPlan
        ? {
            calories: mealPlan.calories,
            proteinG: mealPlan.proteinG,
            carbsG: mealPlan.carbsG,
            fatG: mealPlan.fatG,
          }
        : null,
      workoutPlan: workoutPlan
        ? { style: workoutPlan.style, daysPerWeek: workoutPlan.daysPerWeek }
        : null,
    });
  } else if (pdfKind === "meal") {
    const mealPlan = await prisma.mealPlan.findFirst({
      where: { clientId, status: "ACTIVE" },
      orderBy: { createdAt: "desc" },
    });
    if (!mealPlan) {
      return NextResponse.json({ error: "Client has no active meal plan yet" }, { status: 422 });
    }

    buffer = await generateMealPlanPdf({
      clientName: client.user.name,
      goal: client.goal,
      targets: {
        calories: mealPlan.calories,
        proteinG: mealPlan.proteinG,
        carbsG: mealPlan.carbsG,
        fatG: mealPlan.fatG,
        waterMl: mealPlan.waterMl,
      },
      meals: mealPlan.meals as unknown as MealPlanContent,
      supplements: (mealPlan.supplements as string[] | null) ?? [],
      alternatives: (mealPlan.alternatives as string[] | null) ?? [],
      shoppingList: (mealPlan.shoppingList as string[] | null) ?? [],
    });
  } else {
    const workoutPlan = await prisma.workoutPlan.findFirst({
      where: { clientId, status: "ACTIVE" },
      orderBy: { createdAt: "desc" },
    });
    if (!workoutPlan) {
      return NextResponse.json({ error: "Client has no active workout plan yet" }, { status: 422 });
    }

    buffer = await generateWorkoutPlanPdf({
      clientName: client.user.name,
      style: workoutPlan.style,
      daysPerWeek: workoutPlan.daysPerWeek,
      schedule: workoutPlan.schedule as unknown as WorkoutSchedule,
    });
  }

  const url = await uploadFile({
    bucket: "documents",
    path: `reports/${clientId}/${pdfKind}-${Date.now()}.pdf`,
    file: buffer,
    contentType: "application/pdf",
  });

  const report = await prisma.report.create({
    data: {
      clientId,
      kind: KIND_MAP[pdfKind],
      format: "PDF",
      fileUrl: url,
      generatedById: session.id,
    },
  });

  return NextResponse.json({ url, report });
}
