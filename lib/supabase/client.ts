import { createBrowserClient } from "@supabase/ssr"

export function createClient() {
  // Temporary debugging
  console.log("[SUPABASE] URL:", process.env.NEXT_PUBLIC_SUPABASE_URL)
  console.log("[SUPABASE] Key exists:", !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
  console.log("[SUPABASE] Key prefix:", process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.substring(0, 20))
  
  return createBrowserClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)
}
