import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export function GET() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() ?? "";
  const supabaseAnon = process.env.NEXT_PUBLIC_SUPABASE_ANON?.trim() ?? "";
  const supabaseAnonKey =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim() ?? "";
  const supabasePublishableKey =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY?.trim() ?? "";
  const hasPublicSupabaseKey = Boolean(
    supabaseAnon || supabaseAnonKey || supabasePublishableKey,
  );

  return NextResponse.json({
    supabaseConfigured: Boolean(supabaseUrl && hasPublicSupabaseKey),
    variables: {
      NEXT_PUBLIC_SUPABASE_URL: Boolean(supabaseUrl),
      NEXT_PUBLIC_SUPABASE_ANON: Boolean(supabaseAnon),
      NEXT_PUBLIC_SUPABASE_ANON_KEY: Boolean(supabaseAnonKey),
      NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: Boolean(supabasePublishableKey),
    },
  });
}
