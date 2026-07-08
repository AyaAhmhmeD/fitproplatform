import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireApiRole, isSessionUser } from "@/lib/auth/session";
import { provisionUser } from "@/lib/auth/roles";
import { createTrainerSchema } from "@/lib/validation";

/** GET /api/trainers — admin-only roster with client counts. */
export async function GET() {
  const session = await requireApiRole("ADMIN");
  if (!isSessionUser(session)) return session;

  const trainers = await prisma.trainerProfile.findMany({
    include: {
      user: { select: { id: true, name: true, email: true, avatarUrl: true, createdAt: true, isActive: true } },
      _count: { select: { clients: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ trainers });
}

/** POST /api/trainers — admin creates a new trainer account. */
export async function POST(request: NextRequest) {
  const session = await requireApiRole("ADMIN");
  if (!isSessionUser(session)) return session;

  const body = await request.json();
  const parsed = createTrainerSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { userId } = await provisionUser({
    email: parsed.data.email,
    name: parsed.data.name,
    role: "TRAINER",
    phone: parsed.data.phone,
    sendInviteEmail: true,
  });

  await prisma.trainerProfile.update({
    where: { userId },
    data: {
      bio: parsed.data.bio,
      specialties: parsed.data.specialties ?? [],
    },
  });

  await prisma.auditLog.create({
    data: { userId: session.id, action: "CREATE_TRAINER", entity: "TrainerProfile", entityId: userId },
  });

  return NextResponse.json({ ok: true }, { status: 201 });
}
