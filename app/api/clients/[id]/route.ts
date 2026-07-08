import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireApiRole, isSessionUser } from "@/lib/auth/session";

async function assertAccess(clientId: string, session: { id: string; role: string }) {
  const client = await prisma.clientProfile.findUnique({
    where: { id: clientId },
    include: { trainer: true },
  });
  if (!client) return null;
  if (session.role === "ADMIN") return client;
  if (session.role === "TRAINER" && client.trainer?.userId === session.id) return client;
  if (session.role === "CLIENT" && client.userId === session.id) return client;
  return "forbidden" as const;
}

/** GET /api/clients/[id] — full profile with measurements, plans, photos, analyses. */
export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const session = await requireApiRole("ADMIN", "TRAINER", "CLIENT");
  if (!isSessionUser(session)) return session;

  const { id } = await context.params;
  const access = await assertAccess(id, session);
  if (access === null) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (access === "forbidden") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const client = await prisma.clientProfile.findUnique({
    where: { id },
    include: {
      user: { select: { id: true, name: true, email: true, avatarUrl: true, phone: true } },
      trainer: { include: { user: { select: { name: true, id: true } } } },
      measurements: { orderBy: { date: "asc" } },
      bodyAnalyses: { orderBy: { createdAt: "desc" } },
      progressPhotos: { orderBy: { takenAt: "desc" } },
      mealPlans: { where: { status: "ACTIVE" }, orderBy: { createdAt: "desc" }, take: 1 },
      workoutPlans: { where: { status: "ACTIVE" }, orderBy: { createdAt: "desc" }, take: 1 },
      attendances: { orderBy: { date: "desc" }, take: 30 },
    },
  });

  return NextResponse.json({ client });
}

/** PATCH /api/clients/[id] — trainer/admin edits any field on the client's profile. */
export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const session = await requireApiRole("ADMIN", "TRAINER");
  if (!isSessionUser(session)) return session;

  const { id } = await context.params;
  const access = await assertAccess(id, session);
  if (access === null) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (access === "forbidden") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await request.json();
  const {
    name,
    age,
    gender,
    heightCm,
    goal,
    activityLevel,
    experience,
    injuries,
    diseases,
    sleepHours,
    waterIntakeMl,
    subscriptionStatus,
  } = body;

  const updated = await prisma.clientProfile.update({
    where: { id },
    data: {
      age,
      gender,
      heightCm,
      goal,
      activityLevel,
      experience,
      injuries,
      diseases,
      sleepHours,
      waterIntakeMl,
      subscriptionStatus,
      ...(name ? { user: { update: { name } } } : {}),
    },
    include: { user: true },
  });

  await prisma.auditLog.create({
    data: { userId: session.id, action: "UPDATE_CLIENT", entity: "ClientProfile", entityId: id, metadata: body },
  });

  return NextResponse.json({ client: updated });
}

/** DELETE /api/clients/[id] — admin only. */
export async function DELETE(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const session = await requireApiRole("ADMIN");
  if (!isSessionUser(session)) return session;

  const { id } = await context.params;
  await prisma.clientProfile.delete({ where: { id } });

  await prisma.auditLog.create({
    data: { userId: session.id, action: "DELETE_CLIENT", entity: "ClientProfile", entityId: id },
  });

  return NextResponse.json({ ok: true });
}
