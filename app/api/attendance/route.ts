import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireApiRole, isSessionUser } from "@/lib/auth/session";

/** POST /api/attendance — trainer/admin checks a client in for today (or a given date). */
export async function POST(request: NextRequest) {
  const session = await requireApiRole("ADMIN", "TRAINER");
  if (!isSessionUser(session)) return session;

  const body = await request.json();
  const { clientId, date, status = "PRESENT", notes } = body;
  if (!clientId) return NextResponse.json({ error: "clientId is required" }, { status: 400 });

  const day = date ? new Date(date) : new Date();
  day.setHours(0, 0, 0, 0);

  const attendance = await prisma.attendance.upsert({
    where: { clientId_date: { clientId, date: day } },
    update: { status, notes },
    create: { clientId, date: day, status, notes },
  });

  return NextResponse.json({ attendance }, { status: 201 });
}

/** GET /api/attendance?clientId=... — attendance history, or org-wide rate for admins. */
export async function GET(request: NextRequest) {
  const session = await requireApiRole("ADMIN", "TRAINER", "CLIENT");
  if (!isSessionUser(session)) return session;

  const clientIdParam = request.nextUrl.searchParams.get("clientId");
  let clientId = clientIdParam ?? undefined;

  if (session.role === "CLIENT") {
    const own = await prisma.clientProfile.findUnique({ where: { userId: session.id } });
    clientId = own?.id;
  }

  if (clientId) {
    const attendances = await prisma.attendance.findMany({
      where: { clientId },
      orderBy: { date: "desc" },
      take: 90,
    });
    return NextResponse.json({ attendances });
  }

  // Admin org-wide summary
  const [total, present] = await Promise.all([
    prisma.attendance.count(),
    prisma.attendance.count({ where: { status: "PRESENT" } }),
  ]);

  return NextResponse.json({ rate: total > 0 ? Math.round((present / total) * 100) : 0, total, present });
}
