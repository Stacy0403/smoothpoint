import { NextResponse } from "next/server";
import { getAuthUser, unauthorized } from "@/lib/auth";

export async function POST(request: Request) {
  const { supabase, user } = await getAuthUser();
  if (!user) return unauthorized();

  const formData = await request.formData();
  const file = formData.get("file") as File | null;
  const organizationId = formData.get("organization_id") as string | null;

  if (!file || !organizationId) {
    return NextResponse.json({ error: "Missing file or org id" }, { status: 400 });
  }

  const { data: org } = await supabase
    .from("organizations")
    .select("admin_id")
    .eq("id", organizationId)
    .single();

  if (!org || org.admin_id !== user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  if (file.size > 2 * 1024 * 1024) {
    return NextResponse.json({ error: "File too large (max 2MB)" }, { status: 400 });
  }

  const ext = file.name.split(".").pop() ?? "png";
  const path = `${organizationId}/logo.${ext}`;

  const buffer = Buffer.from(await file.arrayBuffer());

  const { error: uploadError } = await supabase.storage
    .from("org-logos")
    .upload(path, buffer, { upsert: true, contentType: file.type });

  if (uploadError) {
    return NextResponse.json({ error: uploadError.message }, { status: 400 });
  }

  const { data: urlData } = supabase.storage
    .from("org-logos")
    .getPublicUrl(path);

  const { data: updated, error } = await supabase
    .from("organizations")
    .update({ logo_url: urlData.publicUrl })
    .eq("id", organizationId)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ organization: updated });
}
