import React, { useEffect, useMemo, useState } from 'react';
import { LESSONS } from './lessons';

export interface LearnPageProps {
  onExit: () => void;
}

const SECTION_ORDER: Array<LessonMeta['section']> = [
  'Foundations',
  'Tools',
  'Projectile Motion',
  'Advanced',
];

type LessonMeta = (typeof LESSONS)[number];

export const LearnPage: React.FC<LearnPageProps> = ({ onExit }) => {
  const [selectedId, setSelectedId] = useState<string>(LESSONS[0].id);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const selectedIndex = LESSONS.findIndex((l) => l.id === selectedId);
  const selected = LESSONS[selectedIndex];

  // Close sidebar automatically when a lesson is picked on mobile.
  useEffect(() => {
    setSidebarOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [selectedId]);

  const grouped = useMemo(() => {
    const map = new Map<LessonMeta['section'], LessonMeta[]>();
    for (const section of SECTION_ORDER) map.set(section, []);
    for (const lesson of LESSONS) map.get(lesson.section)?.push(lesson);
    return map;
  }, []);

  const goPrev = () => {
    if (selectedIndex > 0) setSelectedId(LESSONS[selectedIndex - 1].id);
  };
  const goNext = () => {
    if (selectedIndex < LESSONS.length - 1) setSelectedId(LESSONS[selectedIndex + 1].id);
  };

  const renderLesson = () => {
    if (!selected) return null;

    if (selected.status === 'in-progress' || !selected.Component) {
      return (
        <div className="mx-auto w-full max-w-3xl space-y-6">
          <div className="text-[11px] font-bold uppercase tracking-[0.24em] text-amber-400">
            Chapter {selected.number} · In progress
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl md:text-5xl">
            {selected.title}
          </h1>
          <p className="text-base leading-relaxed text-slate-400 sm:text-lg">
            {selected.summary}
          </p>

          <div className="rounded-2xl border border-amber-500/30 bg-amber-500/5 p-6">
            <div className="mb-2 text-xs font-bold uppercase tracking-[0.14em] text-amber-300">
              Coming soon
            </div>
            <p className="text-sm leading-relaxed text-slate-300">
              This lesson is being written. It will cover the derivation, a worked example,
              an interactive diagram, and one challenge problem — same style as the
              lessons before it.
            </p>
          </div>

          <div className="flex flex-col-reverse gap-3 border-t border-slate-800/80 pt-6 sm:flex-row sm:items-center sm:justify-between">
            {selectedIndex > 0 ? (
              <button
                type="button"
                onClick={goPrev}
                className="min-h-[52px] rounded-xl border border-slate-800 bg-slate-950/60 px-5 py-3 text-left transition-colors hover:border-slate-600"
              >
                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                  ← Previous
                </div>
                <div className="text-sm font-semibold text-slate-200">
                  {LESSONS[selectedIndex - 1].title}
                </div>
              </button>
            ) : (
              <div />
            )}
            {selectedIndex < LESSONS.length - 1 ? (
              <button
                type="button"
                onClick={goNext}
                className="min-h-[52px] rounded-xl bg-gradient-to-r from-sky-500 to-sky-400 px-5 py-3 text-right font-bold text-slate-950 shadow-lg shadow-sky-500/25 transition-all hover:from-sky-400 hover:to-sky-300"
              >
                <div className="text-[10px] font-bold uppercase tracking-wider opacity-70">
                  Next →
                </div>
                <div className="text-sm">{LESSONS[selectedIndex + 1].title}</div>
              </button>
            ) : (
              <div />
            )}
          </div>
        </div>
      );
    }

    const Component = selected.Component;
    return (
      <Component
        onPrev={selectedIndex > 0 ? goPrev : undefined}
        onNext={selectedIndex < LESSONS.length - 1 ? goNext : undefined}
        prevTitle={selectedIndex > 0 ? LESSONS[selectedIndex - 1].title : undefined}
        nextTitle={
          selectedIndex < LESSONS.length - 1 ? LESSONS[selectedIndex + 1].title : undefined
        }
      />
    );
  };

  return (
    <div className="flex min-h-full w-full gap-4">
      {/* Mobile sidebar toggle */}
      <button
        type="button"
        onClick={() => setSidebarOpen((v) => !v)}
        className="fixed bottom-5 right-5 z-30 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-sky-500 to-sky-400 text-2xl font-bold text-slate-950 shadow-2xl shadow-sky-500/40 lg:hidden"
        aria-label="Toggle chapter list"
      >
        {sidebarOpen ? '×' : '☰'}
      </button>

      {/* Sidebar */}
      <aside
        className={`${
          sidebarOpen ? 'block' : 'hidden'
        } fixed inset-0 z-20 overflow-y-auto bg-slate-950/95 p-5 backdrop-blur-xl lg:static lg:block lg:w-72 lg:shrink-0 lg:rounded-2xl lg:border lg:border-slate-800/80 lg:bg-slate-900/50 lg:p-4 lg:backdrop-blur-xl`}
      >
        <div className="mb-4 flex items-center justify-between lg:mb-3">
          <div>
            <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-sky-400">
              Chapter
            </div>
            <div className="text-base font-bold text-white lg:text-sm">
              Projectile Motion
            </div>
          </div>
          <button
            type="button"
            onClick={onExit}
            className="rounded-lg border border-slate-800 bg-slate-950/60 px-3 py-1.5 text-xs font-semibold text-slate-400 transition-colors hover:border-slate-600 hover:text-slate-100"
          >
            Exit
          </button>
        </div>

        <nav className="space-y-5">
          {SECTION_ORDER.map((section) => {
            const lessons = grouped.get(section) ?? [];
            if (lessons.length === 0) return null;
            return (
              <div key={section}>
                <div className="mb-2 px-1 text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500">
                  {section}
                </div>
                <ul className="space-y-1">
                  {lessons.map((lesson) => {
                    const active = lesson.id === selectedId;
                    const inProgress = lesson.status === 'in-progress';
                    return (
                      <li key={lesson.id}>
                        <button
                          type="button"
                          onClick={() => setSelectedId(lesson.id)}
                          className={`flex w-full items-start gap-3 rounded-lg px-3 py-2.5 text-left transition-colors ${
                            active
                              ? 'bg-sky-500/15 text-sky-100'
                              : 'text-slate-300 hover:bg-slate-800/60 hover:text-white'
                          }`}
                        >
                          <span
                            className={`mt-0.5 shrink-0 font-mono text-[11px] font-bold ${
                              active ? 'text-sky-300' : 'text-slate-500'
                            }`}
                          >
                            {lesson.number}
                          </span>
                          <span className="min-w-0 flex-1">
                            <span className="block text-sm font-semibold leading-snug">
                              {lesson.title}
                            </span>
                            {inProgress ? (
                              <span className="mt-0.5 inline-block rounded-full border border-amber-500/40 bg-amber-500/10 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-amber-300">
                                Soon
                              </span>
                            ) : null}
                          </span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </div>
            );
          })}
        </nav>
      </aside>

      {/* Main content */}
      <div className="min-w-0 flex-1 px-1 py-2 lg:px-4">
        {renderLesson()}
      </div>
    </div>
  );
};