import { createClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL ?? "";
const key = import.meta.env.VITE_SUPABASE_ANON_KEY ?? "";

export const supabase =
  url && key && !key.includes("your_anon")
    ? createClient(url, key)
    : null;

export const API_BASE =
  import.meta.env.VITE_API_BASE_URL ?? "http://localhost:3000";
