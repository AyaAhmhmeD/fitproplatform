import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireApiRole, isSessionUser } from "@/lib/auth/session";
import { provisionUser } from "@/lib/auth/roles";
import { clientIntakeSchema } from "@/lib/validation";

/** GET /api/clients — trainers see their own roster, admins see everyone. */
export async function GET(request: NextRequest) {
  const session = await requireApiRole("ADMIN", "TRAINER");
  if (!isSessionUser(session)) return session;

  const search = request.nextUrl.searchParams.get("q")?.trim();

  const trainerFilter =
    session.role === "TRAINER"
      ? { trainer: { userId: session.id } }
      : {};

  const clients = await prisma.clientProfile.findMany({
    where: {
      ...trainerFilter,
      ...(search
        ? { user: { name: { contains: search, mode: "insensitive" as const } } }
        : {}),
    },
    include: {
      user: { select: { id: true, name: true, email: true, avatarUrl: true, createdAt: true } },
      trainer: { include: { user: { select: { name: true } } } },
      measurements: { orderBy: { date: "desc" }, take: 1 },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ clients });
}

/** POST /api/clients — creates a Supabase auth user + User + ClientProfile in one step. */
export async function POST(request: NextRequest) {
  const session = await requireApiRole("ADMIN", "TRAINER");
  if (!isSessionUser(session)) return session;

  const body = await request.json();
  const parsed = clientIntakeSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }
  const data = parsed.data;

  try {
    const { userId } = await provisionUser({
      email: data.email,
      name: data.name,
      role: "CLIENT",
      sendInviteEmail: true,
    });

    const trainerProfile =
      session.role === "TRAINER"
        ? await prisma.trainerProfile.findUnique({ where: { userId: session.id } })
        : null;

    const clientProfile = await prisma.clientProfile.create({
      data: {
        userId,
        trainerId: trainerProfile?.id,
        age: data.age,
        gender: data.gender,
        heightCm: data.heightCm,
        goal: data.goal,
        activityLevel: data.activityLevel,
        experience: data.experience,
        injuries: data.injuries,
        diseases: data.diseases,
        sleepHours: data.sleepHours,
        waterIntakeMl: data.waterIntakeMl,
        measurements: { create: [{ weightKg: data.weightKg, source: "TRAINER" }] },
      },
      include: { user: true, measurements: true },
    });

    await prisma.auditLog.create({
      data: {
        userId: session.id,
        action: "CREATE_CLIENT",
        entity: "ClientProfile",
        entityId: clientProfile.id,
      },
    });

    return NextResponse.json({ client: clientProfile }, { status: 201 });
  } catch (error) {
    console.error("[api/clients] failed to create client", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to create client" },
      { status: 500 },
    );
  }
}
