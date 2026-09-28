import React, { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';

const tier = (elo: number): { name: string; color: string } => {
  if (elo < 1000) return { name: 'Novice', color: 'text-token-3' };
  if (elo < 1300) return { name: 'Scholar', color: 'text-sky-400' };
  if (elo < 1600) return { name: 'Adept', color: 'text-emerald-400' };
  if (elo < 1900) return { name: 'Sage', color: 'text-amber-400' };
  if (elo < 2200) return { name: 'Archon', color: 'text-rose-400' };
  return { name: 'Grand Scholar', color: 'text-violet-400' };
};

export const AuthButton: React.FC = () => {
  const { configured, user, profile, signInWithGoogle, signOut } = useAuth();
  const [open, setOpen] = useState(false);

  // If Supabase isn't configured yet, render nothing instead of a broken button.
  if (!configured) return null;

  if (!user) {
    return (
      <button
        onClick={signInWithGoogle}
        className="rounded-full bg-accent px-4 py-2 text-[12px] font-semibold shadow-soft transition-shadow hover:shadow-elev"
      >
        Sign in
      </button>
    );
  }

  const t = tier(profile?.elo ?? 800);
  const initial = (profile?.username ?? user.email ?? 'U')[0].toUpperCase();

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-2 rounded-full border border-token bg-surface px-2 py-1 transition-colors hover:border-strong"
      >
        {profile?.avatar_url ? (
          <img src={profile.avatar_url} alt="" className="h-6 w-6 rounded-full" />
        ) : (
          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-accent text-[10px] font-bold">
            {initial}
          </div>
        )}
        <span className={`font-mono text-[11px] font-semibold ${t.color}`}>
          {profile?.elo ?? 800}
        </span>
      </button>

      {open && (
        <div className="absolute right-0 top-full z-30 mt-2 w-56 rounded-xl border border-token bg-surface p-2 shadow-elev">
          <div className="border-b border-token px-3 py-2">
            <div className="text-[13px] font-semibold text-token">
              {profile?.username ?? user.email}
            </div>
            <div className={`mt-0.5 font-mono text-[11px] ${t.color}`}>
              {t.name} · {profile?.elo ?? 800} ELO
            </div>
            <div className="mt-1 font-mono text-[10px] text-token-3">
              {profile?.matches_won ?? 0}W / {profile?.matches_played ?? 0} played
            </div>
          </div>
          <button
            onClick={() => {
              setOpen(false);
              void signOut();
            }}
            className="mt-1 w-full rounded-lg px-3 py-2 text-left text-[12px] text-token-2 transition-colors hover:bg-surface-2 hover:text-token"
          >
            Sign out
          </button>
        </div>
      )}
    </div>
  );
};