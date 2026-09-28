import React, { useEffect, useRef } from 'react';
import { ProjectileRenderer, type RendererMetrics } from '../render/ProjectileRenderer';
import { ScalingBackground } from './ScalingBackground';
import type { SimulationRunner } from '../engine/SimulationRunner';
import type { LevelSchema, TrajectorySample } from '../engine/types';

export interface PhysicsViewportProps {
  runner: SimulationRunner;
  level: LevelSchema;
  preview: readonly TrajectorySample[] | null;
  /** Current launch speed — used to scale the background. */
  speed: number;
  maxSpeed?: number;
  backgroundImage?: string;
  backgroundFallback?: string;
  onMetrics?: (m: RendererMetrics) => void;
  className?: string;
}

export const PhysicsViewport: React.FC<PhysicsViewportProps> = ({
  runner,
  level,
  preview,
  speed,
  maxSpeed = 120,
  backgroundImage,
  backgroundFallback,
  onMetrics,
  className,
}) => {
  const hostRef = useRef<HTMLDivElement | null>(null);
  const rendererRef = useRef<ProjectileRenderer | null>(null);
  const previewRef = useRef<readonly TrajectorySample[] | null>(preview);
  const metricsRef = useRef(onMetrics);
  previewRef.current = preview;
  metricsRef.current = onMetrics;

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return undefined;

    const renderer = new ProjectileRenderer();
    rendererRef.current = renderer;
    renderer.setMetricsCallback((m) => metricsRef.current?.(m));

    let unsubscribe: (() => void) | null = null;
    let disposed = false;

    renderer
      .init(host, level)
      .then(() => {
        if (disposed) {
          renderer.destroy();
          return;
        }
        renderer.draw(runner.getSnapshot(), previewRef.current);
        unsubscribe = runner.subscribe((frame) => {
          renderer.draw(frame, previewRef.current);
        });
      })
      .catch((error: unknown) => {
        console.error('[PhysicsViewport] PixiJS initialisation failed.', error);
      });

    return () => {
      disposed = true;
      unsubscribe?.();
      renderer.destroy();
      rendererRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [runner]);

  useEffect(() => {
    rendererRef.current?.setLevel(level);
  }, [level]);

  return (
  <div className={className} style={{ overflow: 'hidden' }}>
      {backgroundImage ? (
        <ScalingBackground
          src={backgroundImage}
          fallback={backgroundFallback ?? '#020617'}
          speed={speed}
          maxSpeed={maxSpeed}
        />
      ) : (
        <div
          className="absolute inset-0"
          style={{ backgroundImage: backgroundFallback, backgroundSize: 'cover' }}
        />
      )}
      <div ref={hostRef} className="absolute inset-0" />
    </div>
  );
};