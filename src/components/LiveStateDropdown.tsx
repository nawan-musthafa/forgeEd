import React, { useState } from 'react';
import type { LiveValues } from '../engine/equations';

export interface LiveStateDropdownProps {
  live: LiveValues;
  valueColor: string;
}

const Row: React.FC<{
  symbol: React.ReactNode;
  value: string;
  color?: string;
  tone?: 'sky' | 'emerald' | 'pink' | 'slate';
}> = ({ symbol, value, color, tone = 'slate' }) => {
  const toneMap = {
    sky: 'text-sky-300',
    emerald: 'text-emerald-300',
    pink: 'text-pink-300',
    slate: 'text-slate-300',
  } as const;

  return (
    <div className="flex items-center justify-between border-b border-slate-800/50 py-2 last:border-b-0">
      <span className={`font-mono text-sm font-semibold ${toneMap[tone]}`}>{symbol}</span>
      <span
        className="font-mono text-sm font-bold"
        style={color ? { color } : undefined}
      >
        {value}
      </span>
    </div>
  );
};

export const LiveStateDropdown: React.FC<LiveStateDropdownProps> = ({
  live,
  valueColor,
}) => {
  const [open, setOpen] = useState(false);
  const fmt = (n: number) => n.toFixed(2);

  return (
    <div className="overflow-hidden rounded-xl border border-slate-800/80 bg-slate-900/60 backdrop-blur-xl">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={`flex w-full items-center justify-between px-4 py-3 transition-colors ${
          open
            ? 'bg-sky-500/10 text-sky-200'
            : 'text-slate-300 hover:bg-slate-800/60 hover:text-slate-100'
        }`}
      >
        <span className="text-xs font-bold uppercase tracking-[0.16em]">Live State</span>
        <span
          className={`text-lg leading-none transition-transform duration-200 ${
            open ? 'rotate-180' : 'rotate-0'
          }`}
        >
          ▾
        </span>
      </button>

      <div
        className="grid transition-all duration-300 ease-out"
        style={{
          gridTemplateRows: open ? '1fr' : '0fr',
        }}
      >
        <div className="overflow-hidden">
          <div className="border-t border-slate-800/80 px-4 py-2">
            <Row symbol="t" value={`${fmt(live.time)} s`} />
            <Row symbol="x" value={`${fmt(live.x)} m`} />
            <Row symbol="y" value={`${fmt(live.y)} m`} />
            <Row
              symbol={
                <span>
                  v<sub className="text-[0.7em]">x</sub>
                </span>
              }
              value={`${fmt(live.vx)} m/s`}
              color={valueColor}
              tone="sky"
            />
            <Row
              symbol={
                <span>
                  v<sub className="text-[0.7em]">y</sub>
                </span>
              }
              value={`${fmt(live.vy)} m/s`}
              color={valueColor}
              tone="emerald"
            />
            <Row symbol="v" value={`${fmt(live.speed)} m/s`} color={valueColor} tone="pink" />
          </div>
        </div>
      </div>
    </div>
  );
};