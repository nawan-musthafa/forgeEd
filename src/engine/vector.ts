import type { Vec2 } from './types';

export const degToRad = (deg: number): number => (deg * Math.PI) / 180;

export const magnitude = (v: Vec2): number => Math.hypot(v.x, v.y);

export const fromAngle = (radians: number, length: number): Vec2 => ({
  x: Math.cos(radians) * length,
  y: Math.sin(radians) * length,
});

export function squaredDistanceToSegment(a: Vec2, b: Vec2, c: Vec2): number {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const lengthSq = dx * dx + dy * dy;

  let t = 0;
  if (lengthSq > 1e-12) {
    t = ((c.x - a.x) * dx + (c.y - a.y) * dy) / lengthSq;
    t = t < 0 ? 0 : t > 1 ? 1 : t;
  }

  const px = a.x + dx * t - c.x;
  const py = a.y + dy * t - c.y;
  return px * px + py * py;
}