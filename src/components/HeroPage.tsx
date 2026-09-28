import React, { useEffect, useRef } from 'react';
import { Logo } from './Logo';
import { ThemeToggle } from './ThemeToggle';
import { AuthButton } from './auth/AuthButton';

export interface HeroPageProps {
  onLearn: () => void;
  onQuiz: () => void;
  onRanked: () => void;
  onAbout: () => void;
}

export const HeroPage: React.FC<HeroPageProps> = ({ onLearn, onQuiz, onRanked, onAbout }) => {
  return (
    <div className="relative flex min-h-screen w-full flex-col overflow-hidden bg-app">
      <div className="pointer-events-none absolute inset-0 warm-glow" />
      <div className="pointer-events-none absolute inset-0 paper-dots opacity-25" />
      <FloatingSymbols />

      <header className="relative z-10 flex items-center justify-between px-6 py-5 sm:px-12">
        <Logo />
        <div className="flex items-center gap-2">
          <button
            onClick={onAbout}
            className="hidden rounded-lg px-3 py-2 text-[13px] font-semibold text-token-2 transition-colors hover:bg-surface-2 hover:text-token sm:block"
          >
            About
          </button>
          <ThemeToggle />
          <AuthButton />
        </div>
      </header>

      <main className="relative z-10 mx-auto w-full max-w-7xl flex-1 px-6 py-10 sm:px-12 sm:py-16">
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-[1.15fr_1fr] lg:gap-16">
          <div className="animate-fade-up">
            <div className="inline-flex items-center gap-2 rounded-full border border-token bg-surface px-3.5 py-1.5 shadow-soft">
              <span className="h-2 w-2 animate-pulse rounded-full bg-moss-500" />
              <span className="font-mono text-[10.5px] font-semibold uppercase tracking-[0.18em] text-token-2">
                JEE · NEET · KEAM
              </span>
            </div>

            <h1 className="mt-6 font-serif text-[44px] leading-[1.05] tracking-editorial text-token sm:text-[58px] md:text-[66px]">
              Learn physics
              <br />
              the way you'll{' '}
              <span className="relative inline-block">
                <span className="relative z-10 text-white">feel it.</span>
                <span
                  className="hero-underline absolute inset-x-[-6px] inset-y-[8px] -z-0 rounded-md"
                  style={{ background: 'rgb(var(--accent))' }}
                />
              </span>
            </h1>

            <p className="mt-7 max-w-lg text-[16px] leading-relaxed text-token-2">
              Interactive lessons, live simulations, and JEE-level practice
              across physics, chemistry, and maths. Every concept — from
              Newton's laws to quadratic equations — with the diagrams and
              animation it deserves.
            </p>

            <div className="mt-10 flex flex-wrap items-center gap-3">
              <button
                onClick={onLearn}
                className="hero-cta group relative inline-flex min-h-[54px] items-center gap-2.5 overflow-hidden rounded-2xl px-7 py-3.5 text-[15px] font-bold text-white shadow-elev transition-all hover:shadow-lux"
                style={{ background: 'rgb(var(--accent))' }}
              >
                <span className="relative z-10">Start learning</span>
                <span className="relative z-10 transition-transform group-hover:translate-x-1">→</span>
                <span className="hero-cta-shine pointer-events-none absolute inset-0" />
              </button>
              <button
                onClick={onRanked}
                className="inline-flex min-h-[54px] items-center gap-2 rounded-2xl border border-token bg-surface px-7 py-3.5 text-[15px] font-semibold text-token shadow-soft transition-all hover:border-strong hover:shadow-elev"
              >
                <span className="h-2 w-2 rounded-full" style={{ background: 'rgb(var(--sage))' }} />
                Try JEE practice
              </button>
            </div>

            <div className="mt-14 grid max-w-lg grid-cols-3 gap-6 border-t border-token pt-8">
              <Stat value={9} suffix="" label="Chapters" />
              <Stat value={5} suffix="" label="Simulations" />
              <Stat value={30} suffix="+" label="JEE problems" />
            </div>
          </div>

          <div className="animate-scale-in">
            <div className="relative overflow-hidden rounded-[28px] border border-token bg-surface shadow-lux">
              <div className="flex items-center justify-between border-b border-token px-6 py-4">
                <div className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full" style={{ background: 'rgb(var(--accent))' }} />
                  <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.16em] text-token-3">
                    Chapter 06
                  </span>
                </div>
                <span className="font-mono text-[11px] text-token-3">Projectile motion</span>
              </div>
              <div className="relative h-[340px] w-full bg-surface-2 paper-dots sm:h-[380px]">
                <HeroArc />
              </div>
              <div className="border-t border-token px-6 py-5">
                <p className="text-[14px] leading-relaxed text-token-2">
                  <span className="font-serif italic text-token">Every instant:</span>{' '}
                  horizontal velocity stays constant, vertical velocity falls
                  by g each second. The apex is the one moment the motion is
                  purely horizontal.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-20 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <FeatureCard
            hue="234 88 12"
            number="01"
            title="Interactive lessons"
            body="Nine chapters across motion, forces, and projectiles. Every concept animates as you read."
            onClick={onLearn}
          />
          <FeatureCard
            hue="124 58 237"
            number="02"
            title="JEE practice"
            body="Thirty JEE Mains-level problems across physics, chemistry, and maths. Worked answers with diagrams."
            onClick={onRanked}
          />
          <FeatureCard
            hue="13 148 136"
            number="03"
            title="Live simulations"
            body="Projectile sandbox and relative-velocity lab. Move a slider, watch the physics respond."
            onClick={onQuiz}
          />
        </div>
      </main>

      <footer className="relative z-10 border-t border-token px-6 py-4 sm:px-12">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <span className="font-mono text-[11px] text-token-3">© ForgeEd 2025</span>
          <span className="font-mono text-[11px] text-token-3">Built for JEE · NEET · KEAM</span>
        </div>
      </footer>
    </div>
  );
};

