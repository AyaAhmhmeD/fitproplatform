import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth/session";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { UtensilsCrossed } from "lucide-react";
import { PdfExportButton } from "@/components/forms/report-export-buttons";
import type { MealPlanContent } from "@/types";

export default async function ClientNutritionPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const user = await requireRole(locale, "CLIENT");
  const t = await getTranslations();

  const client = await prisma.clientProfile.findUnique({
    where: { userId: user.id },
    include: { mealPlans: { where: { status: "ACTIVE" }, take: 1 } },
  });

  if (!client) notFound();
  const plan = client.mealPlans[0];

  if (!plan) {
    return (
      <EmptyState
        icon={UtensilsCrossed}
        title="No meal plan yet"
        description="Your trainer hasn't generated a nutrition plan for you yet."
      />
    );
  }

  const meals = plan.meals as MealPlanContent;
  const supplements = (plan.supplements as string[] | null) ?? [];
  const alternatives = (plan.alternatives as string[] | null) ?? [];
  const shoppingList = (plan.shoppingList as string[] | null) ?? [];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-semibold tracking-tight">{t("client.mealPlan")}</h1>
        <PdfExportButton kind="meal" clientId={client.id} />
      </div>

      <div className="flex flex-wrap gap-4 rounded-2xl border border-(--border-subtle) p-4 text-sm">
        <span className="font-medium">{plan.calories} kcal</span>
        <span className="text-ink-400">{t("client.protein")}: {plan.proteinG}g</span>
        <span className="text-ink-400">{t("client.carbs")}: {plan.carbsG}g</span>
        <span className="text-ink-400">{t("client.fat")}: {plan.fatG}g</span>
        <span className="text-ink-400">{t("client.water")}: {plan.waterMl}ml</span>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {(Object.entries(meals) as [string, MealPlanContent[keyof MealPlanContent]][]).map(([key, meal]) => (
          <Card key={key}>
            <p className="text-xs font-medium uppercase tracking-wide text-brand-500">{t(`nutrition.${key}` as never)}</p>
            <p className="mt-1 font-display font-semibold">{locale === "ar" ? meal.nameAr || meal.name : meal.name}</p>
            <p className="mt-1 text-xs text-ink-400">
              {meal.calories} kcal · P{meal.proteinG} C{meal.carbsG} F{meal.fatG}
            </p>
            <ul className="mt-3 space-y-1 text-sm text-ink-400">
              {meal.items.map((item, i) => (
                <li key={i}>• {item}</li>
              ))}
            </ul>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>{t("nutrition.supplements")}</CardTitle>
          </CardHeader>
          <ul className="space-y-1 text-sm text-ink-400">
            {supplements.map((s, i) => (
              <li key={i}>• {s}</li>
            ))}
          </ul>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>{t("nutrition.alternatives")}</CardTitle>
          </CardHeader>
          <ul className="space-y-1 text-sm text-ink-400">
            {alternatives.map((s, i) => (
              <li key={i}>• {s}</li>
            ))}
          </ul>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>{t("nutrition.shoppingList")}</CardTitle>
          </CardHeader>
          <ul className="space-y-1 text-sm text-ink-400">
            {shoppingList.map((s, i) => (
              <li key={i}>• {s}</li>
            ))}
          </ul>
        </Card>
      </div>
    </div>
  );
}
