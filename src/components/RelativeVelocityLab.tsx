import React, { useState } from 'react';
import { BoatRiver } from './sim/relvel/BoatRiver';
import { RainMan } from './sim/relvel/RainMan';
import { TrainPass } from './sim/relvel/TrainPass';

type Tab = 'boat' | 'rain' | 'train';

export interface RelativeVelocityLabProps {
  onBack?: () => void;
}

export const RelativeVelocityLab: React.FC<RelativeVelocityLabProps> = ({ onBack }) => {
  const [tab, setTab] = useState<Tab>('boat');

  const tabs: { id: Tab; label: string; sub: string }[] = [
    { id: 'boat', label: 'River crossing', sub: 'drift · min time · min path' },
    { id: 'rain', label: 'Rain & man', sub: 'apparent direction' },
    { id: 'train', label: 'Train passing', sub: 'relative speed · length' },
  ];

  return (
    <div className="w-full space-y-5">
      {onBack && (
        <button onClick={onBack} className="text-[13px] text-token-3 hover:text-token">
          ← Back
        </button>
      )}

      <header className="space-y-2">
        <h1 className="font-serif text-3xl tracking-editorial text-token sm:text-4xl">
          Relative velocity lab
        </h1>
        <p className="max-w-2xl text-[14px] leading-relaxed text-token-2">
          Every relative-motion problem is the same problem: how does the world
          look from a moving observer? Change the observer. Watch the world
          change.
        </p>
      </header>

      <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`rounded-xl border px-4 py-3 text-left transition-all ${
              tab === t.id
                ? 'border-indigo-400 bg-indigo-500/5'
                : 'border-token bg-surface hover:border-strong'
            }`}
          >
            <div className={`text-[13px] font-semibold ${tab === t.id ? 'text-accent' : 'text-token'}`}>
              {t.label}
            </div>
            <div className="mt-0.5 text-[11px] text-token-3">{t.sub}</div>
          </button>
        ))}
      </div>

      {tab === 'boat' && <BoatRiver />}
      {tab === 'rain' && <RainMan />}
      {tab === 'train' && <TrainPass />}
    </div>
  );
};