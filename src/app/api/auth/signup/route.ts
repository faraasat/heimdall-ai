import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'

export async function POST(request: NextRequest) {
  try {
    const { email, password, full_name } = await request.json()

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      )
    }

    const response = NextResponse.json({ success: true })

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll()
          },
          setAll(cookiesToSet: Array<{ name: string; value: string; options?: any }>) {
            cookiesToSet.forEach(({ name, value, options }) => {
              request.cookies.set(name, value)
              response.cookies.set(name, value, options)
            })
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
      // Handle rate limit error with a helpful message
      if (error.message.includes('rate limit') || error.message.includes('Email rate limit exceeded')) {
        return NextResponse.json({ 
          error: 'Too many signup attempts. Please try again in a few minutes, or disable email confirmation in Supabase settings for development.' 
        }, { status: 429 })
      }
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    // Create final response with cookies
    const finalResponse = NextResponse.json({ 
      user: data.user,
      message: 'Signup successful. Please check your email for verification.' 
    })

    // Copy all cookies from the temporary response
    response.cookies.getAll().forEach(cookie => {
      finalResponse.cookies.set(cookie.name, cookie.value)
    })

    return finalResponse
  } catch (error) {
    console.error('Signup error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
