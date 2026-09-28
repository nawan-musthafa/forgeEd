import React from 'react';

export interface LessonShellProps {
  eyebrow: string;
  title: string;
  lede: string;
  children: React.ReactNode;
  onPrev?: () => void;
  onNext?: () => void;
  prevTitle?: string;
  nextTitle?: string;
}

export const LessonShell: React.FC<LessonShellProps> = ({
  eyebrow,
  title,
  lede,
  children,
  onPrev,
  onNext,
  prevTitle,
  nextTitle,
}) => {
  return (
    <article className="mx-auto w-full max-w-3xl space-y-8">
      <header className="space-y-3">
        <div className="text-[11px] font-bold uppercase tracking-[0.24em] text-sky-400">
          {eyebrow}
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl md:text-5xl">
          {title}
        </h1>
        <p className="text-base leading-relaxed text-slate-400 sm:text-lg">{lede}</p>
      </header>

      <div className="lesson-prose space-y-8">{children}</div>

      <footer className="flex flex-col-reverse gap-3 border-t border-slate-800/80 pt-6 sm:flex-row sm:items-center sm:justify-between">
        {onPrev ? (
          <button
            type="button"
            onClick={onPrev}
            className="min-h-[52px] rounded-xl border border-slate-800 bg-slate-950/60 px-5 py-3 text-left transition-colors hover:border-slate-600"
          >
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
              ← Previous
            </div>
            <div className="text-sm font-semibold text-slate-200">{prevTitle}</div>
          </button>
        ) : (
          <div />
        )}

        {onNext ? (
          <button
            type="button"
            onClick={onNext}
            className="min-h-[52px] rounded-xl bg-gradient-to-r from-sky-500 to-sky-400 px-5 py-3 text-right font-bold text-slate-950 shadow-lg shadow-sky-500/25 transition-all hover:from-sky-400 hover:to-sky-300"
          >
            <div className="text-[10px] font-bold uppercase tracking-wider opacity-70">
              Next →
            </div>
            <div className="text-sm">{nextTitle}</div>
          </button>
        ) : (
          <div />
        )}
      </footer>
    </article>
  );
};