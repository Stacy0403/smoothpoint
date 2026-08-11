import { NextResponse } from "next/server";
import { getAuthUser, unauthorized } from "@/lib/auth";

export async function GET() {
  const { supabase, user } = await getAuthUser();
  if (!user) return unauthorized();

  const { data: profile, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (error || !profile) {
    return NextResponse.json({ error: "Profile not found" }, { status: 404 });
  }

  const { data: subscription } = await supabase
    .from("subscriptions")
    .select("*")
    .eq("user_id", user.id)
    .maybeSingle();

  return NextResponse.json({ profile, subscription });
}

export async function PATCH(request: Request) {
  const { supabase, user } = await getAuthUser();
  if (!user) return unauthorized();

  const body = await request.json();
  const { display_name } = body as { display_name?: string };

  const { data, error } = await supabase
    .from("profiles")
    .update({ display_name })
    .eq("id", user.id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ profile: data });
}