/* ---------- animated stat counter ---------- */

const Stat: React.FC<{ value: number; suffix: string; label: string }> = ({ value, suffix, label }) => {
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return undefined;
    let raf = 0;
    const start = performance.now();
    const duration = 900;
    const tick = (now: number) => {
      const p = Math.min((now - start) / duration, 1);
      // ease-out cubic
      const eased = 1 - Math.pow(1 - p, 3);
      el.textContent = `${Math.round(value * eased)}${suffix}`;
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [value, suffix]);

  return (
    <div>
      <div ref={ref} className="font-serif text-3xl text-token">0{suffix}</div>
      <div className="mt-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-token-3">
        {label}
      </div>
    </div>
  );
};

/* ---------- floating symbols ---------- */

const FloatingSymbols: React.FC = () => {
  const symbols = [
    { char: 'π', x: '6%', y: '18%', size: 64, delay: 0, duration: 22 },
    { char: '√', x: '92%', y: '12%', size: 72, delay: 2, duration: 26 },
    { char: 'θ', x: '84%', y: '72%', size: 60, delay: 4, duration: 24 },
    { char: 'Σ', x: '4%', y: '78%', size: 56, delay: 1.5, duration: 28 },
    { char: 'e', x: '40%', y: '6%', size: 48, delay: 3, duration: 30 },
    { char: '∫', x: '56%', y: '88%', size: 60, delay: 5, duration: 26 },
    { char: 'mc²', x: '76%', y: '36%', size: 34, delay: 0.5, duration: 24 },
    { char: 'F=ma', x: '12%', y: '44%', size: 30, delay: 2.5, duration: 28 },
  ];

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {symbols.map((s, i) => (
        <span
          key={i}
          className="hero-symbol absolute select-none font-serif italic"
          style={{
            left: s.x,
            top: s.y,
            fontSize: `${s.size}px`,
            color: 'rgb(var(--accent) / 0.06)',
            animationDelay: `${s.delay}s`,
            animationDuration: `${s.duration}s`,
          }}
        >
          {s.char}
        </span>
      ))}
    </div>
  );
};

