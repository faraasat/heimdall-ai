import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');

  if (code) {
    const supabase = await createClient();
    await supabase.auth.exchangeCodeForSession(code);
    
    // Ensure user exists in users table with default role
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data: existingUser } = await supabase
        .from('users')
        .select('id')
        .eq('id', user.id)
        .single();
      
      if (!existingUser) {
        await supabase.from('users').insert({
          id: user.id,
          email: user.email,
          role: 'user'
        });
      }
    }
  }

  // Redirect to dashboard after successful OAuth
  return NextResponse.redirect(new URL('/dashboard', request.url));
}
