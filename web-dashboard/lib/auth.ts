import { createClient } from "@/lib/supabase/server";
import { asTypedSupabase } from "@/lib/supabase/typed";
import { NextResponse } from "next/server";

export async function getAuthUser() {
  const supabase = asTypedSupabase(await createClient());
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return { supabase, user };
}

export function unauthorized() {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}

export function getBearerToken(request: Request): string | null {
  const header = request.headers.get("authorization");
  if (!header?.startsWith("Bearer ")) return null;
  return header.slice(7);
}
