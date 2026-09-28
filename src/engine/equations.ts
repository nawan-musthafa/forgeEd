import type { ProjectileState } from './types';
import { degToRad } from './vector';

export interface DerivedEquations {
  theta: number;
  ux: number;
  uy: number;
  flightTime: number;
  maxHeight: number;
  range: number;
  a: number;
  b: number;
  trajectory: string;
}

export function computeEquations(
  speed: number,
  angleDeg: number,
  gravity: number,
): DerivedEquations {
  const theta = degToRad(angleDeg);
  const ux = speed * Math.cos(theta);
  const uy = speed * Math.sin(theta);

  const flightTime = (2 * uy) / gravity;
  const maxHeight = (uy * uy) / (2 * gravity);
  const range = ux * flightTime;

  const a = Math.tan(theta);
  const b = gravity / (2 * speed * speed * Math.cos(theta) * Math.cos(theta));

  return {
    theta,
    ux,
    uy,
    flightTime,
    maxHeight,
    range,
    a,
    b,
    trajectory: `y = ${a.toFixed(3)}x − ${b.toFixed(4)}x²`,
  };
}

export interface LiveValues {
  time: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  speed: number;
}

export function liveFromState(state: ProjectileState): LiveValues {
  return {
    time: state.time,
    x: state.position.x,
    y: state.position.y,
    vx: state.velocity.x,
    vy: state.velocity.y,
    speed: Math.hypot(state.velocity.x, state.velocity.y),
  };
}

export const GRAVITY_PRESETS: Array<{ label: string; value: number }> = [
  { label: 'Moon', value: 1.62 },
  { label: 'Mars', value: 3.71 },
  { label: 'Earth', value: 9.81 },
  { label: 'Jupiter', value: 24.79 },
];