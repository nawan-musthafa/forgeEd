import React from 'react';
import { GRAVITY_PRESETS } from '../engine/equations';

export interface SandboxConfig {
  speed: number;
  angleDeg: number;
  gravity: number;
}

export interface ControlPanelProps {
  config: SandboxConfig;
  inFlight: boolean;
  onConfigChange: (next: SandboxConfig) => void;
  onFire: () => void;
  onReset: () => void;
}

interface SliderProps {
  label: string;
  symbol: React.ReactNode;
  unit: string;
  min: number;
  max: number;
  step: number;
  value: number;
  disabled?: boolean;
  accent: 'sky' | 'emerald' | 'amber';
  onChange: (value: number) => void;
}

const ACCENTS = {
  sky: { text: 'text-sky-400', bar: 'bg-sky-400' },
  emerald: { text: 'text-emerald-400', bar: 'bg-emerald-400' },
  amber: { text: 'text-amber-400', bar: 'bg-amber-400' },
} as const;

const Slider: React.FC<SliderProps> = ({
  label, symbol, unit, min, max, step, value, onChange, accent,
}) => {
  const tone = ACCENTS[accent];
  const pct = ((value - min) / (max - min)) * 100;
  return (
    <div className="space-y-2.5">
      <div className="flex items-baseline justify-between">
        <div className="flex items-baseline gap-2">
          <span className={`font-mono text-[13px] font-semibold ${tone.text}`}>{symbol}</span>
          <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-token-3">
            {label}
          </span>
        </div>
        <div className="flex items-baseline gap-1">
          <span className="font-mono text-[15px] font-semibold text-token font-feature-numeric">
            {value.toFixed(step < 1 ? 2 : 0)}
          </span>
          <span className="font-mono text-[11px] text-token-3">{unit}</span>
        </div>
      </div>

      {/* Two-layer track: thin visual bar + transparent full-height input */}
      <div className="relative h-6">
        <div className="pointer-events-none absolute inset-x-0 top-1/2 h-1.5 -translate-y-1/2 overflow-hidden rounded-full bg-surface-2">
          <div
            className={`h-full rounded-full ${tone.bar}`}
            style={{ width: `${pct}%` }}
          />
        </div>
        <input
          type="range"
          min={min} max={max} step={step} value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="absolute inset-0 h-full w-full"
        />
      </div>

      <div className="flex justify-between font-mono text-[11px] text-token-3">
        <span>{min}</span>
        <span>{max}</span>
      </div>
    </div>
  );
};


export const ControlPanel: React.FC<ControlPanelProps> = ({
  config,
  inFlight,
  onConfigChange,
  onFire,
  onReset,
}) => {
  return (
    <div className="space-y-6">
      <div className="space-y-5">
        <Slider
          label="Launch Speed"
          symbol="u"
          unit="m/s"
          min={1}
          max={120}
          step={0.5}
          value={config.speed}
          disabled={inFlight}
          accent="sky"
          onChange={(speed) => onConfigChange({ ...config, speed })}
        />
        <Slider
          label="Launch Angle"
          symbol="θ"
          unit="°"
          min={1}
          max={89}
          step={1}
          value={config.angleDeg}
          disabled={inFlight}
          accent="emerald"
          onChange={(angleDeg) => onConfigChange({ ...config, angleDeg })}
        />
        <Slider
          label="Gravity"
          symbol="g"
          unit="m/s²"
          min={1}
          max={25}
          step={0.01}
          value={config.gravity}
          disabled={inFlight}
          accent="amber"
          onChange={(gravity) => onConfigChange({ ...config, gravity })}
        />
      </div>

      <div className="space-y-2.5">
        <div className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">
          Gravity Presets
        </div>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {GRAVITY_PRESETS.map((preset) => {
            const active = Math.abs(config.gravity - preset.value) < 0.02;
            return (
              <button
                key={preset.label}
                type="button"
                disabled={inFlight}
                onClick={() => onConfigChange({ ...config, gravity: preset.value })}
                className={`min-h-[44px] rounded-lg border px-2 py-2 text-sm font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-40 ${
                  active
                    ? 'border-amber-500/60 bg-amber-500/15 text-amber-100'
                    : 'border-slate-800 bg-slate-950/60 text-slate-300 hover:border-slate-600 hover:text-slate-100'
                }`}
              >
                {preset.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-[1fr_auto] gap-3">
        <button
          type="button"
          onClick={onFire}
          disabled={inFlight}
          className="min-h-[52px] rounded-xl bg-gradient-to-r from-sky-500 to-sky-400 px-6 py-4 text-base font-bold text-slate-950 shadow-lg shadow-sky-500/25 transition-all hover:from-sky-400 hover:to-sky-300 disabled:cursor-not-allowed disabled:from-slate-700 disabled:to-slate-700 disabled:text-slate-500 disabled:shadow-none"
        >
          {inFlight ? 'In Flight…' : 'Launch'}
        </button>
        <button
          type="button"
          onClick={onReset}
          className="min-h-[52px] rounded-xl border border-slate-800 bg-slate-950/60 px-5 py-4 text-sm font-semibold text-slate-300 transition-colors hover:border-slate-600 hover:text-slate-100"
        >
          Reset
        </button>
      </div>
    </div>
  );
};