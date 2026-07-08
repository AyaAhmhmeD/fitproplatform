import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireApiRole, isSessionUser } from "@/lib/auth/session";
import { notificationSchema } from "@/lib/validation";

/** GET /api/notifications — the signed-in user's notification feed. */
export async function GET() {
  const session = await requireApiRole("ADMIN", "TRAINER", "CLIENT");
  if (!isSessionUser(session)) return session;

  const notifications = await prisma.notification.findMany({
    where: { recipientId: session.id },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  return NextResponse.json({ notifications });
}

/** POST /api/notifications — admin sends to one recipient or broadcasts to a whole role. */
export async function POST(request: NextRequest) {
  const session = await requireApiRole("ADMIN");
  if (!isSessionUser(session)) return session;

  const body = await request.json();
  const parsed = notificationSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }
  const { recipientId, broadcastRole, ...payload } = parsed.data;

  if (!recipientId && !broadcastRole) {
    return NextResponse.json({ error: "Provide recipientId or broadcastRole" }, { status: 400 });
  }

  const recipientIds: string[] = recipientId
    ? [recipientId]
    : (await prisma.user.findMany({ where: { role: broadcastRole }, select: { id: true } })).map(
        (u: { id: string }) => u.id,
      );

  const notifications = await prisma.notification.createMany({
    data: recipientIds.map((id: string) => ({ ...payload, recipientId: id, senderId: session.id })),
  });

  return NextResponse.json({ count: notifications.count }, { status: 201 });
}

/** PATCH /api/notifications — marks all of the current user's notifications as read. */
export async function PATCH() {
  const session = await requireApiRole("ADMIN", "TRAINER", "CLIENT");
  if (!isSessionUser(session)) return session;

  await prisma.notification.updateMany({
    where: { recipientId: session.id, read: false },
    data: { read: true },
  });

  return NextResponse.json({ ok: true });
}
