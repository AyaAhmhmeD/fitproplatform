import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireApiRole, isSessionUser } from "@/lib/auth/session";
import { uploadFile } from "@/lib/storage/upload";
import {
  generateAnalyticsExcel,
  generateClientProgressExcel,
  generateMeasurementHistoryExcel,
} from "@/lib/reports/excel";
import type { ReportKind } from "@/types";

const VALID_KINDS = ["progress", "analytics"] as const;
type ExcelKind = (typeof VALID_KINDS)[number];

const XLSX_CONTENT_TYPE = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";

/** POST /api/reports/excel — generates a branded Excel workbook and stores it in Supabase Storage. */
export async function POST(request: NextRequest) {
  const session = await requireApiRole("ADMIN", "TRAINER");
  if (!isSessionUser(session)) return session;

  const body = await request.json();
  const { kind, clientId } = body as { kind?: string; clientId?: string };

  if (!kind || !VALID_KINDS.includes(kind as ExcelKind)) {
    return NextResponse.json(
      { error: "kind must be one of: progress, analytics" },
      { status: 400 },
    );
  }
  const excelKind = kind as ExcelKind;

  if (excelKind === "analytics" && session.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  let buffer: Buffer;
  let reportKind: ReportKind;
  let reportClientId: string | undefined;
  let filenameSlug: string;

  if (excelKind === "analytics") {
    const [totalClients, totalTrainers, activeSubscriptions, presentCount, totalAttendance, revenue, goalGroups] =
      await Promise.all([
        prisma.clientProfile.count(),
        prisma.trainerProfile.count(),
        prisma.clientProfile.count({ where: { subscriptionStatus: "ACTIVE" } }),
        prisma.attendance.count({ where: { status: "PRESENT" } }),
        prisma.attendance.count(),
        prisma.subscription.aggregate({ where: { status: "ACTIVE" }, _sum: { price: true } }),
        prisma.clientProfile.groupBy({ by: ["goal"], _count: { goal: true } }),
      ]);

    const attendanceRate = totalAttendance > 0 ? presentCount / totalAttendance : 0;
    const goalBreakdown: Record<string, number> = {};
    for (const g of goalGroups) {
      goalBreakdown[g.goal] = g._count.goal;
    }

    buffer = await generateAnalyticsExcel({
      totalClients,
      totalTrainers,
      activeSubscriptions,
      attendanceRate,
      monthlyRevenue: revenue._sum.price ?? 0,
      goalBreakdown,
    });

    reportKind = "ANALYTICS";
    reportClientId = undefined;
    filenameSlug = "analytics";
  } else if (clientId) {
    const client = await prisma.clientProfile.findUnique({
      where: { id: clientId },
      include: { user: { select: { name: true } }, trainer: true },
    });

    if (!client) return NextResponse.json({ error: "Client not found" }, { status: 404 });
    if (session.role === "TRAINER" && client.trainer?.userId !== session.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const measurements = await prisma.measurement.findMany({
      where: { clientId },
      orderBy: { date: "asc" },
    });

    buffer = await generateMeasurementHistoryExcel({
      clientName: client.user.name,
      measurements,
    });

    reportKind = "CLIENT_PROGRESS";
    reportClientId = clientId;
    filenameSlug = `measurements-${clientId}`;
  } else {
    const trainerFilter = session.role === "TRAINER" ? { trainer: { userId: session.id } } : {};

    const clients = await prisma.clientProfile.findMany({
      where: trainerFilter,
      include: {
        user: { select: { name: true, email: true } },
        trainer: { include: { user: { select: { name: true } } } },
        measurements: { orderBy: { date: "desc" }, take: 1 },
      },
      orderBy: { createdAt: "desc" },
    });

    buffer = await generateClientProgressExcel({
      clients: clients.map((c: (typeof clients)[number]) => ({
        name: c.user.name,
        email: c.user.email,
        goal: c.goal,
        trainer: c.trainer?.user.name,
        subscriptionStatus: c.subscriptionStatus,
        latestWeight: c.measurements[0]?.weightKg ?? null,
        latestBmi: c.measurements[0]?.bmi ?? null,
      })),
    });

    reportKind = "CLIENT_PROGRESS";
    reportClientId = undefined;
    filenameSlug = "overview";
  }

  const url = await uploadFile({
    bucket: "documents",
    path: `reports/${reportClientId ?? "all"}/${filenameSlug}-${Date.now()}.xlsx`,
    file: buffer,
    contentType: XLSX_CONTENT_TYPE,
  });

  const report = await prisma.report.create({
    data: {
      clientId: reportClientId,
      kind: reportKind,
      format: "EXCEL",
      fileUrl: url,
      generatedById: session.id,
    },
  });

  return NextResponse.json({ url, report });
}
