import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";
import { asTypedSupabase } from "@/lib/supabase/typed";

export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key || key === "your_service_role_key") {
    return null;
  }

  return asTypedSupabase(
    createClient<Database>(url, key, {
      auth: { autoRefreshToken: false, persistSession: false },
    })
  );
}
