import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const key = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

/** True when Supabase env vars are set and a client was created. */
export const isSupabaseConfigured: boolean = Boolean(url && key);

/**
 * Supabase client. Null when env vars are missing — every consumer
 * checks `isSupabaseConfigured` before using it. This lets the app
 * compile and run before the backend is wired up.
 */
export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(url!, key!, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    })
  : null;