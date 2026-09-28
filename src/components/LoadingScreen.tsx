import React, { useEffect, useState } from 'react';

export interface LoadingScreenProps {
  /** How long the loading screen stays visible before fading. ms. */
  duration?: number;
  onComplete?: () => void;
}

export const LoadingScreen: React.FC<LoadingScreenProps> = ({ duration = 2200, onComplete }) => {
  const [progress, setProgress] = useState(0);
  const [fading, setFading] = useState(false);

  useEffect(() => {
    const start = performance.now();
    let raf = 0;
    const tick = (now: number) => {
      const p = Math.min((now - start) / duration, 1);
      setProgress(p);
      if (p < 1) raf = requestAnimationFrame(tick);
      else {
        setFading(true);
        window.setTimeout(() => onComplete?.(), 500);
      }
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [duration, onComplete]);

  return (
    <div
      className="fixed inset-0 z-[9999] flex flex-col items-center justify-center transition-opacity duration-500"
      style={{
        background: 'rgb(var(--bg))',
        opacity: fading ? 0 : 1,
        pointerEvents: fading ? 'none' : 'auto',
      }}
    >
      <div className="pointer-events-none absolute inset-0 warm-glow" />
      <div className="relative flex flex-col items-center">
       {/* Animated logo mark */}
<div
  className="flex h-24 w-24 items-center justify-center rounded-3xl shadow-lux"
  style={{
    background: 'linear-gradient(135deg, rgb(var(--accent)) 0%, rgb(var(--ember)) 100%)',
    transform: `scale(${0.85 + progress * 0.15})`,
    opacity: 0.9 + progress * 0.1,
    transition: 'transform 80ms linear',
  }}
>
  <span className="font-serif text-5xl italic leading-none text-white">F</span>
</div>

        {/* Wordmark */}
        <div className="mt-8 text-center">
          <div
            className="font-serif text-4xl tracking-editorial text-token sm:text-5xl"
            style={{ opacity: Math.min(progress * 2, 1), transition: 'opacity 200ms linear' }}
          >
            ForgeEd
          </div>
          <div
            className="mt-2 font-mono text-[11px] uppercase tracking-[0.28em] text-token-3"
            style={{ opacity: Math.min(Math.max((progress - 0.2) * 2, 0), 1) }}
          >
            Preparing your lab
          </div>
        </div>

        {/* Progress bar */}
        <div className="mt-10 h-[3px] w-52 overflow-hidden rounded-full" style={{ background: 'rgb(var(--border))' }}>
          <div
            className="h-full rounded-full"
            style={{
              width: `${progress * 100}%`,
              background: 'linear-gradient(90deg, rgb(var(--accent)), rgb(var(--ember)))',
              transition: 'width 80ms linear',
            }}
          />
        </div>
      </div>
    </div>
  );
};