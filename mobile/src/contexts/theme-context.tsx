import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useColorScheme as useNativewindColorScheme } from "nativewind";

export type ThemeMode = "light" | "dark";

const STORAGE_KEY = "fitpro.theme";

interface ThemeContextValue {
  mode: ThemeMode;
  setMode: (mode: ThemeMode) => void;
  toggle: () => void;
  ready: boolean;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

/**
 * Thin wrapper around NativeWind's own color-scheme store so `dark:` classes
 * work everywhere, plus AsyncStorage persistence so the user's explicit
 * choice survives an app restart (we default to dark on first launch per the
 * brand spec, not the OS setting).
 */
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { colorScheme, setColorScheme } = useNativewindColorScheme();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    (async () => {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (stored === "light" || stored === "dark") {
        setColorScheme(stored);
      } else {
        setColorScheme("dark");
      }
      setReady(true);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const mode: ThemeMode = colorScheme === "light" ? "light" : "dark";

  const setMode = (next: ThemeMode) => {
    setColorScheme(next);
    AsyncStorage.setItem(STORAGE_KEY, next).catch(() => {});
  };

  const value = useMemo<ThemeContextValue>(
    () => ({
      mode,
      setMode,
      toggle: () => setMode(mode === "dark" ? "light" : "dark"),
      ready,
    }),
    [mode, ready],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within a ThemeProvider");
  return ctx;
}

/** Brand color tokens (kept in sync with tailwind.config.js `theme.extend.colors`). */
export const brandColors = {
  volt: "#8fef22",
  voltLight: "#aaf94a",
  voltDark: "#57ab09",
  inkBg: "#0a0b11",
  inkSurface: "#14161f",
  paperBg: "#f6f7f9",
  paperSurface: "#ffffff",
};
