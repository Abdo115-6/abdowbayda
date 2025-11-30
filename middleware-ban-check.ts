import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Initialize Supabase with service role for ban checks
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Skip ban checks for API routes and static files
  if (
    pathname.startsWith('/api/') ||
    pathname.startsWith('/_next/') ||
    pathname.startsWith('/favicon.ico') ||
    pathname.includes('.')
  ) {
    return NextResponse.next()
  }

  // Get client IP
  const ip = request.headers.get('x-forwarded-for') || 
            request.headers.get('x-real-ip') || 
            'unknown'

  try {
    // Check if IP is banned
    if (ip !== 'unknown') {
      const { data: bannedIp } = await supabase
        .from('banned_ips')
        .select('*')
        .eq('ip_address', ip)
        .single()

      if (bannedIp) {
        console.log('Blocked banned IP:', ip)
        return NextResponse.redirect(new URL('/banned', request.url))
      }
    }

    // For auth pages, also check if email is banned
    if (pathname.startsWith('/auth/') && request.method === 'POST') {
      // This would need to be implemented in the auth API routes
      // as we can't easily get form data in middleware
    }

  } catch (error) {
    // If tables don't exist yet, continue without blocking
    console.log('Ban check failed (tables may not exist):', error)
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}
