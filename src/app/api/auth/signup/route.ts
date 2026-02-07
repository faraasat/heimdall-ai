import { NextRequest, NextResponse } from 'next/server'
import { createServerClient, type CookieOptions } from '@supabase/ssr'

export async function POST(request: NextRequest) {
  try {
    const { email, password, full_name } = await request.json()

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
        cookies: {
          get(key: string) {
            return request.cookies.get(key)?.value
          },
          set(key: string, value: string, options: CookieOptions) {
            cookieWrites.push({ op: 'set', name: key, value, options })
          },
          remove(key: string, options: CookieOptions) {
            cookieWrites.push({ op: 'remove', name: key, options })
          },
        },
      }
    )

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: full_name || '',
        },
        emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/dashboard`,
      },
    })

    if (error) {
      if (error.message.includes('rate limit') || error.message.includes('Email rate limit exceeded')) {
        return NextResponse.json({ 
          error: 'Too many signup attempts. Please try again in a few minutes, or disable email confirmation in Supabase settings for development.' 
        }, { status: 429 })
      }
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    const response = NextResponse.json({
      user: data.user,
      message: 'Signup successful. Please check your email for verification.',
    })

    for (const write of cookieWrites) {
      if (write.op === 'set') {
        response.cookies.set(write.name, write.value, write.options as any)
      } else {
        response.cookies.set(write.name, '', { ...(write.options as any), maxAge: 0 })
      }
    }

    return response
  } catch (error) {
    console.error('Signup error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
