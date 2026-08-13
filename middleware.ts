import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import type { Database } from "@/types/database";
import type { SupabaseCookie } from "@/lib/supabase/cookies";

function normalizeSupabaseUrl(value: string | undefined) {
  if (!value) {
    return "";
  }

  try {
    return new URL(value.trim()).origin;
  } catch {
    return value.trim();
  }
}

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request,
  });
  const supabaseUrl = normalizeSupabaseUrl(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
  );
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON?.trim();

  if (!supabaseUrl || !supabaseAnonKey) {
    return response;
  }

  const supabase = createServerClient<Database>(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet: SupabaseCookie[]) {
        cookiesToSet.forEach(({ name, value }) =>
          request.cookies.set(name, value),
        );
        response = NextResponse.next({
          request,
        });
        cookiesToSet.forEach(({ name, value, options }) => {
          response.cookies.set(name, value, options);
        });
      },
    },
  });

  await supabase.auth.getUser();

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};
