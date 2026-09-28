import { useCallback, useEffect, useMemo, useState } from 'react';
import { QUESTIONS, type QuizQuestion } from '../data/questions';

export type QuizPhase = 'answering' | 'revealed' | 'finished';

export interface AnswerRecord {
  questionId: string;
  selected: number | null;
  correct: boolean;
  timeTaken: number;
}

export interface QuizApi {
  phase: QuizPhase;
  questionIndex: number;
  question: QuizQuestion;
  totalQuestions: number;
  selected: number | null;
  timeRemaining: number;
  score: number;
  answers: AnswerRecord[];
  select: (index: number) => void;
  next: () => void;
  restart: () => void;
}

export function useQuiz(questions: QuizQuestion[] = QUESTIONS): QuizApi {
  const total = questions.length;

  const [questionIndex, setQuestionIndex] = useState(0);
  const [phase, setPhase] = useState<QuizPhase>('answering');
  const [selected, setSelected] = useState<number | null>(null);
  const [timeRemaining, setTimeRemaining] = useState(questions[0]?.timeLimit ?? 60);
  const [answers, setAnswers] = useState<AnswerRecord[]>([]);

  const question = questions[questionIndex];
  const score = useMemo(() => answers.filter((a) => a.correct).length, [answers]);

  // Reset the timer whenever a new question mounts.
  useEffect(() => {
    setTimeRemaining(question.timeLimit);
  }, [question.id, question.timeLimit]);

  // Countdown while answering.
  useEffect(() => {
    if (phase !== 'answering') return undefined;

    const interval = window.setInterval(() => {
      setTimeRemaining((t) => {
        if (t <= 1) {
          window.clearInterval(interval);
          // Time up: record as wrong.
          setSelected(null);
          setPhase('revealed');
          setAnswers((prev) => [
            ...prev,
            {
              questionId: question.id,
              selected: null,
              correct: false,
              timeTaken: question.timeLimit,
            },
          ]);
          return 0;
        }
        return t - 1;
      });
    }, 1000);

    return () => window.clearInterval(interval);
  }, [phase, question.id, question.timeLimit]);

  const select = useCallback(
    (index: number) => {
      if (phase !== 'answering') return;
      const correct = index === question.correctIndex;
      const timeTaken = question.timeLimit - timeRemaining;

      setSelected(index);
      setPhase('revealed');
      setAnswers((prev) => [
        ...prev,
        { questionId: question.id, selected: index, correct, timeTaken },
      ]);
    },
    [phase, question.correctIndex, question.id, question.timeLimit, timeRemaining],
  );

  const next = useCallback(() => {
    if (questionIndex + 1 >= total) {
      setPhase('finished');
      return;
    }
    setQuestionIndex((i) => i + 1);
    setSelected(null);
    setPhase('answering');
  }, [questionIndex, total]);

  const restart = useCallback(() => {
    setQuestionIndex(0);
    setPhase('answering');
    setSelected(null);
    setAnswers([]);
    setTimeRemaining(questions[0]?.timeLimit ?? 60);
  }, [questions]);

  return {
    phase,
    questionIndex,
    question,
    totalQuestions: total,
    selected,
    timeRemaining,
    score,
    answers,
    select,
    next,
    restart,
  };
}