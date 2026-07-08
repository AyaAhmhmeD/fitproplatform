import "react-native-url-polyfill/auto";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  // Don't throw — let the app boot so the login screen can render a helpful
  // "app isn't configured" message instead of a white screen crash.
  console.warn(
    "[supabase] EXPO_PUBLIC_SUPABASE_URL / EXPO_PUBLIC_SUPABASE_ANON_KEY are not set. " +
      "Copy .env.example to .env and fill them in.",
  );
}

/**
 * Same Supabase project as the web app. Auth lives entirely in Supabase —
 * this client is used for sign-in/up/OAuth/session management, and the
 * resulting access token is forwarded as a Bearer header to the FitPro API
 * (see src/lib/api.ts). We never talk to Postgres directly from the app.
 */
export const supabase = createClient(supabaseUrl ?? "", supabaseAnonKey ?? "", {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
