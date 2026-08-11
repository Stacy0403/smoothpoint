import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database, Json, PlanType } from "@/types/database";
import { getFeaturesForPlan } from "@/lib/plans";

type Supabase = SupabaseClient<Database>;

export interface WatermarkConfig {
  type: "branded" | "none" | "organization";
  url: string | null;
  position?: string;
  opacity?: number;
  width?: number;
  height?: number;
}

export interface LicenseResponse {
  user_id: string;
  plan_type: PlanType;
  features: string[];
  watermark: WatermarkConfig;
  organization: { id: string; name: string } | null;
  subscription: {
    status: string;
    current_period_end: string | null;
    trial_end: string | null;
  } | null;
}

export async function buildLicenseResponse(
  supabase: Supabase,
  userId: string
): Promise<LicenseResponse | null> {
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .single();

  if (!profile) return null;

  const { data: subscription } = await supabase
    .from("subscriptions")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();

  let organization: {
    id: string;
    name: string;
    logo_url: string | null;
    watermark_config: Json;
  } | null = null;

  if (profile.organization_id) {
    const { data: org } = await supabase
      .from("organizations")
      .select("id, name, logo_url, watermark_config")
      .eq("id", profile.organization_id)
      .single();
    organization = org;
  }

  const planType = profile.plan_type;
  const features = getFeaturesForPlan(planType);

  let watermark: WatermarkConfig;

  if (planType === "enterprise" && organization?.logo_url) {
    const cfg = (organization.watermark_config ?? {}) as Record<string, unknown>;
    watermark = {
      type: "organization",
      url: organization.logo_url,
      position: (cfg.position as string) ?? "bottom-right",
      opacity: (cfg.opacity as number) ?? 0.7,
      width: (cfg.width as number) ?? 160,
      height: (cfg.height as number) ?? 48,
    };
  } else if (planType === "free") {
    watermark = { type: "branded", url: null };
  } else {
    watermark = { type: "none", url: profile.watermark_url };
  }

  await supabase
    .from("profiles")
    .update({ last_license_check: new Date().toISOString() })
    .eq("id", userId);

  return {
    user_id: userId,
    plan_type: planType,
    features,
    watermark,
    organization: organization
      ? { id: organization.id, name: organization.name }
      : null,
    subscription: subscription
      ? {
          status: subscription.status,
          current_period_end: subscription.current_period_end,
          trial_end: subscription.trial_end,
        }
      : null,
  };
}
