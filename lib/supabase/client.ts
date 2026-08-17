"use client";

import { createBrowserClient } from "@supabase/ssr";
import { env } from "@/lib/env";

export function createClient() {
  if (!env.isSupabaseConfigured) {
    throw new Error(
      "Supabase is not configured. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON.",
    );
  }

  return createBrowserClient(env.supabaseUrl, env.supabaseAnonKey);
}

export function createOptionalClient() {
  if (!env.isSupabaseConfigured || typeof window === "undefined") {
    return null;
  }

  return createBrowserClient(env.supabaseUrl, env.supabaseAnonKey);
}
