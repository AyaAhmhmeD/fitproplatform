import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, Dumbbell, AlertTriangle } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth/session";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

type Difficulty = "BEGINNER" | "INTERMEDIATE" | "ADVANCED";

interface ExerciseRecord {
  id: string;
  name: string;
  nameAr: string | null;
  slug: string;
  muscleGroup: string;
  secondaryMuscles: string[];
  difficulty: Difficulty;
  equipment: string;
  instructions: string;
  instructionsAr: string | null;
  commonMistakes: string | null;
  imageUrl: string | null;
  videoUrl: string | null;
  animationUrl: string | null;
  alternativeSlugs: string[];
  createdAt: Date;
}

const difficultyTone: Record<Difficulty, "success" | "warning" | "danger"> = {
  BEGINNER: "success",
  INTERMEDIATE: "warning",
  ADVANCED: "danger",
};

export default async function ExerciseDetailPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  await requireRole(locale, "ADMIN", "TRAINER");

  const t = await getTranslations("exercises");
  const isAr = locale === "ar";
  const BackIcon = isAr ? ArrowRight : ArrowLeft;

  const exercise = (await prisma.exercise.findUnique({ where: { slug } })) as ExerciseRecord | null;
  if (!exercise) notFound();

  const alternatives = (await prisma.exercise.findMany({
    where: { slug: { in: exercise.alternativeSlugs } },
  })) as ExerciseRecord[];

  const displayName = isAr && exercise.nameAr ? exercise.nameAr : exercise.name;
  const displayInstructions = isAr && exercise.instructionsAr ? exercise.instructionsAr : exercise.instructions;

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-8 px-4 py-10 sm:px-6 lg:px-8">
      <Link
        href={`/${locale}/trainer/exercises`}
        className="inline-flex w-fit items-center gap-2 text-sm font-medium text-ink-400 transition hover:text-brand-500"
      >
        <BackIcon className="h-4 w-4" />
        {t("backToLibrary")}
      </Link>

      <Card className="flex flex-col gap-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-start gap-4">
            <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-brand-400/15 text-brand-500">
              <Dumbbell className="h-6 w-6" />
            </span>
            <div>
              <h1 className="font-display text-2xl font-semibold tracking-tight sm:text-3xl">
                {displayName}
              </h1>
              <p className="mt-1 text-sm text-ink-400">{exercise.equipment}</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Badge tone="brand">{exercise.muscleGroup}</Badge>
            <Badge tone={difficultyTone[exercise.difficulty]}>
              {t(`difficultyLabels.${exercise.difficulty}`)}
            </Badge>
          </div>
        </div>

        {exercise.secondaryMuscles.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 border-t border-(--border-subtle) pt-4">
            <span className="text-sm font-medium text-ink-500">{t("secondaryMuscles")}:</span>
            {exercise.secondaryMuscles.map((muscle: string) => (
              <Badge key={muscle} tone="neutral">
                {muscle}
              </Badge>
            ))}
          </div>
        )}
      </Card>

      <Card className="flex flex-col gap-3">
        <h2 className="font-display text-lg font-semibold tracking-tight">{t("instructions")}</h2>
        <div className="whitespace-pre-line text-sm leading-relaxed text-(--foreground)">
          {displayInstructions}
        </div>
      </Card>

      {exercise.commonMistakes && (
        <Card className="flex flex-col gap-3 border-amber-500/30">
          <h2 className="flex items-center gap-2 font-display text-lg font-semibold tracking-tight text-amber-500">
            <AlertTriangle className="h-5 w-5" />
            {t("commonMistakes")}
          </h2>
          <p className="text-sm leading-relaxed text-ink-400">{exercise.commonMistakes}</p>
        </Card>
      )}

      {alternatives.length > 0 && (
        <div className="flex flex-col gap-4">
          <h2 className="font-display text-lg font-semibold tracking-tight">{t("alternatives")}</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {alternatives.map((alt: ExerciseRecord) => {
              const altName = isAr && alt.nameAr ? alt.nameAr : alt.name;
              return (
                <Link key={alt.slug} href={`/${locale}/trainer/exercises/${alt.slug}`}>
                  <Card className="flex h-full flex-col gap-3 p-4 transition hover:border-brand-400/60">
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="font-display text-sm font-semibold leading-snug tracking-tight">
                        {altName}
                      </h3>
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-400/15 text-brand-500">
                        <Dumbbell className="h-3.5 w-3.5" />
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      <Badge tone="brand" className="text-[11px]">
                        {alt.muscleGroup}
                      </Badge>
                      <Badge tone={difficultyTone[alt.difficulty]} className="text-[11px]">
                        {t(`difficultyLabels.${alt.difficulty}`)}
                      </Badge>
                    </div>
                  </Card>
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
