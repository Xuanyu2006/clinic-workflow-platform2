// Next.js only inlines NEXT_PUBLIC_* values into the client bundle when they
// are read as static `process.env.NEXT_PUBLIC_X` member expressions.
const rawSupabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() ?? "";
const supabaseAnonKey =
  (
    process.env.NEXT_PUBLIC_SUPABASE_ANON ??
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
    ""
  ).trim();

function normalizeSupabaseUrl(value: string) {
  if (!value) {
    return "";
  }

  try {
    return new URL(value).origin;
  } catch {
    return value;
  }
}

const supabaseUrl = normalizeSupabaseUrl(rawSupabaseUrl);
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