/* ---------- feature card ---------- */

const FeatureCard: React.FC<{
  hue: string;
  number: string;
  title: string;
  body: string;
  onClick: () => void;
}> = ({ hue, number, title, body, onClick }) => (
  <button
    onClick={onClick}
    className="group flex flex-col items-start rounded-3xl border border-token bg-surface p-7 text-left shadow-soft transition-all hover:-translate-y-0.5 hover:shadow-elev"
  >
    <span
      className="flex h-11 w-11 items-center justify-center rounded-2xl font-mono text-[13px] font-bold text-white shadow-soft transition-transform group-hover:scale-105"
      style={{ background: `rgb(${hue})` }}
    >
      {number}
    </span>
    <span className="mt-6 text-lg font-bold tracking-tight text-token">{title}</span>
    <span className="mt-2 text-[14px] leading-relaxed text-token-2">{body}</span>
    <span
      className="mt-6 text-[13px] font-bold transition-transform group-hover:translate-x-1"
      style={{ color: `rgb(${hue})` }}
    >
      Open →
    </span>
  </button>
);

/* ---------- hero arc canvas ---------- */

const HeroArc: React.FC = () => {
  const ref = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return undefined;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let raf = 0;
    const start = performance.now();

    const resize = () => {
      const w = canvas.parentElement?.clientWidth ?? 500;
      const h = canvas.parentElement?.clientHeight ?? 340;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
    };
    resize();
    const ro = new ResizeObserver(resize);
    if (canvas.parentElement) ro.observe(canvas.parentElement);

    const draw = (now: number) => {
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const w = canvas.width / dpr;
      const h = canvas.height / dpr;
      ctx.clearRect(0, 0, w, h);

      const ox = w * 0.07;
      const oy = h * 0.86;
      const range = w * 0.86;
      const peak = h * 0.68;

      const x = (p: number) => ox + range * p;
      const y = (p: number) => oy - 4 * peak * p * (1 - p);

      ctx.strokeStyle = 'rgba(234, 88, 12, 0.18)';
      ctx.lineWidth = 1;
      ctx.setLineDash([4, 6]);
      ctx.beginPath();
      for (let i = 0; i <= 100; i++) {
        const p = i / 100;
        if (i === 0) ctx.moveTo(x(p), y(p));
        else ctx.lineTo(x(p), y(p));
      }
      ctx.stroke();
      ctx.setLineDash([]);

      const cycle = 4.2;
      const t = ((now - start) / 1000) % cycle;
      const progress = t / cycle;

      const N = Math.max(2, Math.floor(progress * 200));
      const grad = ctx.createLinearGradient(ox, 0, ox + range, 0);
      grad.addColorStop(0, 'rgba(234, 88, 12, 0.05)');
      grad.addColorStop(1, 'rgba(234, 88, 12, 0.85)');
      ctx.strokeStyle = grad;
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      for (let i = 0; i <= N; i++) {
        const p = i / 200;
        if (i === 0) ctx.moveTo(x(p), y(p));
        else ctx.lineTo(x(p), y(p));
      }
      ctx.stroke();

      const px = x(progress);
      const py = y(progress);
      const r = 8;
      ctx.shadowColor = 'rgba(234, 88, 12, 0.6)';
      ctx.shadowBlur = 22;
      const ballGrad = ctx.createRadialGradient(px - r * 0.3, py - r * 0.4, 1, px, py, r);
      ballGrad.addColorStop(0, '#fdba74');
      ballGrad.addColorStop(0.5, '#f97316');
      ballGrad.addColorStop(1, '#c2410c');
      ctx.fillStyle = ballGrad;
      ctx.beginPath();
      ctx.arc(px, py, r, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
      ctx.fillStyle = 'rgba(255,255,255,0.95)';
      ctx.beginPath();
      ctx.arc(px - r * 0.32, py - r * 0.36, r * 0.26, 0, Math.PI * 2);
      ctx.fill();

      raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, []);

  return <canvas ref={ref} style={{ display: 'block', width: '100%', height: '100%' }} />;
};