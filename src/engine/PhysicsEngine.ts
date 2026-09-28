import type {
  LevelSchema,
  ProjectileState,
  ShotInput,
  ShotResult,
  ShotStatus,
  TrajectorySample,
  Vec2,
} from './types';
import { degToRad, fromAngle, squaredDistanceToSegment } from './vector';

export const FIXED_DT = 1 / 120;
export const MAX_SUBSTEPS = 8;

export type StepEvent = 'none' | 'hit' | 'landed' | 'escaped';

export interface StepOutcome {
  state: ProjectileState;
  event: StepEvent;
}

function dragCoefficient(level: LevelSchema): number {
  const { projectile, environment } = level;
  const area = Math.PI * projectile.radius * projectile.radius;
  return (0.5 * environment.airDensity * projectile.dragCoefficient * area) / projectile.mass;
}

export function createInitialState(level: LevelSchema, input: ShotInput): ProjectileState {
  return {
    position: { ...level.launcher.position },
    velocity: fromAngle(degToRad(input.angleDeg), input.speed),
    time: 0,
    status: 'ready',
    hitTargetId: null,
  };
}

function integrate(state: ProjectileState, level: LevelSchema, dt: number): ProjectileState {
  const k = dragCoefficient(level);
  const speed = Math.hypot(state.velocity.x, state.velocity.y);

  const ax = -k * speed * state.velocity.x;
  const ay = -level.environment.gravity - k * speed * state.velocity.y;

  const vx = state.velocity.x + ax * dt;
  const vy = state.velocity.y + ay * dt;

  return {
    position: { x: state.position.x + vx * dt, y: state.position.y + vy * dt },
    velocity: { x: vx, y: vy },
    time: state.time + dt,
    status: 'flying',
    hitTargetId: null,
  };
}

export function step(state: ProjectileState, level: LevelSchema, dt: number): StepOutcome {
  const next = integrate(state, level, dt);
  const { projectile, world } = level;

  for (const target of level.targets) {
    const radius = target.radius + projectile.radius;
    if (
      squaredDistanceToSegment(state.position, next.position, target.center) <=
      radius * radius
    ) {
      return {
        state: { ...next, status: 'hit', hitTargetId: target.id },
        event: 'hit',
      };
    }
  }

  if (next.position.y <= 0) {
    const dy = state.position.y - next.position.y;
    const t = dy > 1e-9 ? Math.min(Math.max(state.position.y / dy, 0), 1) : 0;

    return {
      state: {
        position: {
          x: state.position.x + (next.position.x - state.position.x) * t,
          y: 0,
        },
        velocity: { x: next.velocity.x, y: 0 },
        time: next.time,
        status: 'landed',
        hitTargetId: null,
      },
      event: 'landed',
    };
  }

  if (
    next.position.x < -world.width ||
    next.position.x > world.width * 3 ||
    next.position.y > world.height * 4
  ) {
    return { state: { ...next, status: 'out_of_bounds' }, event: 'escaped' };
  }

  return { state: next, event: 'none' };
}

export interface SimulateOptions {
  maxTime?: number;
  sampleStride?: number;
}

export function simulateShot(
  level: LevelSchema,
  input: ShotInput,
  options: SimulateOptions = {},
): ShotResult {
  const maxTime = options.maxTime ?? level.constraints.maxFlightTime;
  const stride = Math.max(1, Math.floor(options.sampleStride ?? 2));
  const maxSteps = Math.ceil(maxTime / FIXED_DT);

  let state = createInitialState(level, input);
  let apex = state.position.y;
  let event: StepEvent = 'none';

  const samples: TrajectorySample[] = [
    { time: 0, position: { ...state.position }, speed: input.speed },
  ];

  for (let i = 0; i < maxSteps; i += 1) {
    const outcome = step(state, level, FIXED_DT);
    state = outcome.state;
    apex = Math.max(apex, state.position.y);

    if (i % stride === 0 || outcome.event !== 'none') {
      samples.push({
        time: state.time,
        position: { ...state.position },
        speed: Math.hypot(state.velocity.x, state.velocity.y),
      });
    }

    if (outcome.event !== 'none') {
      event = outcome.event;
      break;
    }
  }

  const status: ShotStatus =
    event === 'hit' ? 'hit' : event === 'landed' ? 'landed' : 'out_of_bounds';

  return {
    status,
    hitTargetId: state.hitTargetId,
    flightTime: state.time,
    range: state.position.x - level.launcher.position.x,
    apex,
    samples,
  };
}

export function worldFromInput(
  input: ShotInput,
  gravity: number,
): {
  world: { width: number; height: number };
  maxFlightTime: number;
  projectileRadius: number;
} {
  const theta = degToRad(input.angleDeg);
  const ux = input.speed * Math.cos(theta);
  const uy = input.speed * Math.sin(theta);

  const T = (2 * uy) / gravity;
  const R = ux * T;
  const H = (uy * uy) / (2 * gravity);

  // Tight bounding box around the full trajectory. The renderer scales
  // this to fit the canvas with the launcher pinned at a fixed pixel.
  const width = Math.max(R * 1.04, 2);
  const height = Math.max(H * 1.18, 1.2);

  return {
    world: { width, height },
    maxFlightTime: Math.max(T * 1.6, 4),
    projectileRadius: 0.12,
  };
}