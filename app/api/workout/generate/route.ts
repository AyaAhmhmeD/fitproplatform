import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireApiRole, isSessionUser } from "@/lib/auth/session";
import { workoutPlanGenerateSchema } from "@/lib/validation";
import { generateWorkoutPlan } from "@/lib/workout/ai";
import type { ExperienceLevel } from "@/types";

/** POST /api/workout/generate — generates a full weekly training program for a client. */
export async function POST(request: NextRequest) {
  const session = await requireApiRole("ADMIN", "TRAINER");
  if (!isSessionUser(session)) return session;

  const body = await request.json();
  const parsed = workoutPlanGenerateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const client = await prisma.clientProfile.findUnique({
    where: { id: parsed.data.clientId },
    include: { trainer: true },
  });

  if (!client) return NextResponse.json({ error: "Client not found" }, { status: 404 });
  if (session.role === "TRAINER" && client.trainer?.userId !== session.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const daysPerWeek =
    parsed.data.daysPerWeek ??
    ({ BEGINNER: 3, INTERMEDIATE: 4, ADVANCED: 5 } as Record<ExperienceLevel, number>)[
      client.experience as ExperienceLevel
    ];

  const generated = await generateWorkoutPlan({
    style: parsed.data.style,
    experience: client.experience,
    daysPerWeek,
    injuries: client.injuries ?? undefined,
    equipment: parsed.data.equipment,
  });

  await prisma.workoutPlan.updateMany({
    where: { clientId: client.id, status: "ACTIVE" },
    data: { status: "ARCHIVED" },
  });

  const workoutPlan = await prisma.workoutPlan.create({
    data: {
      clientId: client.id,
      style: parsed.data.style,
      experience: client.experience,
      daysPerWeek,
      schedule: generated.schedule,
      generatedBy: "AI",
      status: "ACTIVE",
    },
  });

  return NextResponse.json({ workoutPlan, source: generated.source });
}
