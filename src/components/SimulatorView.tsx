import React, { useMemo, useState } from 'react';
import { PhysicsViewport } from './PhysicsViewport';
import { ControlPanel } from './ControlPanel';
import { EquationsPanel } from './EquationsPanel';
import { LiveStateDropdown } from './LiveStateDropdown';
import { useSimulator, type SandboxConfig, DEFAULT_CONFIG } from '../hooks/useSimulator';
import { simulateShot } from '../engine/PhysicsEngine';
import { closestPlanet } from '../data/planets';
import { useLiveFrame } from '../hooks/useLiveFrame';
import type { RendererMetrics } from '../render/ProjectileRenderer';

function niceScaleMeters(scale: number, targetPx = 100): number {
  const raw = targetPx / scale;
  const steps = [0.1, 0.2, 0.5, 1, 2, 5, 10, 20, 25, 50, 100, 200, 500, 1000];
  return steps.find((s) => s >= raw) ?? 1000;
}

const ScaleLegend: React.FC<{ metrics: RendererMetrics | null }> = ({ metrics }) => {
  if (!metrics) return null;
  const step = niceScaleMeters(metrics.scale);
  const barPx = Math.max(40, Math.min(160, step * metrics.scale));

  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 rounded-xl border border-slate-800/80 bg-slate-950/60 px-4 py-2.5 backdrop-blur-sm">
      <div className="flex items-center gap-2.5">
        <div
          className="h-1.5 rounded-full bg-gradient-to-r from-sky-500/70 to-sky-400"
          style={{ width: `${barPx}px` }}
        />
        <span className="font-mono text-xs font-semibold text-slate-300">{step} m</span>
      </div>
      <span className="text-slate-700">·</span>
      <span className="font-mono text-xs text-slate-400">
        Range <span className="text-slate-200">{metrics.worldWidth.toFixed(1)} m</span>
      </span>
      <span className="text-slate-700">·</span>
      <span className="font-mono text-xs text-slate-400">
        Height <span className="text-slate-200">{metrics.worldHeight.toFixed(1)} m</span>
      </span>
    </div>
  );
};

const VelocityCard: React.FC<{
  vx: number;
  vy: number;
  v: number;
  valueColor: string;
}> = ({ vx, vy, v, valueColor }) => {
  const fmt = (n: number) => n.toFixed(2);
  return (
    <div className="grid grid-cols-3 gap-2 rounded-xl border border-slate-800/80 bg-slate-950/55 p-3 backdrop-blur-sm">
      <div className="text-center">
        <div className="font-mono text-xs font-bold uppercase tracking-wider text-sky-300">
          v<sub className="text-[0.7em]">x</sub>
        </div>
        <div className="font-mono text-lg font-bold sm:text-xl" style={{ color: valueColor }}>
          {fmt(vx)}
        </div>
        <div className="font-mono text-[10px] text-slate-500">m/s</div>
      </div>
      <div className="border-x border-slate-800/60 text-center">
        <div className="font-mono text-xs font-bold uppercase tracking-wider text-emerald-300">
          v<sub className="text-[0.7em]">y</sub>
        </div>
        <div className="font-mono text-lg font-bold sm:text-xl" style={{ color: valueColor }}>
          {fmt(vy)}
        </div>
        <div className="font-mono text-[10px] text-slate-500">m/s</div>
      </div>
      <div className="text-center">
        <div className="font-mono text-xs font-bold uppercase tracking-wider text-pink-300">
          v
        </div>
        <div className="font-mono text-lg font-bold sm:text-xl" style={{ color: valueColor }}>
          {fmt(v)}
        </div>
        <div className="font-mono text-[10px] text-slate-500">m/s</div>
      </div>
    </div>
  );
};

