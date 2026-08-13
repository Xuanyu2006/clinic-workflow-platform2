type PublicEnvKey =
  | "NEXT_PUBLIC_SUPABASE_URL"
  | "NEXT_PUBLIC_SUPABASE_ANON"
  | "NEXT_PUBLIC_SUPABASE_ANON_KEY"
  | "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY";

function readOptionalEnv(key: PublicEnvKey) {
  return process.env[key] ?? "";
}

const supabaseUrl = readOptionalEnv("NEXT_PUBLIC_SUPABASE_URL");
const supabaseAnonKey =
  readOptionalEnv("NEXT_PUBLIC_SUPABASE_ANON") ||
  readOptionalEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY") ||
  readOptionalEnv("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY");
const missingSupabaseKeys = [
  !supabaseUrl ? "NEXT_PUBLIC_SUPABASE_URL" : "",
  !supabaseAnonKey
    ? "NEXT_PUBLIC_SUPABASE_ANON, NEXT_PUBLIC_SUPABASE_ANON_KEY, or NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY"
    : "",
].filter(Boolean);

export const env = {
  appUrl: process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
  supabaseUrl,
  supabaseAnonKey,
  missingSupabaseKeys,
  isSupabaseConfigured: Boolean(supabaseUrl && supabaseAnonKey),
};
