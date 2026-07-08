import Link from "next/link";
import { Dumbbell, Search } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth/session";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input, Select } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";

interface ExerciseListItem {
  slug: string;
  name: string;
  nameAr: string | null;
  muscleGroup: string;
  difficulty: "BEGINNER" | "INTERMEDIATE" | "ADVANCED";
  equipment: string;
}

const DIFFICULTIES = ["BEGINNER", "INTERMEDIATE", "ADVANCED"] as const;

const difficultyTone: Record<(typeof DIFFICULTIES)[number], "success" | "warning" | "danger"> = {
  BEGINNER: "success",
  INTERMEDIATE: "warning",
  ADVANCED: "danger",
};

export default async function ExercisesPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ q?: string; muscleGroup?: string; difficulty?: string; equipment?: string }>;
}) {
  const { locale } = await params;
  await requireRole(locale, "ADMIN", "TRAINER");

  const t = await getTranslations("exercises");
  const { q, muscleGroup, difficulty, equipment } = await searchParams;

  const [exercises, muscleGroups, equipmentOptions] = await Promise.all([
    prisma.exercise.findMany({
      where: {
        ...(muscleGroup ? { muscleGroup } : {}),
        ...(difficulty ? { difficulty: difficulty as (typeof DIFFICULTIES)[number] } : {}),
        ...(equipment ? { equipment } : {}),
        ...(q
          ? {
              OR: [
                { name: { contains: q, mode: "insensitive" as const } },
                { nameAr: { contains: q, mode: "insensitive" as const } },
              ],
            }
          : {}),
      },
      orderBy: { name: "asc" },
      select: { slug: true, name: true, nameAr: true, muscleGroup: true, difficulty: true, equipment: true },
    }) as Promise<ExerciseListItem[]>,
    prisma.exercise.findMany({
      distinct: ["muscleGroup"],
      select: { muscleGroup: true },
      orderBy: { muscleGroup: "asc" },
    }),
    prisma.exercise.findMany({
      distinct: ["equipment"],
      select: { equipment: true },
      orderBy: { equipment: "asc" },
    }),
  ]);

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-8 px-4 py-10 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-2">
        <span className="flex h-11 w-11 items-center justify-center rounded-full bg-brand-400/15 text-brand-500">
          <Dumbbell className="h-5 w-5" />
        </span>
        <h1 className="font-display text-3xl font-semibold tracking-tight">{t("title")}</h1>
        <p className="text-sm text-ink-400">{t("subtitle")}</p>
      </div>

      <Card>
        <form method="get" className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
          <div className="lg:col-span-2">
            <Input
              type="search"
              name="q"
              defaultValue={q ?? ""}
              placeholder={t("searchPlaceholder")}
              aria-label={t("searchPlaceholder")}
            />
          </div>
          <Select name="muscleGroup" defaultValue={muscleGroup ?? ""} aria-label={t("muscleGroup")}>
            <option value="">{t("allMuscleGroups")}</option>
            {muscleGroups.map(({ muscleGroup: mg }: { muscleGroup: string }) => (
              <option key={mg} value={mg}>
                {mg}
              </option>
            ))}
          </Select>
          <Select name="difficulty" defaultValue={difficulty ?? ""} aria-label={t("difficulty")}>
            <option value="">{t("allDifficulties")}</option>
            {DIFFICULTIES.map((d) => (
              <option key={d} value={d}>
                {t(`difficultyLabels.${d}`)}
              </option>
            ))}
          </Select>
          <Select name="equipment" defaultValue={equipment ?? ""} aria-label={t("equipment")}>
            <option value="">{t("allEquipment")}</option>
            {equipmentOptions.map(({ equipment: eq }: { equipment: string }) => (
              <option key={eq} value={eq}>
                {eq}
              </option>
            ))}
          </Select>
          <div className="flex items-end lg:col-span-5">
            <Button type="submit" size="md" icon={<Search className="h-4 w-4" />}>
              {t("search")}
            </Button>
          </div>
        </form>
      </Card>

      {exercises.length === 0 ? (
        <EmptyState
          icon={Dumbbell}
          title={t("noResultsTitle")}
          description={t("noResultsDescription")}
        />
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {exercises.map((exercise: ExerciseListItem) => {
            const displayName = locale === "ar" && exercise.nameAr ? exercise.nameAr : exercise.name;
            return (
              <Link key={exercise.slug} href={`/${locale}/trainer/exercises/${exercise.slug}`}>
                <Card className="flex h-full flex-col gap-4 transition hover:border-brand-400/60 hover:shadow-[0_8px_24px_-8px_rgba(143,239,34,0.25)]">
                  <div className="flex items-start justify-between gap-2">
                    <h2 className="font-display text-base font-semibold leading-snug tracking-tight">
                      {displayName}
                    </h2>
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-400/15 text-brand-500">
                      <Dumbbell className="h-4 w-4" />
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Badge tone="brand">{exercise.muscleGroup}</Badge>
                    <Badge tone={difficultyTone[exercise.difficulty]}>
                      {t(`difficultyLabels.${exercise.difficulty}`)}
                    </Badge>
                  </div>
                  <p className="mt-auto text-sm text-ink-400">{exercise.equipment}</p>
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
