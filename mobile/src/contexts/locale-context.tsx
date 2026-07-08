import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { I18nManager, Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Updates from "expo-updates";
import i18n, { SupportedLocale } from "@/i18n";

const STORAGE_KEY = "fitpro.locale";

interface LocaleContextValue {
  locale: SupportedLocale;
  isRTL: boolean;
  /** Switches the active language. If the writing direction changes (en<->ar)
   *  RN requires a full reload for `I18nManager` to take effect everywhere,
   *  so this attempts `Updates.reloadAsync()` and returns whether a restart
   *  was triggered — callers should show a toast/alert when it returns
   *  `false` (e.g. in Expo Go / web, where Updates.reloadAsync isn't usable)
   *  telling the user to restart manually. */
  setLocale: (locale: SupportedLocale) => Promise<{ restarted: boolean }>;
  ready: boolean;
}

const LocaleContext = createContext<LocaleContextValue | undefined>(undefined);

function directionFor(locale: SupportedLocale) {
  return locale === "ar" ? "rtl" : "ltr";
}

export function LocaleProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<SupportedLocale>("en");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    (async () => {
      const stored = (await AsyncStorage.getItem(STORAGE_KEY)) as SupportedLocale | null;
      const initial: SupportedLocale = stored === "ar" ? "ar" : "en";
      setLocaleState(initial);
      await i18n.changeLanguage(initial);
      setReady(true);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const setLocale = async (next: SupportedLocale) => {
    const nextIsRTL = directionFor(next) === "rtl";
    const directionChanged = I18nManager.isRTL !== nextIsRTL;

    await AsyncStorage.setItem(STORAGE_KEY, next);
    await i18n.changeLanguage(next);
    setLocaleState(next);

    if (!directionChanged) {
      return { restarted: false };
    }

    // NOTE: I18nManager.forceRTL only takes effect after the JS bundle is
    // reloaded (RN caches layout direction at native-module init time).
    I18nManager.allowRTL(nextIsRTL);
    I18nManager.forceRTL(nextIsRTL);

    try {
      if (Platform.OS !== "web" && Updates.isEmbeddedLaunch !== undefined) {
        await Updates.reloadAsync();
        return { restarted: true };
      }
    } catch {
      // expo-updates isn't available (e.g. running in Expo Go / dev client
      // without EAS Update configured) — fall through to manual-restart hint.
    }
    return { restarted: false };
  };

  const value = useMemo<LocaleContextValue>(
    () => ({ locale, isRTL: I18nManager.isRTL, setLocale, ready }),
    [locale, ready],
  );

  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}

export function useLocale() {
  const ctx = useContext(LocaleContext);
  if (!ctx) throw new Error("useLocale must be used within a LocaleProvider");
  return ctx;
}
