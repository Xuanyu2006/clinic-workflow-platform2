import type { CookieOptions } from "@supabase/ssr";

export type SupabaseCookie = {
  name: string;
  value: string;
  options: CookieOptions;
};
