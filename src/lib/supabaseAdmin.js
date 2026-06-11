import { createClient } from '@supabase/supabase-js'

// Server-side only — uses the service role key which bypasses Row Level Security.
// Never import this file in client components or expose via NEXT_PUBLIC_ vars.
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
const anonKey        = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// Use || not ?? so an accidental empty-string value falls back to the anon key
const key = serviceRoleKey || anonKey

console.log('[supabaseAdmin] key type:', serviceRoleKey ? 'SERVICE_ROLE' : 'ANON (SUPABASE_SERVICE_ROLE_KEY not set)')

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  key,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
)

export default supabaseAdmin
