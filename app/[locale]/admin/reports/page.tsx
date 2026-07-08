import { getTranslations } from "next-intl/server";
import { FileBarChart } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Badge } from "@/components/ui/badge";
import { ExcelExportButton } from "@/components/forms/report-export-buttons";
import { formatDate } from "@/lib/utils";

export default async function AdminReportsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations("admin");

  const reports = await prisma.report.findMany({
    orderBy: { createdAt: "desc" },
    take: 20,
    include: { client: { include: { user: { select: { name: true } } } }, generatedBy: { select: { name: true } } },
  });

  return (
    <div className="flex flex-col gap-6">
      <h1 className="font-display text-2xl font-semibold tracking-tight">{t("overview")}</h1>

      <Card className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <CardTitle>Analytics Export</CardTitle>
          <CardDescription>Download a full Excel workbook of platform KPIs.</CardDescription>
        </div>
        <ExcelExportButton kind="analytics" />
      </Card>

      <Card className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <CardTitle>Client Roster Export</CardTitle>
          <CardDescription>Download every client&rsquo;s key stats as Excel.</CardDescription>
        </div>
        <ExcelExportButton kind="progress" />
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Recent Reports</CardTitle>
        </CardHeader>
        {reports.length === 0 ? (
          <EmptyState icon={FileBarChart} title="No reports generated yet" />
        ) : (
          <div className="flex flex-col divide-y divide-(--border-subtle)">
            {reports.map((report) => (
              <a
                key={report.id}
                href={report.fileUrl}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-between gap-3 py-3 transition hover:opacity-80"
              >
                <div>
                  <p className="text-sm font-medium">
                    {report.kind.replaceAll("_", " ")} {report.client ? `— ${report.client.user.name}` : ""}
                  </p>
                  <p className="text-xs text-ink-400">
                    {formatDate(report.createdAt, locale)} · by {report.generatedBy.name}
                  </p>
                </div>
                <Badge tone={report.format === "PDF" ? "danger" : "success"}>{report.format}</Badge>
              </a>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
