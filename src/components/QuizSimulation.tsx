import React, { useEffect, useRef, useState } from 'react';
import { simulateShot } from '../engine/PhysicsEngine';
import type { LevelSchema, Vec2 } from '../engine/types';

export interface QuizSimulationProps {
  speed: number;
  angleDeg: number;
  gravity: number;
  success: boolean;
  runKey: number;
  height?: number;
}

type Phase = 'waiting' | 'playing' | 'done';

const PLAY_DURATION_MS = 1300;

function buildLevel(speed: number, angleDeg: number, gravity: number): LevelSchema {
  const theta = (angleDeg * Math.PI) / 180;
  const uy = speed * Math.sin(theta);
  const ux = speed * Math.cos(theta);
  const T = (2 * uy) / gravity;
  const R = ux * T;
  const H = (uy * uy) / (2 * gravity);

  return {
    id: 'quiz-demo',
    version: 1,
    title: '',
    briefing: '',
    world: { width: Math.max(R * 1.15, 12), height: Math.max(H * 2.1, 6) },
    environment: { gravity, airDensity: 0 },
    launcher: {
      position: { x: 0, y: 0 },
      editable: { speed: false, angle: false },
      speedRange: [1, 200],
      angleRange: [1, 89],
    },
    projectile: { mass: 1, radius: 0.22, dragCoefficient: 0 },
    targets: [],
    constraints: { maxFlightTime: T * 1.5 },
  };
}

function toScreen(p: Vec2, level: LevelSchema, w: number, h: number): { x: number; y: number } {
  const padding = 26;
  const usableW = Math.max(w - padding * 2, 40);
  const usableH = Math.max(h - padding * 2, 40);
  const scale = Math.min(usableW / level.world.width, usableH / level.world.height);
  const originX = padding + (usableW - level.world.width * scale) / 2;
  const originY = padding + (usableH + level.world.height * scale) / 2;
  return { x: originX + p.x * scale, y: originY - p.y * scale };
}

/** Draws the static scene with no projectile — the "waiting" baseline. */
function drawIdleScene(
  ctx: CanvasRenderingContext2D,
  cssW: number,
  cssH: number,
): void {
  ctx.clearRect(0, 0, cssW, cssH);
  const bg = ctx.createLinearGradient(0, 0, 0, cssH);
  bg.addColorStop(0, 'rgba(15, 23, 42, 0.9)');
  bg.addColorStop(1, 'rgba(2, 6, 23, 0.95)');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, cssW, cssH);
}

