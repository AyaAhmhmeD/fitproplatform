import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireApiRole, isSessionUser } from "@/lib/auth/session";
import { uploadFile } from "@/lib/storage/upload";
import {
  extractTextFromPdf,
  extractBodyAnalysisMetrics,
  summarizeExtraction,
} from "@/lib/pdf-analysis/extract";

/** POST /api/pdf-analysis — trainer/admin uploads a body-composition scan PDF on behalf of a client. */
export async function POST(request: NextRequest) {
  const session = await requireApiRole("ADMIN", "TRAINER");
  if (!isSessionUser(session)) return session;

  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const clientId = formData.get("clientId") as string | null;

    if (!file) return NextResponse.json({ error: "file is required" }, { status: 400 });
    if (!clientId) return NextResponse.json({ error: "clientId is required" }, { status: 400 });

    const client = await prisma.clientProfile.findUnique({ where: { id: clientId } });
    if (!client) return NextResponse.json({ error: "Client not found" }, { status: 404 });

    const bytes = Buffer.from(await file.arrayBuffer());
    const fileUrl = await uploadFile({
      bucket: "documents",
      path: `body-analysis/${clientId}/${Date.now()}-${file.name}`,
      file: bytes,
      contentType: "application/pdf",
    });

    const text = await extractTextFromPdf(bytes);
    const metrics = extractBodyAnalysisMetrics(text);
    const summary = summarizeExtraction(metrics);

    const report = await prisma.bodyAnalysisReport.create({
      data: {
        clientId,
        uploadedById: session.id,
        fileUrl,
        fileName: file.name,
        extractedData: metrics,
        summary,
      },
    });

    let measurement = null;
    if (
      metrics.weightKg !== undefined ||
      metrics.bodyFatPct !== undefined ||
      metrics.muscleMassKg !== undefined
    ) {
      measurement = await prisma.measurement.create({
        data: {
          clientId,
          weightKg: metrics.weightKg,
          bodyFatPct: metrics.bodyFatPct,
          muscleMassKg: metrics.muscleMassKg,
          bmi: metrics.bmi,
          waistCm: metrics.waistCm,
          chestCm: metrics.chestCm,
          hipCm: metrics.hipCm,
          armCm: metrics.armCm,
          thighCm: metrics.thighCm,
          source: "PDF_EXTRACTED",
        },
      });
    }

    return NextResponse.json({ report, measurement }, { status: 201 });
  } catch (error) {
    console.error("[api/pdf-analysis] failed to process body analysis PDF", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to process body analysis PDF" },
      { status: 500 },
    );
  }
}
