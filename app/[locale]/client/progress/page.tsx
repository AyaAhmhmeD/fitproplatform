import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth/session";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { MeasurementChart } from "@/components/dashboard/measurement-chart";
import { MeasurementForm } from "@/components/forms/measurement-form";
import { PhotoUploadForm } from "@/components/forms/photo-upload-form";
import { formatDate } from "@/lib/utils";

export default async function ClientProgressPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const user = await requireRole(locale, "CLIENT");
  const t = await getTranslations();

  const client = await prisma.clientProfile.findUnique({
    where: { userId: user.id },
    include: {
      measurements: { orderBy: { date: "asc" } },
      progressPhotos: { orderBy: { takenAt: "desc" } },
      bodyAnalyses: { orderBy: { createdAt: "desc" } },
    },
  });

  if (!client) notFound();

  const chartData = client.measurements.map((m) => ({
    date: formatDate(m.date, locale),
    weightKg: m.weightKg,
    bodyFatPct: m.bodyFatPct,
    muscleMassKg: m.muscleMassKg,
  }));

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-semibold tracking-tight">{t("client.myProgress")}</h1>
        <div className="flex gap-2">
          <MeasurementForm />
          <PhotoUploadForm />
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Trend</CardTitle>
        </CardHeader>
        <MeasurementChart data={chartData} />
      </Card>

      {client.bodyAnalyses.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>{t("client.downloadAnalysis")}</CardTitle>
          </CardHeader>
          <div className="flex flex-col divide-y divide-(--border-subtle)">
            {client.bodyAnalyses.map((report) => (
              <a
                key={report.id}
                href={report.fileUrl}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-between py-3 text-sm transition hover:opacity-80"
              >
                <span>{report.summary ?? report.fileName}</span>
                <span className="text-ink-400">{formatDate(report.createdAt, locale)}</span>
              </a>
            ))}
          </div>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>{t("nav.photos")}</CardTitle>
        </CardHeader>
        {client.progressPhotos.length === 0 ? (
          <p className="text-sm text-ink-400">No progress photos yet.</p>
        ) : (
          <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 lg:grid-cols-6">
            {client.progressPhotos.map((photo) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                key={photo.id}
                src={photo.url}
                alt={photo.angle}
                className="aspect-square w-full rounded-xl object-cover"
              />
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
