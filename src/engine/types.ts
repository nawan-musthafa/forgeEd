export interface Vec2 {
  x: number;
  y: number;
}

export type ShotStatus = 'ready' | 'flying' | 'landed' | 'hit' | 'out_of_bounds';

export interface WorldSpec {
  width: number;
  height: number;
}

export interface EnvironmentSpec {
  gravity: number;
  airDensity: number;
}

export interface LauncherSpec {
  position: Vec2;
  editable: { speed: boolean; angle: boolean };
  speedRange: [number, number];
  angleRange: [number, number];
}

export interface ProjectileSpec {
  mass: number;
  radius: number;
  dragCoefficient: number;
}

export interface TargetSpec {
  id: string;
  label: string;
  center: Vec2;
  radius: number;
  points: number;
}

export interface LevelSchema {
  id: string;
  version: number;
  title: string;
  briefing: string;
  world: WorldSpec;
  environment: EnvironmentSpec;
  launcher: LauncherSpec;
  projectile: ProjectileSpec;
  targets: TargetSpec[];
  constraints: { maxFlightTime: number };
}

export interface ShotInput {
  speed: number;
  angleDeg: number;
}

export interface ProjectileState {
  position: Vec2;
  velocity: Vec2;
  time: number;
  status: ShotStatus;
  hitTargetId: string | null;
}

export interface TrajectorySample {
  time: number;
  position: Vec2;
  speed: number;
}

export interface ShotResult {
  status: ShotStatus;
  hitTargetId: string | null;
  flightTime: number;
  range: number;
  apex: number;
  samples: TrajectorySample[];
}