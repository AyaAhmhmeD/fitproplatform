import { getTranslations } from "next-intl/server";
import { requireRole } from "@/lib/auth/session";
import { SendNotificationForm } from "@/components/forms/send-notification-form";
import { NotificationsList } from "@/components/dashboard/notifications-list";

export default async function AdminNotificationsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const user = await requireRole(locale, "ADMIN");
  const t = await getTranslations("nav");

  return (
    <div className="flex flex-col gap-6">
      <h1 className="font-display text-2xl font-semibold tracking-tight">{t("notifications")}</h1>
      <SendNotificationForm />
      <NotificationsList userId={user.id} locale={locale} />
    </div>
  );
}
