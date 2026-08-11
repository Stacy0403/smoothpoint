import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";

export type TypedSupabase = SupabaseClient<Database>;

/** Bridge @supabase/ssr client typing with our Database schema */
export function asTypedSupabase(client: unknown): TypedSupabase {
  return client as TypedSupabase;
}
