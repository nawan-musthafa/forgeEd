import { useEffect, useReducer, useRef } from 'react';
import type { SimulationRunner } from '../engine/SimulationRunner';
import type { ProjectileState } from '../engine/types';
import { liveFromState, type LiveValues } from '../engine/equations';

const REFRESH_MS = 70;

export function useLiveFrame(runner: SimulationRunner): LiveValues {
  const valuesRef = useRef<LiveValues>(liveFromState(runner.getSnapshot().projectile));
  const [, bump] = useReducer((x: number) => x + 1, 0);

  useEffect(() => {
    let last = 0;
    const unsubscribe = runner.subscribe((frame) => {
      valuesRef.current = liveFromState(frame.projectile as ProjectileState);
      const now = performance.now();
      if (now - last >= REFRESH_MS) {
        last = now;
        bump();
      }
    });
    return unsubscribe;
  }, [runner]);

  return valuesRef.current;
}