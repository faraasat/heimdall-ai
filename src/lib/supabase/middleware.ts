import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabaseKey =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    supabaseKey,
    {
      cookies: {
        get(key: string) {
          return request.cookies.get(key)?.value
        },
        set(key: string, value: string, options: any) {
          request.cookies.set(key, value)
          supabaseResponse.cookies.set(key, value, options)
        },
        remove(key: string, options: any) {
          request.cookies.set(key, '')
          supabaseResponse.cookies.set(key, '', { ...options, maxAge: 0 })
        },
      },
    }
  )

  // IMPORTANT: Avoid writing any logic between createServerClient and
  // supabase.auth.getUser(). A simple mistake could make it very hard to debug
  // issues with users being randomly logged out.

  const {
    data: { user },
    error: authError
  } = await supabase.auth.getUser()

  // Debug logging
  const allCookies = request.cookies.getAll()
  const supabaseCookies = allCookies.filter(c => c.name.includes('sb-'))
  
  console.log('🔍 Middleware check:', {
    path: request.nextUrl.pathname,
    hasUser: !!user,
    authError: authError?.message,
    totalCookies: allCookies.length,
    supabaseCookies: supabaseCookies.length,
    cookieNames: supabaseCookies.map(c => c.name)
  })

  // Protected routes
  if (!user && request.nextUrl.pathname.startsWith('/dashboard')) {
    console.log('❌ No user found, redirecting to login')
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    const redirectResponse = NextResponse.redirect(url)
    supabaseResponse.cookies.getAll().forEach(({ name, value, ...rest }) => {
      redirectResponse.cookies.set(name, value, rest as any)
    })
    return redirectResponse
  }

  // Redirect authenticated users away from auth pages
  if (user && (request.nextUrl.pathname === '/login' || request.nextUrl.pathname === '/signup')) {
    console.log('✅ User authenticated, redirecting to dashboard')
    const url = request.nextUrl.clone()
    url.pathname = '/dashboard'
    const redirectResponse = NextResponse.redirect(url)
    supabaseResponse.cookies.getAll().forEach(({ name, value, ...rest }) => {
      redirectResponse.cookies.set(name, value, rest as any)
    })
    return redirectResponse
  }

  return supabaseResponse
}
