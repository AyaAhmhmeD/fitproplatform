import React, { useState } from "react";
import { Alert, KeyboardAvoidingView, Platform, ScrollView, Text, View } from "react-native";
import { Link, router } from "expo-router";
import { useTranslation } from "react-i18next";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuth } from "@/contexts/auth-context";
import { Button, Input } from "@/components/ui";

/**
 * KNOWN GAP: this creates a bare Supabase auth user via `supabase.auth.signUp`.
 * The backend's actual provisioning flow (`provisionUser`, used by
 * `POST /api/clients` and `POST /api/trainers`) also creates the Prisma
 * `User`/`ClientProfile` row and stamps `app_metadata.role` — and those
 * endpoints require an already-authenticated ADMIN/TRAINER caller, so there's
 * no public "sign up as a new client" endpoint today. A self-registered user
 * will have a Supabase session but no role claim, so `app.index` sends them
 * back to `/login` rather than guessing a section. Treat this screen as
 * scaffolding for a future public sign-up flow — see README "Known gaps".
 */
export default function RegisterScreen() {
  const { t } = useTranslation();
  const { signUpWithPassword } = useAuth();
  const insets = useSafeAreaInsets();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const onSubmit = async () => {
    setSubmitting(true);
    try {
      await signUpWithPassword(email.trim(), password, name.trim());
      // Supabase may require email confirmation before a session exists;
      // either way `/` re-evaluates auth state and routes appropriately.
      router.replace("/");
    } catch (err) {
      Alert.alert(t("common.error"), err instanceof Error ? err.message : String(err));
    } finally {
      setSubmitting(false);
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
        <View className="gap-1">
          <Text className="text-3xl font-bold text-ink dark:text-paper">
            {t("auth.createAccount")}
          </Text>
          <Text className="text-base text-black/50 dark:text-white/50">
            {t("auth.registerSubtitle")}
          </Text>
        </View>

        <View className="gap-4">
          <Input label={t("auth.fullName")} value={name} onChangeText={setName} placeholder="Jane Doe" />
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
            autoComplete="password-new"
            value={password}
            onChangeText={setPassword}
            placeholder="••••••••"
          />
          <Button
            label={t("auth.register")}
            onPress={onSubmit}
            loading={submitting}
            disabled={!email || !password || !name}
          />
        </View>

        <View className="flex-row items-center justify-center gap-1.5 pt-2">
          <Text className="text-sm text-black/50 dark:text-white/50">{t("auth.haveAccount")}</Text>
          <Link href="/(auth)/login" className="text-sm font-semibold text-volt-dark dark:text-volt">
            {t("auth.signIn")}
          </Link>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
