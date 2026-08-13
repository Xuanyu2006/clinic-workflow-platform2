// Next.js only inlines NEXT_PUBLIC_* values into the client bundle when they
// are read as static `process.env.NEXT_PUBLIC_X` member expressions. Dynamic
// lookups such as `process.env[key]` are left as-is and resolve to undefined in
// the browser, so every read below must stay static.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON ??
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
  "";

const missingSupabaseKeys = [
  !supabaseUrl ? "NEXT_PUBLIC_SUPABASE_URL" : "",
  !supabaseAnonKey ? "NEXT_PUBLIC_SUPABASE_ANON" : "",
].filter(Boolean);

export const env = {
  appUrl: process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
  supabaseUrl,
  supabaseAnonKey,
  missingSupabaseKeys,
  isSupabaseConfigured: Boolean(supabaseUrl && supabaseAnonKey),
};
