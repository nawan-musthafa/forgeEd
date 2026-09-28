/** Small animation + drawing primitives used across every lesson figure. */

export const clamp = (v: number, min: number, max: number): number =>
  Math.min(Math.max(v, min), max);

export const lerp = (a: number, b: number, t: number): number => a + (b - a) * t;

/* ---------- easing ---------- */

export const easeInOutQuad = (x: number): number =>
  x < 0.5 ? 2 * x * x : 1 - Math.pow(-2 * x + 2, 2) / 2;

export const easeOutCubic = (x: number): number => 1 - Math.pow(1 - x, 3);

export const easeOutQuint = (x: number): number => 1 - Math.pow(1 - x, 5);

export const easeInOutCubic = (x: number): number =>
  x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;

export const easeOutBack = (x: number): number => {
  const c1 = 1.70158;
  const c3 = c1 + 1;
  return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2);
};

/* ---------- timeline ---------- */

/**
 * Splits a `progress` in [0, 1] into N segments and returns the segment index
 * plus the eased local progress within that segment.
 */
export function segment(
  progress: number,
  breaks: number[],
  ease: (x: number) => number = easeInOutCubic,
): { index: number; local: number } {
  const p = clamp(progress, 0, 1);
  for (let i = 0; i < breaks.length - 1; i++) {
    if (p <= breaks[i + 1]) {
      const span = breaks[i + 1] - breaks[i];
      const raw = span > 0 ? (p - breaks[i]) / span : 1;
      return { index: i, local: ease(clamp(raw, 0, 1)) };
    }
  }
  return { index: breaks.length - 2, local: 1 };
}

/* ---------- colour tokens (mirror CSS variables) ---------- */

export const colors = {
  text: (alpha = 1) => `rgba(148, 163, 184, ${alpha})`,
  textStrong: (alpha = 1) => `rgba(226, 232, 240, ${alpha})`,
  border: (alpha = 1) => `rgba(148, 163, 184, ${alpha * 0.35})`,
  accent: (alpha = 1) => `rgba(129, 140, 248, ${alpha})`,
  sage: (alpha = 1) => `rgba(74, 222, 128, ${alpha})`,
  ember: (alpha = 1) => `rgba(251, 146, 60, ${alpha})`,
  rose: (alpha = 1) => `rgba(244, 114, 182, ${alpha})`,
  ball: (alpha = 1) => `rgba(239, 68, 68, ${alpha})`,
} as const;

/* ---------- drawing primitives ---------- */

export function drawLine(
  ctx: CanvasRenderingContext2D,
  x1: number, y1: number, x2: number, y2: number,
  color: string, width = 1, dash: number[] = [],
): void {
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = width;
  ctx.setLineDash(dash);
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.stroke();
  ctx.restore();
}

export function drawArrow(
  ctx: CanvasRenderingContext2D,
  x1: number, y1: number, x2: number, y2: number,
  color: string, width = 2,
): void {
  const head = 9;
  const dx = x2 - x1;
  const dy = y2 - y1;
  const len = Math.hypot(dx, dy);
  if (len < 2) return;
  const ux = dx / len;
  const uy = dy / len;
  ctx.save();
  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.lineWidth = width;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2 - ux * head * 0.7, y2 - uy * head * 0.7);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(x2, y2);
  ctx.lineTo(x2 - ux * head - uy * head * 0.45, y2 - uy * head + ux * head * 0.45);
  ctx.lineTo(x2 - ux * head + uy * head * 0.45, y2 - uy * head - ux * head * 0.45);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

export function drawBall(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, r: number, color: string = colors.ball(1),
): void {
  ctx.save();
  ctx.shadowColor = color;
  ctx.shadowBlur = 12;
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;
  ctx.fillStyle = 'rgba(255,255,255,0.85)';
  ctx.beginPath();
  ctx.arc(x - r * 0.3, y - r * 0.35, r * 0.28, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

export function drawGrid(
  ctx: CanvasRenderingContext2D,
  w: number, h: number,
  cols = 10, rows = 6,
  color: string = colors.border(0.5),
): void {
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = 1;
  for (let i = 1; i < cols; i++) {
    const x = (w / cols) * i;
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, h);
    ctx.stroke();
  }
  for (let i = 1; i < rows; i++) {
    const y = (h / rows) * i;
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(w, y);
    ctx.stroke();
  }
  ctx.restore();
}

export function drawLabel(
  ctx: CanvasRenderingContext2D,
  text: string, x: number, y: number,
  color: string = colors.textStrong(0.9),
  font = '11px "JetBrains Mono", ui-monospace, monospace',
): void {
  ctx.save();
  ctx.fillStyle = color;
  ctx.font = font;
  ctx.textBaseline = 'middle';
  ctx.fillText(text, x, y);
  ctx.restore();
}

/** Maps a physics point to canvas pixels. Origin at (ox, oy), y flipped. */
export interface Viewport {
  ox: number; oy: number; sx: number; sy: number;
}
export const vp = (x: number, y: number, v: Viewport): [number, number] => [
  v.ox + x * v.sx,
  v.oy - y * v.sy,
];