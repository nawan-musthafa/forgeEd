import React, { useEffect, useRef, useState } from 'react';

export interface FigureDrawApi {
  ctx: CanvasRenderingContext2D;
  w: number;
  h: number;
  t: number;
  time: number;
  progress: number;
  duration: number;
  dpr: number;
}

export interface FigureProps {
  draw: (api: FigureDrawApi) => void;
  /** Base height (mobile). Automatically scaled up on larger viewports. */
  height?: number;
  duration?: number;
  className?: string;
  animated?: boolean;
  deps?: unknown[];
}

function viewportScale(): number {
  if (typeof window === 'undefined') return 1;
  const w = window.innerWidth;
  if (w >= 1536) return 1.9;
  if (w >= 1280) return 1.6;
  if (w >= 1024) return 1.35;
  if (w >= 768) return 1.15;
  return 1;
}

function useViewportScale(): number {
  const [scale, setScale] = useState(viewportScale);
  useEffect(() => {
    const onResize = () => setScale(viewportScale());
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);
  return scale;
}

export const LessonCanvas: React.FC<FigureProps> = ({
  draw,
  height = 260,
  duration = 5,
  className,
  animated = true,
  deps = [],
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const drawRef = useRef<FigureProps['draw']>(draw);
  drawRef.current = draw;
  const scale = useViewportScale();
  const effectiveHeight = Math.round(height * scale);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let raf = 0;
    let start = performance.now();

    const resize = () => {
      const parent = canvas.parentElement;
      const w = parent ? parent.clientWidth : 600;
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(effectiveHeight * dpr);
      canvas.style.width = `${w}px`;
      canvas.style.height = `${effectiveHeight}px`;
    };

    const render = (now: number) => {
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      const wCss = canvas.width / dpr;
      const hCss = canvas.height / dpr;
      const tSec = (now - start) / 1000;
      const progress = duration > 0 ? (tSec % duration) / duration : 0;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, wCss, hCss);
      drawRef.current({
        ctx, w: wCss, h: hCss, t: tSec, time: tSec * 1000, progress, duration, dpr,
      });
    };

    resize();
    start = performance.now();
    render(start);

    const ro = new ResizeObserver(() => {
      resize();
      render(performance.now());
    });
    if (canvas.parentElement) ro.observe(canvas.parentElement);

    if (animated) {
      const loop = (now: number) => {
        render(now);
        raf = requestAnimationFrame(loop);
      };
      raf = requestAnimationFrame(loop);
    }

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [effectiveHeight, duration, animated, ...deps]);

  return (
    <div className={className}>
      <canvas ref={canvasRef} style={{ display: 'block' }} />
    </div>
  );
};