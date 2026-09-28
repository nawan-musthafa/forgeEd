import { useCallback, useEffect, useRef, useState } from 'react';
import { SimulationRunner } from '../engine/SimulationRunner';
import { worldFromInput } from '../engine/PhysicsEngine';
import type { LevelSchema, ShotInput, ShotResult, ShotStatus } from '../engine/types';

export interface SandboxConfig {
  speed: number;
  angleDeg: number;
  gravity: number;
}

export const DEFAULT_CONFIG: SandboxConfig = {
  speed: 14,
  angleDeg: 44,
  gravity: 9.81,
};

export interface SimulatorApi {
  runner: SimulationRunner;
  level: LevelSchema;
  status: ShotStatus;
  result: ShotResult | null;
  fire: () => void;
  reset: () => void;
}

function buildLevel(config: SandboxConfig): LevelSchema {
  const { world, maxFlightTime, projectileRadius } = worldFromInput(
    { speed: config.speed, angleDeg: config.angleDeg },
    config.gravity,
  );

  return {
    id: 'sandbox',
    version: 1,
    title: 'Sandbox',
    briefing: '',
    world,
    environment: { gravity: config.gravity, airDensity: 0 },
    launcher: {
      position: { x: 0, y: 0 },
      editable: { speed: true, angle: true },
      speedRange: [1, 120],
      angleRange: [1, 89],
    },
    projectile: { mass: 1, radius: projectileRadius, dragCoefficient: 0 },
    targets: [],
    constraints: { maxFlightTime },
  };
}

export function useSimulator(config: SandboxConfig): SimulatorApi {
  const levelRef = useRef<LevelSchema>(buildLevel(config));
  const level = buildLevel(config);
  levelRef.current = level;

  const [runner] = useState(
    () =>
      new SimulationRunner(levelRef, {
        speed: config.speed,
        angleDeg: config.angleDeg,
      }),
  );

  const [status, setStatus] = useState<ShotStatus>('ready');
  const [result, setResult] = useState<ShotResult | null>(null);

  useEffect(() => {
    runner.start();
    return () => runner.stop();
  }, [runner]);

  useEffect(() => {
    runner.setAim({ speed: config.speed, angleDeg: config.angleDeg });
  }, [runner, config.speed, config.angleDeg]);

  useEffect(
    () =>
      runner.onShotEnd((shot) => {
        setResult(shot);
        setStatus(shot.status);
      }),
    [runner],
  );

  const fire = useCallback(() => {
    setResult(null);
    setStatus('flying');
    runner.fire();
  }, [runner]);

  const reset = useCallback(() => {
    setResult(null);
    setStatus('ready');
    runner.reset();
  }, [runner]);

  return { runner, level, status, result, fire, reset };
}