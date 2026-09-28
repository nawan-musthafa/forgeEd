import React from 'react';

/* ------------------------------------------------------------------ */

export const Prose: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <p className="text-[15px] leading-relaxed text-token-2 sm:text-base">{children}</p>
);

/* ------------------------------------------------------------------ */

export type Accent = 'sky' | 'emerald' | 'amber' | 'rose' | 'violet' | 'sage';

const ACCENT_MAP: Record<Accent, string> = {
  sky: 'border-sky-500/40 bg-sky-500/10 text-sky-100',
  emerald: 'border-emerald-500/40 bg-emerald-500/10 text-emerald-100',
  amber: 'border-amber-500/40 bg-amber-500/10 text-amber-100',
  rose: 'border-rose-500/40 bg-rose-500/10 text-rose-100',
  violet: 'border-violet-500/40 bg-violet-500/10 text-violet-100',
  sage: 'border-emerald-500/40 bg-emerald-500/10 text-emerald-100',
};

export const Formula: React.FC<{
  children: React.ReactNode;
  label?: string;
  accent?: Accent;
}> = ({ children, label, accent = 'sky' }) => (
  <div className={`rounded-xl border px-4 py-3 ${ACCENT_MAP[accent]}`}>
    {label ? (
      <div className="mb-1.5 text-[10px] font-bold uppercase tracking-[0.16em] opacity-70">
        {label}
      </div>
    ) : null}
    <div className="font-mono text-[15px] leading-relaxed sm:text-base">{children}</div>
  </div>
);

/* ------------------------------------------------------------------ */

export type CalloutTone = 'info' | 'tip' | 'trap' | 'history';

export const Callout: React.FC<{
  title: string;
  children: React.ReactNode;
  tone?: CalloutTone;
}> = ({ title, children, tone = 'info' }) => {
  const tones = {
    info: {
      border: 'border-sky-500/30',
      bg: 'bg-sky-500/5',
      accent: 'text-sky-300',
      icon: '💡',
    },
    tip: {
      border: 'border-emerald-500/30',
      bg: 'bg-emerald-500/5',
      accent: 'text-emerald-300',
      icon: '✅',
    },
    trap: {
      border: 'border-rose-500/30',
      bg: 'bg-rose-500/5',
      accent: 'text-rose-300',
      icon: '⚠️',
    },
    history: {
      border: 'border-violet-500/30',
      bg: 'bg-violet-500/5',
      accent: 'text-violet-300',
      icon: '📜',
    },
  } as const;

  const t = tones[tone];

  return (
    <div className={`rounded-xl border ${t.border} ${t.bg} px-4 py-3`}>
      <div
        className={`mb-1.5 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.14em] ${t.accent}`}
      >
        <span className="text-sm">{t.icon}</span>
        <span>{title}</span>
      </div>
      <div className="text-[14px] leading-relaxed text-token-2 sm:text-[15px]">{children}</div>
    </div>
  );
};

/* ------------------------------------------------------------------ */

export const Section: React.FC<{
  title: string;
  children: React.ReactNode;
}> = ({ title, children }) => (
  <section className="space-y-3">
    <h3 className="text-lg font-bold tracking-tight text-token sm:text-xl">{title}</h3>
    <div className="space-y-3">{children}</div>
  </section>
);

/* ------------------------------------------------------------------ */

export const KeyList: React.FC<{ items: React.ReactNode[] }> = ({ items }) => (
  <ul className="space-y-2 pl-1">
    {items.map((item, i) => (
      <li key={i} className="flex gap-3 text-[15px] leading-relaxed text-token-2">
        <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-indigo-400/70" />
        <span>{item}</span>
      </li>
    ))}
  </ul>
);

/* ------------------------------------------------------------------ */

export const NumberedSteps: React.FC<{ steps: React.ReactNode[] }> = ({ steps }) => (
  <ol className="space-y-3 pl-1">
    {steps.map((step, i) => (
      <li key={i} className="flex gap-3 text-[15px] leading-relaxed text-token-2">
        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-indigo-500/40 bg-indigo-500/10 font-mono text-[11px] font-bold text-indigo-300">
          {i + 1}
        </span>
        <span className="pt-0.5">{step}</span>
      </li>
    ))}
  </ol>
);

/* ------------------------------------------------------------------ */

export const Sub: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <sub className="text-[0.68em] font-normal">{children}</sub>
);

export const Sup: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <sup className="text-[0.68em] font-normal">{children}</sup>
);

/* ------------------------------------------------------------------ */

export const TryIt: React.FC<{
  label: string;
  min: number;
  max: number;
  step: number;
  value: number;
  onChange: (v: number) => void;
  unit?: string;
  accent?: 'sky' | 'emerald' | 'amber';
}> = ({ label, min, max, step, value, onChange, unit, accent = 'sky' }) => {
  const tone = {
    sky: { text: 'text-sky-300', bar: 'bg-sky-400' },
    emerald: { text: 'text-emerald-300', bar: 'bg-emerald-400' },
    amber: { text: 'text-amber-300', bar: 'bg-amber-400' },
  }[accent];

  const pct = ((value - min) / (max - min)) * 100;

  return (
    <div className="space-y-2">
      <div className="flex items-baseline justify-between">
        <span className="text-xs font-bold uppercase tracking-[0.14em] text-token-3">
          {label}
        </span>
        <span className={`font-mono text-sm font-bold ${tone.text}`}>
          {value.toFixed(step < 1 ? 2 : 0)}
          {unit ? <span className="ml-1 text-[11px] text-token-3">{unit}</span> : null}
        </span>
      </div>
      <div className="relative h-6">
        <div className="pointer-events-none absolute inset-x-0 top-1/2 h-1.5 -translate-y-1/2 overflow-hidden rounded-full bg-surface-2">
          <div className={`h-full rounded-full ${tone.bar} opacity-90`} style={{ width: `${pct}%` }} />
        </div>
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className={`absolute inset-0 h-full w-full ${tone.text}`}
        />
      </div>
    </div>
  );
};