export const QuizSimulation: React.FC<QuizSimulationProps> = ({
  speed,
  angleDeg,
  gravity,
  success,
  runKey,
  height = 260,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [phase, setPhase] = useState<Phase>('waiting');

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const cssW = canvas.clientWidth;
    const cssH = height;
    canvas.width = cssW * dpr;
    canvas.height = cssH * dpr;

    const ctx = canvas.getContext('2d');
    if (!ctx) return undefined;
    ctx.scale(dpr, dpr);

    // CRITICAL: wipe the canvas *before* the early return so a previous
    // question's finished animation never bleeds into the waiting state.
    drawIdleScene(ctx, cssW, cssH);

    if (runKey === 0) {
      setPhase('waiting');
      return undefined;
    }

    const demoAngle = success ? angleDeg : Math.max(8, angleDeg - 14);
    const level = buildLevel(speed, demoAngle, gravity);
    const result = simulateShot(level, { speed, angleDeg: demoAngle });

    const correctLevel = buildLevel(speed, angleDeg, gravity);
    const correctResult = simulateShot(correctLevel, { speed, angleDeg });
    const targetWorld: Vec2 = { x: correctResult.range, y: 0 };
    const targetRadiusWorld = Math.max(correctLevel.world.height * 0.09, 0.6);

    const samples = result.samples;
    let rafId = 0;
    const start = performance.now();
    setPhase('playing');

    const draw = (progress: number, isFinal: boolean) => {
      drawIdleScene(ctx, cssW, cssH);

      const groundLeft = toScreen({ x: -1, y: 0 }, level, cssW, cssH);
      const groundRight = toScreen({ x: level.world.width + 1, y: 0 }, level, cssW, cssH);
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.5)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(groundLeft.x, groundLeft.y);
      ctx.lineTo(groundRight.x, groundRight.y);
      ctx.stroke();

      const targetScr = toScreen(targetWorld, level, cssW, cssH);
      const padding = 26;
      const usableW = Math.max(cssW - padding * 2, 40);
      const usableH = Math.max(cssH - padding * 2, 40);
      const scale = Math.min(usableW / level.world.width, usableH / level.world.height);
      const targetR = Math.max(targetRadiusWorld * scale, 22);

      const hit = isFinal && success;
      ctx.strokeStyle = hit ? '#34d399' : 'rgba(52, 211, 153, 0.85)';
      ctx.lineWidth = 3;
      if (hit) {
        ctx.shadowColor = '#34d399';
        ctx.shadowBlur = 24;
      }
      ctx.beginPath();
      ctx.arc(targetScr.x, targetScr.y - targetR, targetR, 0, Math.PI * 2);
      ctx.stroke();
      ctx.shadowBlur = 0;
      ctx.fillStyle = 'rgba(52, 211, 153, 0.12)';
      ctx.beginPath();
      ctx.arc(targetScr.x, targetScr.y - targetR, targetR, 0, Math.PI * 2);
      ctx.fill();

      const visibleCount = Math.max(1, Math.floor(progress * (samples.length - 1)) + 1);
      ctx.strokeStyle = '#fbbf24';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      for (let i = 0; i < visibleCount; i += 1) {
        const p = toScreen(samples[i].position, level, cssW, cssH);
        if (i === 0) ctx.moveTo(p.x, p.y);
        else ctx.lineTo(p.x, p.y);
      }
      ctx.stroke();

      const head = samples[Math.min(visibleCount - 1, samples.length - 1)];
      const ball = toScreen(head.position, level, cssW, cssH);
      const ballR = 9;

      ctx.shadowColor = 'rgba(239, 68, 68, 0.55)';
      ctx.shadowBlur = 14;
      const rim = ctx.createRadialGradient(
        ball.x - ballR * 0.3,
        ball.y - ballR * 0.35,
        ballR * 0.1,
        ball.x,
        ball.y,
        ballR,
      );
      rim.addColorStop(0, '#fca5a5');
      rim.addColorStop(0.55, '#dc2626');
      rim.addColorStop(1, '#7f1d1d');
      ctx.fillStyle = rim;
      ctx.beginPath();
      ctx.arc(ball.x, ball.y, ballR, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
      ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
      ctx.beginPath();
      ctx.arc(ball.x - ballR * 0.32, ball.y - ballR * 0.36, ballR * 0.22, 0, Math.PI * 2);
      ctx.fill();
    };

    const animate = (now: number) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / PLAY_DURATION_MS, 1);
      const eased = 1 - Math.pow(1 - progress, 2.2);
      draw(eased, progress >= 1);

      if (progress < 1) {
        rafId = requestAnimationFrame(animate);
      } else {
        setPhase('done');
      }
    };

    rafId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafId);
  }, [runKey, success, speed, angleDeg, gravity, height]);

  return (
    <div
      className="relative w-full overflow-hidden rounded-xl border border-slate-800/80"
      style={{ height }}
    >
      <canvas
        ref={canvasRef}
        style={{ width: '100%', height: '100%', display: 'block' }}
      />

      {phase === 'waiting' ? (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm">
          <div className="text-center">
            <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full border-2 border-dashed border-slate-600 text-2xl text-slate-500">
              ?
            </div>
            <p className="text-sm font-semibold text-slate-400">
              Answer to reveal the trajectory
            </p>
          </div>
        </div>
      ) : null}

      {phase === 'done' ? (
        <div
          className={`pointer-events-none absolute inset-0 flex items-center justify-center ${
            success
              ? 'bg-emerald-500/10 backdrop-blur-[1px]'
              : 'bg-rose-500/10 backdrop-blur-[1px]'
          }`}
          style={{ animation: 'quizResultFade 320ms ease-out both' }}
        >
          <div
            className={`rounded-xl border px-5 py-2.5 font-mono text-base font-bold tracking-wide shadow-2xl ${
              success
                ? 'border-emerald-400/60 bg-emerald-500/20 text-emerald-200 shadow-emerald-500/30'
                : 'border-rose-400/60 bg-rose-500/20 text-rose-200 shadow-rose-500/30'
            }`}
          >
            {success ? '✓ SUCCESSFUL' : '✕ TRY AGAIN'}
          </div>
        </div>
      ) : null}
    </div>
  );
};