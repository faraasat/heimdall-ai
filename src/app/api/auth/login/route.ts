import { NextRequest, NextResponse } from 'next/server'
import { createServerClient, type CookieOptions } from '@supabase/ssr'

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      )
    }

    const supabaseKey =
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

    type CookieWrite =
      | { op: 'set'; name: string; value: string; options: CookieOptions }
      | { op: 'remove'; name: string; options: CookieOptions }

    const cookieWrites: CookieWrite[] = []

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      supabaseKey,
      {
        auth: {
          persistSession: true,
        },
        cookies: {
          get(key: string) {
            return request.cookies.get(key)?.value
          },
          set(key: string, value: string, options: CookieOptions) {
            console.log('🍪 Collecting cookie to set:', key)
            cookieWrites.push({ op: 'set', name: key, value, options })
          },
          remove(key: string, options: CookieOptions) {
            console.log('🍪 Collecting cookie to remove:', key)
            cookieWrites.push({ op: 'remove', name: key, options })
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

    // In some setups sign-in doesn't trigger persistence immediately; this forces cookie writes.
    if (data.session) {
      const { error: sessionError } = await supabase.auth.setSession({
        access_token: data.session.access_token,
        refresh_token: data.session.refresh_token,
      })

      if (sessionError) {
        console.error('❌ setSession error:', sessionError.message)
      }
    }

    // Update last_login_at
    await supabase
      .from('users')
      .update({ last_login_at: new Date().toISOString() })
      .eq('id', data.user.id)

    if (cookieWrites.length === 0) {
      console.warn(
        '⚠️ Supabase did not emit any Set-Cookie values during login. ' +
          'Check DevTools Network → POST /api/auth/login → Response Headers for set-cookie.'
      )
    }

    const response = NextResponse.json({
      user: data.user,
      session: data.session,
    })

    if (cookieWrites.length > 0) {
      console.log(
        '📦 Applying Supabase cookies:',
        cookieWrites.map((w) => (w.op === 'set' ? w.name : `${w.name} (remove)`))
      )
    }

    for (const write of cookieWrites) {
      if (write.op === 'set') {
        response.cookies.set(write.name, write.value, write.options as any)
      } else {
        response.cookies.set(write.name, '', { ...(write.options as any), maxAge: 0 })
      }
    }

    console.log('🎯 Final cookies:', response.cookies.getAll().map((c) => c.name))

    return response
  } catch (error) {
    console.error('❌ Login error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
