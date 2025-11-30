import { createServerClient } from "@supabase/ssr"
import { NextResponse, type NextRequest } from "next/server"

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) => supabaseResponse.cookies.set(name, value, options))
        },
      },
    },
  )

  const ip = request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "unknown"

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (user) {
    const { data: profile } = await supabase.from("profiles").select("is_banned, banned_ip").eq("id", user.id).single()

    if (profile?.is_banned || profile?.banned_ip === ip) {
      // User is banned, redirect to banned page
      if (!request.nextUrl.pathname.startsWith("/banned")) {
        const url = request.nextUrl.clone()
        url.pathname = "/banned"
        return NextResponse.redirect(url)
      }
      return supabaseResponse
    }
  } else {
    const { data: bannedProfiles } = await supabase
      .from("profiles")
      .select("banned_ip")
      .eq("banned_ip", ip)
      .eq("is_banned", true)
      .limit(1)

    if (bannedProfiles && bannedProfiles.length > 0) {
      if (!request.nextUrl.pathname.startsWith("/banned")) {
        const url = request.nextUrl.clone()
        url.pathname = "/banned"
        return NextResponse.redirect(url)
      }
      return supabaseResponse
    }
  }

  if (!user && !request.nextUrl.pathname.startsWith("/auth") && !request.nextUrl.pathname.startsWith("/banned")) {
    const url = request.nextUrl.clone()
    url.pathname = "/auth/login"
    return NextResponse.redirect(url)
  }

  return supabaseResponse
}
