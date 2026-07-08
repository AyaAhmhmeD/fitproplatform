import { getTranslations } from "next-intl/server";
import { prisma } from "@/lib/prisma";
import { Card } from "@/components/ui/card";
import { StatCard } from "@/components/ui/stat-card";
import { Badge } from "@/components/ui/badge";
import { CalendarCheck } from "lucide-react";
import { formatDate } from "@/lib/utils";

export default async function AdminAttendancePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations("admin");

  const [total, present, recent] = await Promise.all([
    prisma.attendance.count(),
    prisma.attendance.count({ where: { status: "PRESENT" } }),
    prisma.attendance.findMany({
      orderBy: { date: "desc" },
      take: 50,
      include: { client: { include: { user: { select: { name: true } } } } },
    }),
  ]);

  const rate = total > 0 ? Math.round((present / total) * 100) : 0;

  return (
    <div className="flex flex-col gap-6">
      <h1 className="font-display text-2xl font-semibold tracking-tight">{t("attendance")}</h1>

      <StatCard label={t("attendanceRate")} value={`${rate}%`} icon={CalendarCheck} className="max-w-xs" />

      <Card>
        <div className="flex flex-col divide-y divide-(--border-subtle)">
          {recent.length === 0 && <p className="py-6 text-center text-sm text-ink-400">No attendance logged yet.</p>}
          {recent.map((entry) => (
            <div key={entry.id} className="flex items-center justify-between gap-3 py-3">
              <div>
                <p className="text-sm font-medium">{entry.client.user.name}</p>
                <p className="text-xs text-ink-400">{formatDate(entry.date, locale)}</p>
              </div>
              <Badge tone={entry.status === "PRESENT" ? "success" : entry.status === "EXCUSED" ? "warning" : "danger"}>
                {entry.status}
              </Badge>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
