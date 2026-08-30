import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/** See web/docs/04-auth-and-identity.md. */
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const supabaseConfigured = Boolean(url && anonKey);
export const supabaseUrl = url ?? "";
export const supabaseAnonKey = anonKey ?? "";

/**
 * Server-side client for ISR/server components. Anon key only — it can read
 * public DERIVED tables and views and nothing else (db/migrations/004_rls.sql).
 * Returns null when env is missing so pages render EmptyState instead of crashing.
 */
export function serverClient(): SupabaseClient | null {
  if (!url || !anonKey) return null;
  return createClient(url, anonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

/**
 * Service-role client — bypasses RLS. Server only, and only for the password-gated raw-reports page
 * (app/admin/reports); the key lives in `SUPABASE_SERVICE_ROLE_KEY` and is never sent to the browser.
 */
export function adminClient(): SupabaseClient | null {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key || typeof window !== "undefined") return null;
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
}

let browser: SupabaseClient | null = null;

/** Browser client (singleton). Persists the anonymous session in localStorage. */
export function browserClient(): SupabaseClient | null {
  if (!url || !anonKey) return null;
  if (typeof window === "undefined") return null;
  if (!browser) {
    browser = createClient(url, anonKey, {
      auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: false },
      realtime: { params: { eventsPerSecond: 5 } },
    });
  }
  return browser;
}

/**
 * Make sure this browser has an anonymous Supabase session and a `users` row.
 * Returns the user id, or null when unconfigured / anonymous sign-in disabled.
 */
export async function ensureSession(sb: SupabaseClient, lang: string): Promise<string | null> {
  const { data: sessionData } = await sb.auth.getSession();
  let userId = sessionData.session?.user.id ?? null;
  if (!userId) {
    // Anonymous sign-in is rate-limited per IP, and Nepali mobile networks put thousands of people behind one
    // carrier-NAT address — a 429 here is transient, not a failure, so back off and try again (QA F3, 30 Aug).
    for (let attempt = 0; attempt < 3 && !userId; attempt++) {
      const { data, error } = await sb.auth.signInAnonymously();
      if (!error) {
        userId = data.user?.id ?? null;
        break;
      }
      const status = (error as { status?: number }).status;
      if (status !== 429 || attempt === 2) return null;
      await new Promise((r) => setTimeout(r, 800 * 2 ** attempt + Math.random() * 400));
    }
  }
  if (!userId) return null;
  await sb.from("users").upsert({ id: userId, lang }, { onConflict: "id", ignoreDuplicates: false });
  return userId;
}
