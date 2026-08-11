type PublicEnvKey =
  "NEXT_PUBLIC_SUPABASE_URL" | "NEXT_PUBLIC_SUPABASE_ANON_KEY";

function readOptionalEnv(key: PublicEnvKey) {
  return process.env[key] ?? "";
}

const supabaseUrl = readOptionalEnv("NEXT_PUBLIC_SUPABASE_URL");
const supabaseAnonKey = readOptionalEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY");

export const env = {
  appUrl: process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
  supabaseUrl,
  supabaseAnonKey,
  isSupabaseConfigured: Boolean(supabaseUrl && supabaseAnonKey),
};
