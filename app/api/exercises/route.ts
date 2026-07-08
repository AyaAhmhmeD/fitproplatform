import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireApiRole, isSessionUser } from "@/lib/auth/session";

/** GET /api/exercises — searchable, filterable exercise library. */
export async function GET(request: NextRequest) {
  const session = await requireApiRole("ADMIN", "TRAINER", "CLIENT");
  if (!isSessionUser(session)) return session;

  const { searchParams } = new URL(request.url);
  const muscleGroup = searchParams.get("muscleGroup");
  const difficulty = searchParams.get("difficulty");
  const equipment = searchParams.get("equipment");
  const q = searchParams.get("q");

  const exercises = await prisma.exercise.findMany({
    where: {
      ...(muscleGroup ? { muscleGroup } : {}),
      ...(difficulty ? { difficulty: difficulty as "BEGINNER" | "INTERMEDIATE" | "ADVANCED" } : {}),
      ...(equipment ? { equipment } : {}),
      ...(q
        ? {
            OR: [
              { name: { contains: q, mode: "insensitive" as const } },
              { nameAr: { contains: q, mode: "insensitive" as const } },
            ],
          }
        : {}),
    },
    orderBy: { name: "asc" },
  });

  return NextResponse.json({ exercises });
}
