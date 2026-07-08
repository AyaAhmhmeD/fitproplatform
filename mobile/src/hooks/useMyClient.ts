import { useCallback, useEffect, useState } from "react";
import { getClient } from "@/lib/api";
import { useAuth } from "@/contexts/auth-context";
import type { ClientProfile } from "@/types";

/**
 * Resolves the signed-in CLIENT user's own ClientProfile.
 *
 * See the KNOWN GAP note in `src/contexts/auth-context.tsx`: there is no
 * `GET /api/clients/me` endpoint, so we rely on `app_metadata.clientId`
 * being present on the Supabase user (an assumption documented there, not
 * a real backend guarantee yet).
 */
export function useMyClient() {
  const { clientId } = useAuth();
  const [client, setClient] = useState<ClientProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!clientId) {
      setError(
        "Your account is missing a linked client profile (app_metadata.clientId). " +
          "Ask an admin to check your account setup.",
      );
      setLoading(false);
      return;
    }
    setError(null);
    setLoading(true);
    try {
      const res = await getClient(clientId);
      setClient(res.client);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  }, [clientId]);

  useEffect(() => {
    load();
  }, [load]);

  return { client, loading, error, reload: load };
}
