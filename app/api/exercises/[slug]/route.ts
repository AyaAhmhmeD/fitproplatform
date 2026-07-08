import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireApiRole, isSessionUser } from "@/lib/auth/session";

/** GET /api/exercises/[slug] — a single exercise plus its alternative exercises. */
export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ slug: string }> },
) {
  const session = await requireApiRole("ADMIN", "TRAINER", "CLIENT");
  if (!isSessionUser(session)) return session;

  const { slug } = await context.params;

  const exercise = await prisma.exercise.findUnique({ where: { slug } });
  if (!exercise) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const alternatives = await prisma.exercise.findMany({
    where: { slug: { in: exercise.alternativeSlugs } },
  });

  return NextResponse.json({ exercise, alternatives });
}
