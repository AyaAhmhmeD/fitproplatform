import { getTranslations } from "next-intl/server";
import { Bell } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { formatDate } from "@/lib/utils";

export async function NotificationsList({ userId, locale }: { userId: string; locale: string }) {
  const t = await getTranslations("notifications");

  const notifications = await prisma.notification.findMany({
    where: { recipientId: userId },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  if (notifications.length === 0) {
    return <EmptyState icon={Bell} title={t("empty")} />;
  }

  return (
    <Card>
      <div className="flex flex-col divide-y divide-(--border-subtle)">
        {notifications.map((n) => (
          <div key={n.id} className="flex items-start justify-between gap-3 py-3">
            <div>
              <p className="text-sm font-medium">{locale === "ar" && n.titleAr ? n.titleAr : n.title}</p>
              <p className="mt-0.5 text-sm text-ink-400">{locale === "ar" && n.bodyAr ? n.bodyAr : n.body}</p>
              <p className="mt-1 text-xs text-ink-400">{formatDate(n.createdAt, locale)}</p>
            </div>
            {!n.read && <Badge tone="brand">New</Badge>}
          </div>
        ))}
      </div>
    </Card>
  );
}
