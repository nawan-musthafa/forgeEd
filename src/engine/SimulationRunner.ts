import { FIXED_DT, MAX_SUBSTEPS, createInitialState, step } from './PhysicsEngine';
import type {
  LevelSchema,
  ProjectileState,
  ShotInput,
  ShotResult,
  TrajectorySample,
  Vec2,
} from './types';

export const MAX_TRAIL_POINTS = 2400;

export interface FrameState {
  projectile: ProjectileState;
  trail: readonly Vec2[];
  aim: ShotInput;
  active: boolean;
}

type FrameListener = (frame: FrameState) => void;
type ShotEndListener = (result: ShotResult) => void;

export function defaultAim(): ShotInput {
  return { speed: 30, angleDeg: 45 };
}

export class SimulationRunner {
  private readonly levelRef: { current: LevelSchema };
  private aim: ShotInput;
  private projectile: ProjectileState;
  private trail: Vec2[] = [];
  private samples: TrajectorySample[] = [];
  private accumulator = 0;
  private lastTimestamp = 0;
  private rafId: number | null = null;
  private active = false;
  private apex = 0;
  private stepCount = 0;

  private readonly frameListeners = new Set<FrameListener>();
  private readonly shotEndListeners = new Set<ShotEndListener>();

  constructor(
    levelRef: { current: LevelSchema },
    initialAim: ShotInput = defaultAim(),
  ) {
    this.levelRef = levelRef;
    this.aim = initialAim;
    this.projectile = createInitialState(levelRef.current, initialAim);
    this.apex = this.projectile.position.y;
  }

  private get level(): LevelSchema {
    return this.levelRef.current;
  }

  start(): void {
    if (this.rafId !== null) return;
    this.lastTimestamp = 0;
    this.rafId = requestAnimationFrame(this.tick);
  }

  stop(): void {
    if (this.rafId === null) return;
    cancelAnimationFrame(this.rafId);
    this.rafId = null;
    this.lastTimestamp = 0;
  }

  destroy(): void {
    this.stop();
    this.frameListeners.clear();
    this.shotEndListeners.clear();
  }

  subscribe(listener: FrameListener): () => void {
    this.frameListeners.add(listener);
    return () => {
      this.frameListeners.delete(listener);
    };
  }

  onShotEnd(listener: ShotEndListener): () => void {
    this.shotEndListeners.add(listener);
    return () => {
      this.shotEndListeners.delete(listener);
    };
  }

  getSnapshot(): FrameState {
    return {
      projectile: this.projectile,
      trail: this.trail,
      aim: this.aim,
      active: this.active,
    };
  }

  setAim(aim: ShotInput): void {
    this.aim = aim;
    if (!this.active) {
      this.projectile = createInitialState(this.level, aim);
      this.apex = this.projectile.position.y;
      this.trail = [];
      this.samples = [];
    }
  }

  fire(): void {
    this.projectile = createInitialState(this.level, this.aim);
    this.trail = [{ ...this.projectile.position }];
    this.samples = [
      { time: 0, position: { ...this.projectile.position }, speed: this.aim.speed },
    ];
    this.apex = this.projectile.position.y;
    this.accumulator = 0;
    this.stepCount = 0;
    this.active = true;
  }

  reset(): void {
    this.active = false;
    this.accumulator = 0;
    this.projectile = createInitialState(this.level, this.aim);
    this.apex = this.projectile.position.y;
    this.trail = [];
    this.samples = [];
  }

  private readonly tick = (timestamp: number): void => {
    this.rafId = requestAnimationFrame(this.tick);

    if (this.lastTimestamp === 0) this.lastTimestamp = timestamp;
    const delta = Math.min((timestamp - this.lastTimestamp) / 1000, 0.25);
    this.lastTimestamp = timestamp;

    if (this.active) {
      this.accumulator += delta;
      let substeps = 0;

      while (this.accumulator >= FIXED_DT && substeps < MAX_SUBSTEPS && this.active) {
        this.advance(FIXED_DT);
        this.accumulator -= FIXED_DT;
        substeps += 1;
      }

      if (substeps >= MAX_SUBSTEPS) this.accumulator = 0;
    }

    const frame = this.getSnapshot();
    this.frameListeners.forEach((listener) => listener(frame));
  };

  private advance(dt: number): void {
    const outcome = step(this.projectile, this.level, dt);
    this.projectile = outcome.state;
    this.apex = Math.max(this.apex, this.projectile.position.y);

    this.trail.push({ ...this.projectile.position });
    if (this.trail.length > MAX_TRAIL_POINTS) this.trail.shift();

    this.stepCount += 1;
    if (this.stepCount % 2 === 0) {
      this.samples.push({
        time: this.projectile.time,
        position: { ...this.projectile.position },
        speed: Math.hypot(this.projectile.velocity.x, this.projectile.velocity.y),
      });
    }

    if (outcome.event !== 'none') {
      this.active = false;
      const result: ShotResult = {
        status: this.projectile.status,
        hitTargetId: this.projectile.hitTargetId,
        flightTime: this.projectile.time,
        range: this.projectile.position.x - this.level.launcher.position.x,
        apex: this.apex,
        samples: this.samples,
      };
      this.shotEndListeners.forEach((listener) => listener(result));
    }
  }
}