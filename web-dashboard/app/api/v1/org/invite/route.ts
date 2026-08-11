import { NextResponse } from "next/server";
import { getAuthUser, unauthorized } from "@/lib/auth";

export async function POST(request: Request) {
  const { supabase, user } = await getAuthUser();
  if (!user) return unauthorized();

  const body = await request.json();
  const { email, organization_id } = body as {
    email: string;
    organization_id: string;
  };

  if (!email?.trim() || !organization_id) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  const { data: org } = await supabase
    .from("organizations")
    .select("id, admin_id, seat_limit")
    .eq("id", organization_id)
    .single();

  if (!org || org.admin_id !== user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { count } = await supabase
    .from("org_memberships")
    .select("*", { count: "exact", head: true })
    .eq("organization_id", organization_id);

  if ((count ?? 0) >= org.seat_limit) {
    return NextResponse.json({ error: "Seat limit reached" }, { status: 400 });
  }

  const { data: invite, error } = await supabase
    .from("org_invites")
    .insert({
      organization_id,
      email: email.trim().toLowerCase(),
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  return NextResponse.json({
    invite,
    signup_url: `${appUrl}/signup?org=${invite.token}`,
  });
}
