import React from 'react';
import { TimerRing } from './TimerRing';
import { QuizSimulation } from './QuizSimulation';
import type { QuizApi } from '../hooks/useQuiz';

export interface QuizCardProps {
  quiz: QuizApi;
}

const DIFFICULTY_TONE: Record<string, string> = {
  moderate: 'border-amber-500/40 bg-amber-500/10 text-amber-200',
  high: 'border-rose-500/40 bg-rose-500/10 text-rose-200',
};

export const QuizCard: React.FC<QuizCardProps> = ({ quiz }) => {
  const {
    phase,
    question,
    questionIndex,
    totalQuestions,
    selected,
    timeRemaining,
    score,
    select,
    next,
  } = quiz;

  const revealed = phase === 'revealed';
  const answeredCorrectly = revealed && selected === question.correctIndex;
  const timedOut = revealed && selected === null;

  return (
    <div className="mx-auto w-full max-w-5xl space-y-4">
      {/* Header strip */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-800/80 bg-slate-900/70 p-4 backdrop-blur-xl sm:p-5">
        <div className="flex flex-wrap items-center gap-3">
          <div className="rounded-lg border border-slate-700 bg-slate-950/80 px-3 py-1.5 font-mono text-sm text-slate-200">
            Q {questionIndex + 1} / {totalQuestions}
          </div>
          <div
            className={`rounded-lg border px-2.5 py-1.5 text-[10px] font-bold uppercase tracking-[0.16em] ${DIFFICULTY_TONE[question.difficulty]}`}
          >
            {question.difficulty}
          </div>
          <div className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400 sm:text-xs">
            {question.topic}
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <div className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-500">
              Score
            </div>
            <div className="font-mono text-xl font-bold text-emerald-300 sm:text-2xl">
              {score}
            </div>
          </div>
          <TimerRing remaining={timeRemaining} total={question.timeLimit} size={70} />
        </div>
      </div>

      {/* Question */}
      <div className="rounded-2xl border border-slate-800/80 bg-slate-900/70 p-5 backdrop-blur-xl sm:p-6">
        <p className="text-base font-medium leading-relaxed text-slate-100 sm:text-lg">
          {question.question}
        </p>

        <div className="mt-5 space-y-2.5">
          {question.choices.map((choice, index) => {
            const isCorrect = index === question.correctIndex;
            const isSelected = index === selected;

            let tone =
              'border-slate-800 bg-slate-950/70 text-slate-200 hover:border-slate-500 hover:bg-slate-900';
            if (revealed && isCorrect)
              tone = 'border-emerald-500/70 bg-emerald-500/15 text-emerald-50';
            else if (revealed && isSelected && !isCorrect)
              tone = 'border-rose-500/70 bg-rose-500/15 text-rose-50';
            else if (revealed) tone = 'border-slate-800 bg-slate-950/40 text-slate-500';

            const key = String.fromCharCode(65 + index);

            return (
              <button
                key={index}
                type="button"
                disabled={revealed}
                onClick={() => select(index)}
                className={`flex min-h-[56px] w-full items-start gap-3 rounded-xl border px-4 py-3 text-left text-sm transition-all disabled:cursor-default sm:text-[15px] ${tone}`}
              >
                <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-md border border-slate-700/80 bg-slate-950/80 font-mono text-xs font-bold text-slate-300">
                  {key}
                </span>
                <span className="flex-1 leading-relaxed">{choice}</span>
                {revealed && isCorrect ? (
                  <span className="mt-0.5 font-mono text-base text-emerald-300">✓</span>
                ) : null}
                {revealed && isSelected && !isCorrect ? (
                  <span className="mt-0.5 font-mono text-base text-rose-300">✕</span>
                ) : null}
              </button>
            );
          })}
        </div>

        {timedOut ? (
          <div className="mt-3 rounded-lg border border-amber-500/40 bg-amber-500/10 px-3 py-2 text-sm text-amber-200">
            Time expired — marked incorrect.
          </div>
        ) : null}
      </div>

      {/* Simulation */}
      <div className="rounded-2xl border border-slate-800/80 bg-slate-900/70 p-4 backdrop-blur-xl">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <div className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">
            Trajectory Preview
          </div>
          <div className="font-mono text-[11px] text-slate-500">
            u = {question.demo.speed} m/s · θ = {question.demo.angleDeg}° · g ={' '}
            {question.demo.gravity}
          </div>
        </div>
        <QuizSimulation
          speed={question.demo.speed}
          angleDeg={question.demo.angleDeg}
          gravity={question.demo.gravity}
          success={answeredCorrectly}
          runKey={revealed ? questionIndex + 1 : 0}
          height={220}
        />
      </div>

      {revealed ? (
        <div className="rounded-2xl border border-slate-800/80 bg-slate-900/70 p-5 backdrop-blur-xl">
          <div className="mb-2 text-xs font-bold uppercase tracking-[0.18em] text-slate-500">
            Explanation
          </div>
          <p className="text-sm leading-relaxed text-slate-200 sm:text-base">
            {question.explanation}
          </p>

          <div className="mt-5 flex justify-end">
            <button
              type="button"
              onClick={next}
              className="min-h-[48px] rounded-lg bg-gradient-to-r from-sky-500 to-sky-400 px-6 py-3 text-sm font-bold text-slate-950 shadow-lg shadow-sky-500/25 transition-all hover:from-sky-400 hover:to-sky-300 sm:text-base"
            >
              {questionIndex + 1 >= totalQuestions ? 'See Results' : 'Next Question →'}
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
};