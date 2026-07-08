import React, { useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  View,
} from "react-native";
import { Link, router } from "expo-router";
import { useTranslation } from "react-i18next";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuth } from "@/contexts/auth-context";
import { useLocale } from "@/contexts/locale-context";
import { Button, Input } from "@/components/ui";

export default function LoginScreen() {
  const { t } = useTranslation();
  const { signInWithPassword, signInWithOAuth } = useAuth();
  const { locale, setLocale } = useLocale();
  const insets = useSafeAreaInsets();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [oauthProvider, setOauthProvider] = useState<"google" | "apple" | null>(null);

  const onSubmit = async () => {
    setSubmitting(true);
    try {
      await signInWithPassword(email.trim(), password);
      router.replace("/");
    } catch (err) {
      Alert.alert(t("common.error"), t("auth.invalidCredentials"));
    } finally {
      setSubmitting(false);
    }
  };

  const onOAuth = async (provider: "google" | "apple") => {
    setOauthProvider(provider);
    try {
      await signInWithOAuth(provider);
      router.replace("/");
    } catch (err) {
      Alert.alert(t("common.error"), err instanceof Error ? err.message : String(err));
    } finally {
      setOauthProvider(null);
    }
  };

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-paper dark:bg-ink"
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        contentContainerStyle={{ paddingTop: insets.top + 32, paddingBottom: 32 }}
        contentContainerClassName="flex-grow gap-6 px-6"
        keyboardShouldPersistTaps="handled"
      >
        <View className="flex-row items-center justify-between">
          <View className="h-12 w-12 items-center justify-center rounded-2xl bg-volt">
            <Ionicons name="barbell" size={22} color="#0a0b11" />
          </View>
          <Button
            label={locale === "en" ? "AR" : "EN"}
            variant="outline"
            size="sm"
            onPress={() => setLocale(locale === "en" ? "ar" : "en")}
          />
        </View>

        <View className="gap-1">
          <Text className="text-3xl font-bold text-ink dark:text-paper">
            {t("auth.welcomeBack")}
          </Text>
          <Text className="text-base text-black/50 dark:text-white/50">
            {t("auth.loginSubtitle")}
          </Text>
        </View>

        <View className="gap-4">
          <Input
            label={t("auth.email")}
            autoCapitalize="none"
            keyboardType="email-address"
            autoComplete="email"
            value={email}
            onChangeText={setEmail}
            placeholder="you@example.com"
          />
          <Input
            label={t("auth.password")}
            secureTextEntry
            autoComplete="password"
            value={password}
            onChangeText={setPassword}
            placeholder="••••••••"
          />
          <Button
            label={t("auth.login")}
            onPress={onSubmit}
            loading={submitting}
            disabled={!email || !password}
          />
        </View>

        <View className="flex-row items-center gap-3">
          <View className="h-px flex-1 bg-black/10 dark:bg-white/10" />
          <Text className="text-xs uppercase text-black/40 dark:text-white/40">
            {t("auth.orDivider")}
          </Text>
          <View className="h-px flex-1 bg-black/10 dark:bg-white/10" />
        </View>

        <View className="gap-3">
          <Button
            label={t("auth.continueWithGoogle")}
            variant="outline"
            icon={<Ionicons name="logo-google" size={18} color="#0a0b11" />}
            loading={oauthProvider === "google"}
            onPress={() => onOAuth("google")}
          />
          <Button
            label={t("auth.continueWithApple")}
            variant="outline"
            icon={<Ionicons name="logo-apple" size={18} color="#0a0b11" />}
            loading={oauthProvider === "apple"}
            onPress={() => onOAuth("apple")}
          />
        </View>

        <View className="flex-row items-center justify-center gap-1.5 pt-2">
          <Text className="text-sm text-black/50 dark:text-white/50">{t("auth.noAccount")}</Text>
          <Link href="/(auth)/register" className="text-sm font-semibold text-volt-dark dark:text-volt">
            {t("auth.signUp")}
          </Link>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
