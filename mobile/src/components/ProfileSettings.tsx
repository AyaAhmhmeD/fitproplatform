import React from "react";
import { Alert, Text, View } from "react-native";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/contexts/auth-context";
import { useTheme } from "@/contexts/theme-context";
import { useLocale } from "@/contexts/locale-context";
import { Button, Card } from "@/components/ui";

/** Shared account/appearance/language section, reused by trainer + client profile tabs. */
export function ProfileSettings({ children }: { children?: React.ReactNode }) {
  const { t } = useTranslation();
  const { user, signOut } = useAuth();
  const { mode, toggle } = useTheme();
  const { locale, setLocale } = useLocale();

  const onChangeLocale = async (next: "en" | "ar") => {
    if (next === locale) return;
    const { restarted } = await setLocale(next);
    if (!restarted) {
      Alert.alert(t("settings.language"), t("settings.restartNotice"));
    }
  };

  return (
    <View className="gap-4">
      <Card className="gap-1">
        <Text className="text-lg font-bold text-ink dark:text-paper">
          {user?.user_metadata?.name ?? user?.email}
        </Text>
        <Text className="text-sm text-black/50 dark:text-white/50">{user?.email}</Text>
      </Card>

      {children}

      <Card className="gap-3">
        <Text className="text-sm font-semibold uppercase text-black/40 dark:text-white/40">
          {t("settings.appearance")}
        </Text>
        <View className="flex-row gap-3">
          <Button
            label={t("settings.dark")}
            variant={mode === "dark" ? "primary" : "outline"}
            size="sm"
            onPress={() => mode !== "dark" && toggle()}
          />
          <Button
            label={t("settings.light")}
            variant={mode === "light" ? "primary" : "outline"}
            size="sm"
            onPress={() => mode !== "light" && toggle()}
          />
        </View>
      </Card>

      <Card className="gap-3">
        <Text className="text-sm font-semibold uppercase text-black/40 dark:text-white/40">
          {t("settings.language")}
        </Text>
        <View className="flex-row gap-3">
          <Button
            label={t("settings.english")}
            variant={locale === "en" ? "primary" : "outline"}
            size="sm"
            onPress={() => onChangeLocale("en")}
          />
          <Button
            label={t("settings.arabic")}
            variant={locale === "ar" ? "primary" : "outline"}
            size="sm"
            onPress={() => onChangeLocale("ar")}
          />
        </View>
      </Card>

      <Button label={t("auth.logout")} variant="outline" onPress={signOut} />
    </View>
  );
}
