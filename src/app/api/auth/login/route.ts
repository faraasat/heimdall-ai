import { NextResponse } from 'next/server'
import { createServerClient, type CookieOptions } from '@supabase/ssr'

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      )
    }

    // Collect cookies to set later
    const cookiesToSet: Array<{ name: string; value: string; options: CookieOptions }> = []

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            const cookies = request.headers.get('cookie')
            if (!cookies) return []
            return cookies.split(';').map(cookie => {
              const [name, ...rest] = cookie.trim().split('=')
              return { name, value: rest.join('=') }
            })
          },
          setAll(cookies) {
            cookies.forEach((cookie) => {
              console.log('🍪 Collecting cookie to set:', cookie.name)
              cookiesToSet.push(cookie)
            })
          },
        },
      }
    )

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      console.error('❌ Login error:', error.message)
      return NextResponse.json({ error: error.message }, { status: 401 })
    }

    console.log('✅ Login successful for:', data.user.email)

    // Update last_login_at
    await supabase
      .from('users')
      .update({ last_login_at: new Date().toISOString() })
      .eq('id', data.user.id)

    // Create response with user data
    const response = NextResponse.json({ 
      user: data.user, 
      session: data.session 
    })

    // Manually set auth cookies in Supabase's expected format
    if (data.session) {
      const projectRef = process.env.NEXT_PUBLIC_SUPABASE_URL!.match(/https:\/\/([^.]+)/)?.[1]
      
      // Just the session data, not wrapped in array
      const sessionData = {
        access_token: data.session.access_token,
        refresh_token: data.session.refresh_token,
        expires_at: data.session.expires_at,
        expires_in: data.session.expires_in,
        token_type: data.session.token_type,
        user: data.user,
      }
      
      // Base64 encode the session
      const base64Session = Buffer.from(JSON.stringify(sessionData)).toString('base64')
      
      const cookieOptions = {
        path: '/',
        maxAge: 604800, // 7 days
        sameSite: 'lax' as const,
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
      }
      
      // Set only the base cookie (no chunking)
      const cookieName = `sb-${projectRef}-auth-token`
      response.cookies.set(cookieName, base64Session, cookieOptions)

      console.log('🍪 Set cookie:', cookieName)
    }

    // Also apply any cookies Supabase wanted to set
    if (cookiesToSet.length > 0) {
      console.log('📦 Also applying Supabase cookies:', cookiesToSet.map(c => c.name))
      cookiesToSet.forEach(({ name, value, options }) => {
        response.cookies.set(name, value, options)
      })
    }

    console.log('🎯 Final cookies:', response.cookies.getAll().map(c => c.name))

    return response
  } catch (error) {
    console.error('❌ Login error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
