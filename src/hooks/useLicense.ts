import { useCallback, useEffect, useState } from "react";
import { listen } from "@tauri-apps/api/event";
import type { LicenseCache } from "../types";
import { API_BASE, supabase } from "../lib/supabase";
import { tauriInvoke, isTauri } from "./useTauriInvoke";

const CACHE_KEY = "license_cache";

export function useLicense() {
  const [license, setLicense] = useState<LicenseCache | null>(null);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState<string | null>(null);

  const loadFromCache = useCallback(async () => {
    if (isTauri()) {
      try {
        const cached = await tauriInvoke<LicenseCache | null>("get_license_cache");
        if (cached) setLicense(cached);
      } catch {
        // ignore
      }
    } else {
      const raw = localStorage.getItem(CACHE_KEY);
      if (raw) setLicense(JSON.parse(raw));
    }
  }, []);

  const refreshLicense = useCallback(async () => {
    if (!supabase) {
      setLoading(false);
      return;
    }

    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      setLicense(null);
      setEmail(null);
      setLoading(false);
      return;
    }

    setEmail(session.user.email ?? null);

    try {
      const res = await fetch(`${API_BASE}/api/v1/license/check`, {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });

      if (res.ok) {
        const data = await res.json();
        const cache: LicenseCache = {
          ...data,
          cached_at: new Date().toISOString(),
        };
        setLicense(cache);

        if (isTauri()) {
          await tauriInvoke("set_license_cache", { license: cache });
        } else {
          localStorage.setItem(CACHE_KEY, JSON.stringify(cache));
        }
      }
    } catch {
      await loadFromCache();
    }

    setLoading(false);
  }, [loadFromCache]);

  useEffect(() => {
    loadFromCache().then(() => refreshLicense());
  }, [loadFromCache, refreshLicense]);

  useEffect(() => {
    if (!isTauri()) return;

    const unlisten = listen<LicenseCache>("license_updated", (event) => {
      setLicense(event.payload);
    });

    return () => {
      unlisten.then((fn) => fn());
    };
  }, []);

  const hasFeature = (feature: string) =>
    license?.features?.includes(feature) ?? false;

  return {
    license,
    loading,
    email,
    refreshLicense,
    hasFeature,
    isPro: license?.plan_type === "pro" || license?.plan_type === "enterprise",
    isEnterprise: license?.plan_type === "enterprise",
  };
}
