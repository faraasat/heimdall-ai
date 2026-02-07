import { NextRequest, NextResponse } from 'next/server'
import { createServerClient, type CookieOptions } from '@supabase/ssr'

export async function POST(request: NextRequest) {
  try {
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

    const { error } = await supabase.auth.signOut()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    const response = NextResponse.json({ message: 'Logged out successfully' })

    for (const write of cookieWrites) {
      if (write.op === 'set') {
        response.cookies.set(write.name, write.value, write.options as any)
      } else {
        response.cookies.set(write.name, '', { ...(write.options as any), maxAge: 0 })
      }
    }

    return response
  } catch (error) {
    console.error('Logout error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