export const SimulatorView: React.FC = () => {
  const [config, setConfig] = useState<SandboxConfig>(DEFAULT_CONFIG);
  const [metrics, setMetrics] = useState<RendererMetrics | null>(null);

  const { runner, level, result, fire, reset } = useSimulator(config);
  const live = useLiveFrame(runner);

  const inFlight = runner.getSnapshot().active;
  const planet = closestPlanet(config.gravity);

  const preview = useMemo(
    () => simulateShot(level, { speed: config.speed, angleDeg: config.angleDeg }).samples,
    [level, config.speed, config.angleDeg],
  );

  return (
    <div className="grid w-full grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1fr)_400px]">
      {/* LEFT: canvas + scale */}
      <div className="flex min-w-0 flex-col gap-3">
        <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl border border-slate-800/80 shadow-2xl shadow-black/60 sm:aspect-[16/10]">
          <PhysicsViewport
            runner={runner}
            level={level}
            preview={preview}
            speed={config.speed}
            maxSpeed={120}
            backgroundImage={planet.image}
            backgroundFallback={planet.fallback}
            onMetrics={setMetrics}
            className="absolute inset-0"
          />

          <div className="pointer-events-none absolute left-3 top-3 flex items-center gap-2 rounded-lg border border-white/10 bg-slate-950/70 px-3 py-1.5 backdrop-blur-md sm:left-4 sm:top-4">
            <span
              className="h-2 w-2 rounded-full"
              style={{ backgroundColor: planet.accent, boxShadow: `0 0 12px ${planet.accent}` }}
            />
            <span className="text-sm font-bold tracking-wide text-slate-100">
              {planet.label}
            </span>
          </div>

          <div className="pointer-events-none absolute right-3 top-3 flex items-center gap-3 rounded-lg border border-white/10 bg-slate-950/70 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider backdrop-blur-md sm:right-4 sm:top-4 sm:gap-4 sm:px-4 sm:text-xs">
            <span className="flex items-center gap-1.5 text-sky-300">
              <span className="h-2 w-2 rounded-full bg-sky-400" />
              v<sub className="text-[0.7em]">x</sub>
            </span>
            <span className="flex items-center gap-1.5 text-emerald-300">
              <span className="h-2 w-2 rounded-full bg-emerald-400" />
              v<sub className="text-[0.7em]">y</sub>
            </span>
            <span className="flex items-center gap-1.5 text-pink-300">
              <span className="h-2 w-2 rounded-full bg-pink-400" />
              v
            </span>
          </div>

          <div className="pointer-events-none absolute bottom-3 left-3 right-3 flex flex-wrap gap-1.5 sm:bottom-4 sm:left-4 sm:right-4 sm:gap-2">
            <span className="rounded-md border border-white/10 bg-slate-950/80 px-2 py-1 font-mono text-[11px] text-slate-200 backdrop-blur-md sm:text-xs">
              u = {config.speed.toFixed(1)} m/s
            </span>
            <span className="rounded-md border border-white/10 bg-slate-950/80 px-2 py-1 font-mono text-[11px] text-slate-200 backdrop-blur-md sm:text-xs">
              θ = {config.angleDeg.toFixed(0)}°
            </span>
            <span className="rounded-md border border-white/10 bg-slate-950/80 px-2 py-1 font-mono text-[11px] text-slate-200 backdrop-blur-md sm:text-xs">
              g = {config.gravity.toFixed(2)}
            </span>
          </div>
        </div>

        <ScaleLegend metrics={metrics} />
      </div>

      {/* RIGHT: sidebar */}
      <div className="flex min-w-0 flex-col gap-3">
        <VelocityCard
          vx={live.vx}
          vy={live.vy}
          v={live.speed}
          valueColor={planet.valueColor}
        />

        <LiveStateDropdown live={live} valueColor={planet.valueColor} />

        <section className="rounded-2xl border border-slate-800/80 bg-slate-900/60 p-5 shadow-lg backdrop-blur-xl">
          <h3 className="mb-4 text-xs font-bold uppercase tracking-[0.2em] text-slate-400">
            Parameters
          </h3>
          <ControlPanel
            config={config}
            inFlight={inFlight}
            onConfigChange={setConfig}
            onFire={fire}
            onReset={reset}
          />
        </section>

        <section className="rounded-2xl border border-slate-800/80 bg-slate-900/60 p-4 shadow-lg backdrop-blur-xl">
          <h3 className="mb-3 text-xs font-bold uppercase tracking-[0.2em] text-slate-400">
            Equations
          </h3>
          <EquationsPanel
            speed={config.speed}
            angleDeg={config.angleDeg}
            gravity={config.gravity}
          />
        </section>

        {result ? (
          <div className="rounded-2xl border border-sky-500/40 bg-sky-500/10 p-4 backdrop-blur-xl">
            <div className="text-xs font-bold uppercase tracking-[0.18em] text-sky-300">
              Last Shot
            </div>
            <div className="mt-2 grid grid-cols-3 gap-2 text-center">
              <div>
                <div className="font-mono text-xs text-slate-400">T</div>
                <div className="font-mono text-base font-bold text-slate-100">
                  {result.flightTime.toFixed(2)} s
                </div>
              </div>
              <div>
                <div className="font-mono text-xs text-slate-400">R</div>
                <div className="font-mono text-base font-bold text-slate-100">
                  {result.range.toFixed(1)} m
                </div>
              </div>
              <div>
                <div className="font-mono text-xs text-slate-400">H</div>
                <div className="font-mono text-base font-bold text-slate-100">
                  {result.apex.toFixed(1)} m
                </div>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
};