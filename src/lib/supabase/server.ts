import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function createClient() {
  const cookieStore = await cookies();
  const allCookies = cookieStore.getAll();

  console.log(
    "🍪 Server - All cookies received:",
    allCookies.map((c) => c.name),
  );
  
  const authCookies = allCookies.filter((c) => c.name.startsWith("sb-"));
  console.log("🔑 Server - Auth cookies:", authCookies.map((c) => c.name));
  
  // Try to decode and log the cookie value
  if (authCookies.length > 0) {
    try {
      const decoded = Buffer.from(decodeURIComponent(authCookies[0].value), 'base64').toString('utf-8');
      const parsed = JSON.parse(decoded);
      console.log("🔓 Decoded cookie has access_token:", !!parsed.access_token);
    } catch (e) {
      console.log("❌ Failed to decode cookie:", e);
    }
  }

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(
          cookiesToSet: Array<{ name: string; value: string; options?: any }>,
        ) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          } catch (err) {
            console.log(err);
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    },
  );
}
