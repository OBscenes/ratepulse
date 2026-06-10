import { createClient } from '@supabase/supabase-js'

// Server-side only — uses the service role key which bypasses Row Level Security.
// Never import this file in client components or expose via NEXT_PUBLIC_ vars.
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

export default supabaseAdmin
