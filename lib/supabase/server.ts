import { createClient as createSupabaseClient } from "@supabase/supabase-js"

// Server-only client. Uses the secret key, bypasses RLS.
// Never import this file from client components.
export function createServiceClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SECRET_KEY!,
    { auth: { persistSession: false } }
  )
}
