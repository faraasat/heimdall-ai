import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function createClient() {
  const cookieStore = await cookies();

  const supabaseKey =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    supabaseKey,
    {
      cookies: {
        get(key: string) {
          return cookieStore.get(key)?.value;
        },
        set(key: string, value: string, options: any) {
          try {
            cookieStore.set(key, value, options);
          } catch {
            // Server Components cannot reliably set cookies.
            // Middleware should refresh sessions and write cookies.
          }
        },
        remove(key: string, options: any) {
          try {
            cookieStore.set(key, "", { ...options, maxAge: 0 });
          } catch {
            // ignore
          }
        },
      },
    },
  );
}
