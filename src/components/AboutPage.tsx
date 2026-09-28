import React, { useState } from 'react';

export interface AboutPageProps {
  onBack: () => void;
}

type SubmitState = 'idle' | 'submitting' | 'success' | 'error';

export const AboutPage: React.FC<AboutPageProps> = ({ onBack }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [state, setState] = useState<SubmitState>('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setState('submitting');

    // Placeholder: replace the body with a real endpoint when you have one.
    // Works out of the box with Formspree (https://formspree.io) — you paste
    // your form's endpoint URL and the message is emailed to you.
    const ENDPOINT = ''; // e.g. 'https://formspree.io/f/xxxxxxxx'

    if (!ENDPOINT) {
      // No endpoint configured — simulate success so the UX flow is complete.
      setTimeout(() => {
        setState('success');
        setName('');
        setEmail('');
        setMessage('');
      }, 700);
      return;
    }

    try {
      const res = await fetch(ENDPOINT, {
        method: 'POST',
        headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, message }),
      });
      if (!res.ok) throw new Error('Request failed');
      setState('success');
      setName('');
      setEmail('');
      setMessage('');
    } catch {
      setState('error');
    }
  };

  return (
    <div className="mx-auto w-full max-w-3xl space-y-6">
      <button
        type="button"
        onClick={onBack}
        className="flex items-center gap-2 text-sm font-semibold text-slate-400 transition-colors hover:text-slate-100"
      >
        ← Back
      </button>

      {/* Hero block */}
      <div className="rounded-2xl border border-slate-800/80 bg-gradient-to-br from-slate-900/80 to-slate-950/60 p-6 backdrop-blur-xl sm:p-10">
        <div className="text-[11px] font-bold uppercase tracking-[0.24em] text-sky-400">
          About
        </div>
        <h1 className="mt-3 text-3xl font-bold tracking-tight text-white sm:text-4xl md:text-5xl">
          Learning , the way it should feel
        </h1>
        <p className="mt-5 text-base leading-relaxed text-slate-400 sm:text-lg">
          ForgeEd is an interactive learning lab for competitive STEM students. Instead of
          static diagrams on a whiteboard, you manipulate real variables, watch physics
          happen live, and see the exact equations that govern every moment.
        </p>
      </div>

      {/* What's live / what's coming */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/5 p-6">
          <div className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.14em] text-emerald-300">
            <span className="h-2 w-2 rounded-full bg-emerald-400" />
            Live now
          </div>
          <ul className="space-y-2 text-sm text-slate-200">
            <li>· Projectile motion chapter (6 lessons)</li>
            <li>· Interactive simulator with 4 planetary gravities</li>
            <li>· Live NCERT-formula panel</li>
            <li>· 10-question practice quiz with simulations</li>
          </ul>
        </div>
        <div className="rounded-2xl border border-amber-500/30 bg-amber-500/5 p-6">
          <div className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.14em] text-amber-300">
            <span className="h-2 w-2 rounded-full bg-amber-400" />
            In development
          </div>
          <ul className="space-y-2 text-sm text-slate-200">
            <li>· Projectile from a height</li>
            <li>· Projectile on an incline</li>
            <li>· Relative projectile motion</li>
            <li>· New chapters: waves, thermodynamics, electrostatics</li>
            <li>· 1v1 ELO-based duels</li>
          </ul>
        </div>
      </div>

      {/* Principles */}
      <div className="rounded-2xl border border-slate-800/80 bg-slate-900/60 p-6 backdrop-blur-xl sm:p-8">
        <h2 className="text-xl font-bold tracking-tight text-white sm:text-2xl">
          What we believe
        </h2>
        <div className="mt-5 space-y-5">
          {[
            {
              title: 'Understanding beats memorising',
              body: 'Every equation is derived, not declared. You should know where R = u² sin 2θ / g comes from.',
            },
            {
              title: 'Interaction beats reading',
              body: 'Adjust a slider and see the physics respond. That moment of "oh!" is worth ten pages of text.',
            },
            {
              title: 'Every diagram is drawn, not pasted',
              body: 'All illustrations are rendered live with code. Change a variable, and the physics redraws itself.',
            },
          ].map((p) => (
            <div key={p.title}>
              <div className="text-base font-bold text-slate-100">{p.title}</div>
              <p className="mt-1 text-sm leading-relaxed text-slate-400">{p.body}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Suggestion form */}
      <div className="rounded-2xl border border-slate-800/80 bg-slate-900/60 p-6 backdrop-blur-xl sm:p-8">
        <h2 className="text-xl font-bold tracking-tight text-white sm:text-2xl">
          Send a suggestion
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-slate-400">
          Found a bug? Want a new chapter? Tell us. Every message gets read.
        </p>

        {state === 'success' ? (
          <div className="mt-6 rounded-xl border border-emerald-500/40 bg-emerald-500/10 p-4">
            <div className="text-sm font-bold text-emerald-200">Thank you!</div>
            <p className="mt-1 text-sm text-emerald-100/80">
              Your message has been received. We read every one.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-xs font-bold uppercase tracking-[0.14em] text-slate-400">
                  Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="min-h-[48px] w-full rounded-xl border border-slate-800 bg-slate-950/80 px-4 py-3 text-sm text-slate-100 outline-none transition-colors focus:border-sky-500/60"
                  placeholder="Your name"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-bold uppercase tracking-[0.14em] text-slate-400">
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="min-h-[48px] w-full rounded-xl border border-slate-800 bg-slate-950/80 px-4 py-3 text-sm text-slate-100 outline-none transition-colors focus:border-sky-500/60"
                  placeholder="you@example.com"
                />
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-bold uppercase tracking-[0.14em] text-slate-400">
                Suggestion
              </label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                required
                rows={5}
                className="w-full resize-y rounded-xl border border-slate-800 bg-slate-950/80 px-4 py-3 text-sm text-slate-100 outline-none transition-colors focus:border-sky-500/60"
                placeholder="What would make ForgeEd better?"
              />
            </div>

            {state === 'error' ? (
              <div className="rounded-lg border border-rose-500/40 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
                Something went wrong. Please try again.
              </div>
            ) : null}

            <button
              type="submit"
              disabled={state === 'submitting'}
              className="min-h-[52px] w-full rounded-xl bg-gradient-to-r from-sky-500 to-sky-400 px-6 py-4 text-base font-bold text-slate-950 shadow-lg shadow-sky-500/25 transition-all hover:from-sky-400 hover:to-sky-300 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
            >
              {state === 'submitting' ? 'Sending…' : 'Send Suggestion'}
            </button>
          </form>
        )}
      </div>

      <p className="pb-6 text-center text-xs text-slate-600">
        ForgeEd · An interactive physics lab · Built with care
      </p>
    </div>
  );
};