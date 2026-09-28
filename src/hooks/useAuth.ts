import { useEffect, useState } from 'react';
import type { User } from '@supabase/supabase-js';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

export interface Profile {
  id: string;
  username: string | null;
  email: string | null;
  avatar_url: string | null;
  elo: number;
  matches_played: number;
  matches_won: number;
}

export interface AuthState {
  configured: boolean;
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

let cachedUser: User | null = null;
let cachedProfile: Profile | null = null;
const listeners = new Set<() => void>();
const notify = () => listeners.forEach((l) => l());

async function loadProfile(userId: string) {
  if (!supabase) return;
  const { data } = await supabase.from('profiles').select('*').eq('id', userId).single();
  cachedProfile = (data as Profile | null) ?? null;
  notify();
}

export function useAuth(): AuthState {
  const [, force] = useState(0);
  const [loading, setLoading] = useState(isSupabaseConfigured);

  useEffect(() => {
    if (!supabase) {
      setLoading(false);
      return undefined;
    }

    const sub = () => force((n) => n + 1);
    listeners.add(sub);

    supabase.auth.getSession().then(({ data }) => {
      cachedUser = data.session?.user ?? null;
      if (cachedUser) void loadProfile(cachedUser.id);
      setLoading(false);
      notify();
    });

    const { data: authSub } = supabase.auth.onAuthStateChange((_event, session) => {
      cachedUser = session?.user ?? null;
      if (cachedUser) void loadProfile(cachedUser.id);
      else cachedProfile = null;
      notify();
    });

    return () => {
      listeners.delete(sub);
      authSub.subscription.unsubscribe();
    };
  }, []);

  const signInWithGoogle = async () => {
    if (!supabase) {
      // eslint-disable-next-line no-console
      console.warn('[ForgeEd] Supabase not configured — cannot sign in.');
      return;
    }
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin },
    });
  };

  const signOut = async () => {
    if (!supabase) return;
    await supabase.auth.signOut();
    cachedUser = null;
    cachedProfile = null;
    notify();
  };

  const refreshProfile = async () => {
    if (cachedUser) await loadProfile(cachedUser.id);
  };

  return {
    configured: isSupabaseConfigured,
    user: cachedUser,
    profile: cachedProfile,
    loading,
    signInWithGoogle,
    signOut,
    refreshProfile,
  };
}