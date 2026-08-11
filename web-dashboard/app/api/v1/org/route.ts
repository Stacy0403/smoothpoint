import { NextResponse } from "next/server";
import { getAuthUser, unauthorized } from "@/lib/auth";
import { isStripeConfigured } from "@/lib/stripe";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";

type Supabase = SupabaseClient<Database>;

async function fetchMembersWithProfiles(
  supabase: Supabase,
  organizationId: string
) {
  const { data: memberships } = await supabase
    .from("org_memberships")
    .select("id, user_id, role, joined_at, invited_at")
    .eq("organization_id", organizationId);

  if (!memberships?.length) return [];

  const userIds = memberships.map((m) => m.user_id);
  const { data: profiles } = await supabase
    .from("profiles")
    .select("id, email, display_name")
    .in("id", userIds);

  return memberships.map((m) => ({
    ...m,
    profiles: profiles?.find((p) => p.id === m.user_id) ?? null,
  }));
}

export async function GET() {
  const { supabase, user } = await getAuthUser();
  if (!user) return unauthorized();

  const { data: profile } = await supabase
    .from("profiles")
    .select("organization_id, plan_type")
    .eq("id", user.id)
    .single();

  if (!profile?.organization_id) {
    const { data: ownedOrg } = await supabase
      .from("organizations")
      .select("*")
      .eq("admin_id", user.id)
      .maybeSingle();

    if (ownedOrg) {
      const members = await fetchMembersWithProfiles(supabase, ownedOrg.id);
      return NextResponse.json({
        organization: ownedOrg,
        members,
        role: "admin",
      });
    }

    return NextResponse.json({ organization: null, members: [], role: null });
  }

  const { data: org } = await supabase
    .from("organizations")
    .select("*")
    .eq("id", profile.organization_id)
    .single();

  const members = await fetchMembersWithProfiles(
    supabase,
    profile.organization_id
  );
  const isAdmin = org?.admin_id === user.id;

  return NextResponse.json({
    organization: org,
    members,
    role: isAdmin ? "admin" : "member",
  });
}

export async function POST(request: Request) {
  const { supabase, user } = await getAuthUser();
  if (!user) return unauthorized();

  const body = await request.json();
  const { name } = body as { name: string };

  if (!name?.trim()) {
    return NextResponse.json({ error: "Name required" }, { status: 400 });
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("plan_type")
    .eq("id", user.id)
    .single();

  if (profile?.plan_type !== "enterprise" && isStripeConfigured()) {
    return NextResponse.json(
      { error: "Enterprise plan required. Contact sales or upgrade plan." },
      { status: 403 }
    );
  }

  // Dev mode: allow org creation without enterprise when Stripe is not configured
  if (profile?.plan_type !== "enterprise" && !isStripeConfigured()) {
    await supabase
      .from("profiles")
      .update({ plan_type: "enterprise" })
      .eq("id", user.id);
  }

  const { data: org, error } = await supabase
    .from("organizations")
    .insert({ name: name.trim(), admin_id: user.id })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  await supabase
    .from("profiles")
    .update({ organization_id: org.id })
    .eq("id", user.id);

  await supabase.from("org_memberships").insert({
    organization_id: org.id,
    user_id: user.id,
    role: "admin",
    joined_at: new Date().toISOString(),
  });

  return NextResponse.json({ organization: org });
}
