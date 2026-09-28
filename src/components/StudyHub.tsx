import React, { useState } from 'react';
import { LESSONS } from './learn/lessons';
import { SimulatorView } from './SimulatorView';
import { RelativeVelocityLab } from './RelativeVelocityLab';
import type { LessonNavProps } from './learn/lessons';

type Panel = 'home' | 'chapters' | 'sims';
type SimKind = 'projectile' | 'relvel';

export interface StudyHubProps {
  onNavigate?: (view: 'ranked' | 'hero') => void;
}

export const StudyHub: React.FC<StudyHubProps> = ({ onNavigate }) => {
  const [panel, setPanel] = useState<Panel>('home');
  const [lessonIndex, setLessonIndex] = useState(0);
  const [simKind, setSimKind] = useState<SimKind>('projectile');

  // ---------- Home ----------
  if (panel === 'home') {
    return (
      <div className="mx-auto w-full max-w-6xl">
        <div className="mb-10">
          <div className="font-mono text-[11px] font-semibold uppercase tracking-[0.22em] text-token-3">
            Study
          </div>
          <h1 className="mt-3 font-serif text-4xl tracking-editorial text-token sm:text-5xl">
            What would you like to do?
          </h1>
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
          <DoorCard
            hue="234 88 12"
            icon="📖"
            label="Learn chapters"
            body="Nine full lessons with live diagrams. Motion basics through relative projectile motion."
            cta="Start learning"
            onClick={() => setPanel('chapters')}
          />
          <DoorCard
            hue="124 58 237"
            icon="🔬"
            label="Simulations"
            body="Projectile sandbox and relative-velocity lab. Adjust variables and watch the physics respond."
            cta="Open the lab"
            onClick={() => setPanel('sims')}
          />
          <DoorCard
            hue="13 148 136"
            icon="🎯"
            label="JEE practice"
            body="Timed problems at JEE Mains level with detailed, worked answers."
            cta="Start practicing"
            onClick={() => onNavigate?.('ranked')}
          />
        </div>
      </div>
    );
  }

  // ---------- Chapters ----------
  if (panel === 'chapters') {
    const lesson = LESSONS[lessonIndex];
    const Comp = lesson?.Component;

    const nav: LessonNavProps = {
      onPrev: lessonIndex > 0 ? () => setLessonIndex((i) => i - 1) : undefined,
      onNext:
        lessonIndex < LESSONS.length - 1
          ? () => setLessonIndex((i) => i + 1)
          : undefined,
      prevTitle: lessonIndex > 0 ? LESSONS[lessonIndex - 1].title : undefined,
      nextTitle:
        lessonIndex < LESSONS.length - 1
          ? LESSONS[lessonIndex + 1].title
          : undefined,
    };

    return (
      <div className="mx-auto w-full max-w-[1400px]">
        <BackBar label="Back to Study" onClick={() => setPanel('home')} />
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[320px_minmax(0,1fr)]">
          <aside className="lg:sticky lg:top-5 lg:self-start">
            <div className="rounded-3xl border border-token bg-surface p-4 shadow-soft">
              <div className="px-2 pb-3 font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-token-3">
                All chapters
              </div>
              <ul className="space-y-1">
                {LESSONS.map((l, idx) => {
                  const active = idx === lessonIndex;
                  return (
                    <li key={l.id}>
                      <button
                        onClick={() => setLessonIndex(idx)}
                        className={`flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-left transition-all ${
                          active ? 'bg-accent shadow-soft' : 'hover:bg-surface-2'
                        }`}
                      >
                        <span
                          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl font-mono text-[12px] font-bold ${
                            active
                              ? 'bg-white/20 text-white'
                              : 'bg-surface-2 text-token-3'
                          }`}
                        >
                          {l.number}
                        </span>
                        <span
                          className={`min-w-0 flex-1 text-[13.5px] font-semibold leading-snug ${
                            active ? 'text-white' : 'text-token'
                          }`}
                        >
                          {l.title}
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          </aside>
          <section className="min-w-0">
            {Comp ? <Comp {...nav} /> : null}
          </section>
        </div>
      </div>
    );
  }

  // ---------- Simulations ----------
  return (
    <div className="mx-auto w-full max-w-6xl">
      <BackBar label="Back to Study" onClick={() => setPanel('home')} />
      <div className="mb-8">
        <h1 className="font-serif text-4xl tracking-editorial text-token">
          Simulations
        </h1>
        <p className="mt-2 max-w-xl text-[14px] text-token-2">
          Every simulation runs on real equations. Adjust a variable, watch the
          animation respond — nothing is scripted.
        </p>
      </div>

      <div className="mb-8 flex flex-wrap gap-2">
        <SimTab
          active={simKind === 'projectile'}
          label="Projectile sandbox"
          hue="234 88 12"
          onClick={() => setSimKind('projectile')}
        />
        <SimTab
          active={simKind === 'relvel'}
          label="Relative velocity lab"
          hue="13 148 136"
          onClick={() => setSimKind('relvel')}
        />
      </div>

      {simKind === 'projectile' && <SimulatorView />}
      {simKind === 'relvel' && <RelativeVelocityLab />}
    </div>
  );
};

/* ---------- helpers ---------- */

const DoorCard: React.FC<{
  hue: string;
  icon: string;
  label: string;
  body: string;
  cta: string;
  onClick: () => void;
}> = ({ hue, icon, label, body, cta, onClick }) => (
  <button
    onClick={onClick}
    className="group flex flex-col items-start rounded-3xl border border-token bg-surface p-7 text-left shadow-soft transition-all hover:-translate-y-1 hover:shadow-elev"
  >
    <div
      className="flex h-14 w-14 items-center justify-center rounded-2xl text-2xl shadow-soft"
      style={{ background: `rgb(${hue} / 0.12)` }}
    >
      <span>{icon}</span>
    </div>
    <div className="mt-6 text-xl font-bold tracking-tight text-token">{label}</div>
    <div className="mt-2 text-[14px] leading-relaxed text-token-2">{body}</div>
    <div
      className="mt-6 text-[13px] font-bold transition-transform group-hover:translate-x-1"
      style={{ color: `rgb(${hue})` }}
    >
      {cta} →
    </div>
  </button>
);

const SimTab: React.FC<{
  active: boolean;
  label: string;
  hue: string;
  onClick: () => void;
}> = ({ active, label, hue, onClick }) => (
  <button
    onClick={onClick}
    className={`rounded-full border px-5 py-2.5 text-[13px] font-bold transition-all ${
      active
        ? 'border-transparent text-white shadow-soft'
        : 'border-token bg-surface text-token-2 hover:border-strong hover:text-token'
    }`}
    style={active ? { background: `rgb(${hue})` } : undefined}
  >
    {label}
  </button>
);

const BackBar: React.FC<{ label: string; onClick: () => void }> = ({
  label,
  onClick,
}) => (
  <button
    onClick={onClick}
    className="mb-5 inline-flex items-center gap-2 rounded-full border border-token bg-surface px-4 py-2 text-[12.5px] font-semibold text-token-2 transition-colors hover:border-strong hover:text-token"
  >
    ← {label}
  </button>
);