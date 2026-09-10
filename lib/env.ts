// Next.js only inlines NEXT_PUBLIC_* values into the client bundle when they
// are read as static `process.env.NEXT_PUBLIC_X` member expressions.
const rawSupabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() ?? "";
const rawSupabaseAnon = process.env.NEXT_PUBLIC_SUPABASE_ANON?.trim() ?? "";
const rawSupabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim() ?? "";
const rawSupabasePublishableKey =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY?.trim() ?? "";
const supabaseAnonKey =
  rawSupabaseAnon || rawSupabaseAnonKey || rawSupabasePublishableKey;

const acceptedSupabaseKeyNames = [
  "NEXT_PUBLIC_SUPABASE_ANON",
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
  "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY",
];

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
  !supabaseAnonKey
    ? "one public Supabase key: NEXT_PUBLIC_SUPABASE_ANON, NEXT_PUBLIC_SUPABASE_ANON_KEY, or NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY"
    : "",
].filter(Boolean);

export const env = {
  appUrl: process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
  acceptedSupabaseKeyNames,
  supabaseUrl,
  supabaseAnonKey,
  missingSupabaseKeys,
  isSupabaseConfigured: Boolean(supabaseUrl && supabaseAnonKey),
};
