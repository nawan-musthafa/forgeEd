import React from 'react';
import { computeEquations } from '../engine/equations';

export interface EquationsPanelProps {
  speed: number;
  angleDeg: number;
  gravity: number;
}

interface RowProps {
  symbol: React.ReactNode;
  value: string;
  tone: 'sky' | 'emerald' | 'amber' | 'rose';
}

const TONE_MAP: Record<RowProps['tone'], string> = {
  sky: 'text-sky-300',
  emerald: 'text-emerald-300',
  amber: 'text-amber-300',
  rose: 'text-rose-300',
};

const Row: React.FC<RowProps> = ({ symbol, value, tone }) => (
  <div className="flex items-center justify-between gap-3 border-b border-slate-800/50 py-2 last:border-b-0">
    <div className={`font-mono text-sm font-semibold sm:text-[15px] ${TONE_MAP[tone]}`}>
      {symbol}
    </div>
    <div className="shrink-0 font-mono text-sm font-semibold text-slate-50 sm:text-[15px]">
      {value}
    </div>
  </div>
);

const Card: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <div className="rounded-xl border border-slate-800/80 bg-slate-950/50 p-3 backdrop-blur-sm">
    <h4 className="mb-1.5 text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">
      {title}
    </h4>
    <div>{children}</div>
  </div>
);

const Sub: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <sub className="text-[0.68em] font-normal">{children}</sub>
);

export const EquationsPanel: React.FC<EquationsPanelProps> = ({
  speed,
  angleDeg,
  gravity,
}) => {
  const eq = computeEquations(speed, angleDeg, gravity);
  const fmt = (n: number, digits = 2) => n.toFixed(digits);

  return (
    <div className="space-y-2.5">
      <Card title="Initial Components">
        <Row
          symbol={
            <span>
              u<Sub>x</Sub> = u cos θ
            </span>
          }
          value={`${fmt(eq.ux)} m/s`}
          tone="sky"
        />
        <Row
          symbol={
            <span>
              u<Sub>y</Sub> = u sin θ
            </span>
          }
          value={`${fmt(eq.uy)} m/s`}
          tone="emerald"
        />
      </Card>

      <Card title="Derived Quantities">
        <Row
          symbol={<span>T = 2u sin θ / g</span>}
          value={`${fmt(eq.flightTime)} s`}
          tone="amber"
        />
        <Row
          symbol={<span>H = u² sin²θ / (2g)</span>}
          value={`${fmt(eq.maxHeight)} m`}
          tone="amber"
        />
        <Row
          symbol={<span>R = u² sin 2θ / g</span>}
          value={`${fmt(eq.range)} m`}
          tone="rose"
        />
      </Card>

      <Card title="Equation of Trajectory">
        <div className="space-y-1.5 pt-1">
          <div className="font-mono text-[11px] text-slate-500">
            y = x tan θ − g x² / (2u² cos²θ)
          </div>
          <div className="rounded-lg border border-sky-500/40 bg-sky-500/10 px-3 py-2 font-mono text-sm font-semibold text-sky-100">
            {eq.trajectory}
          </div>
        </div>
      </Card>
    </div>
  );
};