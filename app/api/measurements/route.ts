import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireApiRole, isSessionUser } from "@/lib/auth/session";
import { measurementSchema } from "@/lib/validation";
import { calculateBMI } from "@/lib/nutrition/calculations";

/** POST /api/measurements — client logs a manual check-in, or trainer logs one for a client. */
export async function POST(request: NextRequest) {
  const session = await requireApiRole("ADMIN", "TRAINER", "CLIENT");
  if (!isSessionUser(session)) return session;

  const body = await request.json();
  const { clientId, ...rest } = body;
  const parsed = measurementSchema.safeParse(rest);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  let targetClientId = clientId as string | undefined;
  if (session.role === "CLIENT") {
    const own = await prisma.clientProfile.findUnique({ where: { userId: session.id } });
    if (!own) return NextResponse.json({ error: "Client profile not found" }, { status: 404 });
    targetClientId = own.id;
  }
  if (!targetClientId) {
    return NextResponse.json({ error: "clientId is required" }, { status: 400 });
  }

  const client = await prisma.clientProfile.findUnique({ where: { id: targetClientId } });
  if (!client) return NextResponse.json({ error: "Client not found" }, { status: 404 });

  const bmi =
    parsed.data.weightKg && client.heightCm
      ? calculateBMI(parsed.data.weightKg, client.heightCm)
      : undefined;

  const measurement = await prisma.measurement.create({
    data: {
      clientId: targetClientId,
      ...parsed.data,
      bmi,
      source: session.role === "CLIENT" ? "MANUAL" : "TRAINER",
    },
  });

  return NextResponse.json({ measurement }, { status: 201 });
}
