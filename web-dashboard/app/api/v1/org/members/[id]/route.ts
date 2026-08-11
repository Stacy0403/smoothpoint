import { NextResponse } from "next/server";
import { getAuthUser, unauthorized } from "@/lib/auth";

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { supabase, user } = await getAuthUser();
  if (!user) return unauthorized();

  const { id } = await params;

  const { data: membership } = await supabase
    .from("org_memberships")
    .select("id, user_id, organization_id")
    .eq("id", id)
    .single();

  if (!membership) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const { data: org } = await supabase
    .from("organizations")
    .select("admin_id")
    .eq("id", membership.organization_id)
    .single();

  if (!org || org.admin_id !== user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await supabase.from("org_memberships").delete().eq("id", id);

  await supabase
    .from("profiles")
    .update({ organization_id: null, plan_type: "free" })
    .eq("id", membership.user_id);

  return NextResponse.json({ success: true });
}
