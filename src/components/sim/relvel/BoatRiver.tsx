import React, { useEffect, useRef, useState } from 'react';

export const BoatRiver: React.FC = () => {
  const [boatSpeed, setBoatSpeed] = useState(4);
  const [riverSpeed, setRiverSpeed] = useState(2.2);
  const [mode, setMode] = useState<'mintime' | 'minpath'>('mintime');
  const [aim, setAim] = useState(90);
  const [running, setRunning] = useState(true);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const stateRef = useRef({ t: 0 });
  const boatSpeedRef = useRef(boatSpeed);
  const riverSpeedRef = useRef(riverSpeed);
  const modeRef = useRef(mode);
  const aimRef = useRef(aim);
  const runningRef = useRef(running);

  boatSpeedRef.current = boatSpeed;
  riverSpeedRef.current = riverSpeed;
  modeRef.current = mode;
  aimRef.current = aim;
  runningRef.current = running;

  // Compute aim based on mode
  const effectiveAim = (() => {
    if (mode === 'mintime') return 90;
    const ratio = Math.min(riverSpeedRef.current / boatSpeedRef.current, 0.995);
    return 90 + Math.asin(ratio) * (180 / Math.PI);
  })();

  const aimRad = (effectiveAim * Math.PI) / 180;
  const vxLocal = boatSpeed * Math.cos(aimRad);
  const vyLocal = boatSpeed * Math.sin(aimRad);
  const groundVx = vxLocal + riverSpeed;
  const crossTime = 8 / Math.max(vyLocal, 0.01); // river width in "world units"

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let raf = 0;
    let last = performance.now();
    let phase = 0; // 0 = idle/traveling, loops

    const resize = () => {
      const w = canvas.parentElement?.clientWidth ?? 720;
      const h = canvas.parentElement?.clientHeight ?? 420;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
    };
    resize();
    const ro = new ResizeObserver(resize);
    if (canvas.parentElement) ro.observe(canvas.parentElement);

    const drawBoat = (
      ctx: CanvasRenderingContext2D,
      x: number,
      y: number,
      angle: number,
      scale: number,
    ) => {
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(angle);
      ctx.scale(scale, scale);

      // shadow
      ctx.fillStyle = 'rgba(0,0,0,0.25)';
      ctx.beginPath();
      ctx.ellipse(0, 5, 22, 5, 0, 0, Math.PI * 2);
      ctx.fill();

      // hull — a trapezoid with curved bow
      ctx.beginPath();
      ctx.moveTo(-20, -4);
      ctx.quadraticCurveTo(-22, 8, -8, 10);
      ctx.lineTo(12, 10);
      ctx.quadraticCurveTo(24, 6, 22, -3);
      ctx.lineTo(16, -8);
      ctx.lineTo(-14, -8);
      ctx.closePath();
      const hullGrad = ctx.createLinearGradient(0, -10, 0, 10);
      hullGrad.addColorStop(0, '#f8fafc');
      hullGrad.addColorStop(0.5, '#cbd5e1');
      hullGrad.addColorStop(1, '#64748b');
      ctx.fillStyle = hullGrad;
      ctx.fill();
      ctx.strokeStyle = '#0f172a';
      ctx.lineWidth = 1.2;
      ctx.stroke();

      // deck stripe
      ctx.beginPath();
      ctx.moveTo(-14, -4);
      ctx.lineTo(16, -4);
      ctx.strokeStyle = '#0ea5e9';
      ctx.lineWidth = 2;
      ctx.stroke();

      // cabin
      ctx.fillStyle = '#f1f5f9';
      ctx.strokeStyle = '#0f172a';
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.roundRect(-6, -18, 16, 12, 2);
      ctx.fill();
      ctx.stroke();

      // window
      ctx.fillStyle = '#38bdf8';
      ctx.fillRect(-2, -15, 8, 5);

      ctx.restore();
    };

    const drawWave = (
      ctx: CanvasRenderingContext2D,
      x: number,
      y: number,
      len: number,
      alpha: number,
    ) => {
      ctx.strokeStyle = `rgba(255,255,255,${alpha})`;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.quadraticCurveTo(x + len / 2, y - 3, x + len, y);
      ctx.stroke();
    };

    const render = (now: number) => {
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const W = canvas.width / dpr;
      const H = canvas.height / dpr;
      ctx.clearRect(0, 0, W, H);

      const bankTop = H * 0.18;
      const bankBottom = H * 0.82;
      const bankBand = H * 0.12;

      // ----- sky / far bank -----
      const sky = ctx.createLinearGradient(0, 0, 0, bankTop);
      sky.addColorStop(0, '#c9d8f0');
      sky.addColorStop(1, '#e6eef8');
      ctx.fillStyle = sky;
      ctx.fillRect(0, 0, W, bankTop);

      // far bank (grass band)
      const farGrad = ctx.createLinearGradient(0, bankTop - 6, 0, bankTop + bankBand);
      farGrad.addColorStop(0, '#86efac');
      farGrad.addColorStop(1, '#16a34a');
      ctx.fillStyle = farGrad;
      ctx.fillRect(0, bankTop, W, bankBand);

      // near bank
      const nearGrad = ctx.createLinearGradient(0, bankBottom - bankBand, 0, bankBottom + 6);
      nearGrad.addColorStop(0, '#16a34a');
      nearGrad.addColorStop(1, '#86efac');
      ctx.fillStyle = nearGrad;
      ctx.fillRect(0, bankBottom - bankBand, W, bankBand + 6);

      // ----- river -----
      const riverTop = bankTop + bankBand;
      const riverBottom = bankBottom - bankBand;
      const river = ctx.createLinearGradient(0, riverTop, 0, riverBottom);
      river.addColorStop(0, '#0369a1');
      river.addColorStop(0.5, '#0284c7');
      river.addColorStop(1, '#075985');
      ctx.fillStyle = river;
      ctx.fillRect(0, riverTop, W, riverBottom - riverTop);

      // sunlight glints
      ctx.save();
      ctx.globalAlpha = 0.18;
      ctx.fillStyle = '#ffffff';
      for (let i = 0; i < 40; i++) {
        const gx = ((i * 71 + now / 30) % (W + 60)) - 30;
        const gy = riverTop + ((i * 53) % (riverBottom - riverTop));
        drawWave(ctx, gx, gy, 24 + (i % 4) * 8, 0.7);
      }
      ctx.restore();

      // ----- target ring on far bank -----
      const rx = W * 0.55;
      const ry = bankTop + bankBand - 4;
      ctx.save();
      ctx.strokeStyle = 'rgba(255,255,255,0.85)';
      ctx.lineWidth = 2;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.arc(rx, ry, 18, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.restore();

      // ----- boat motion -----
      if (runningRef.current) {
        stateRef.current.t += dt;
      }
      const cycle = Math.max(crossTime * 1.3, 2.5);
      const localT = stateRef.current.t % cycle;
      const progress = Math.min(localT / crossTime, 1);

      const startX = W * 0.14;
      const startY = bankBottom - bankBand / 2;
      const endX = startX + groundVx * (crossTime / 8) * W * 0.55;
      const endY = bankTop + bankBand / 2;
      const px = startX + (endX - startX) * progress;
      const py = startY + (endY - startY) * progress;

      // Trail
      ctx.save();
      ctx.strokeStyle = 'rgba(255,255,255,0.55)';
      ctx.setLineDash([4, 6]);
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(startX, startY);
      ctx.lineTo(px, py);
      ctx.stroke();
      ctx.restore();

      // Reference line — straight across
      ctx.save();
      ctx.strokeStyle = 'rgba(255,255,255,0.25)';
      ctx.setLineDash([2, 6]);
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(startX, startY);
      ctx.lineTo(startX, endY);
      ctx.stroke();
      ctx.restore();

      // Boat angle: it visually tilts per the aim
      const boatAngle = -Math.atan2(endX - startX, endY - startY) + Math.PI / 2;
      drawBoat(ctx, px, py, -boatAngle, 1.1);

      // Velocity arrows — from the boat
      const k = 14;
      const arrow = (x1: number, y1: number, x2: number, y2: number, c: string) => {
        ctx.strokeStyle = c;
        ctx.fillStyle = c;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
        const ang = Math.atan2(y2 - y1, x2 - x1);
        ctx.beginPath();
        ctx.moveTo(x2, y2);
        ctx.lineTo(x2 - 8 * Math.cos(ang - 0.4), y2 - 8 * Math.sin(ang - 0.4));
        ctx.lineTo(x2 - 8 * Math.cos(ang + 0.4), y2 - 8 * Math.sin(ang + 0.4));
        ctx.closePath();
        ctx.fill();
      };
      arrow(px, py, px + vxLocal * k, py - vyLocal * k, '#38bdf8');
      arrow(px, py, px + riverSpeed * k, py, '#22c55e');
      arrow(px, py, px + groundVx * k, py - vyLocal * k, '#f97316');

      ctx.font = '11px "JetBrains Mono", ui-monospace, monospace';
      ctx.fillStyle = '#e2e8f0';
      ctx.fillText('boat', px + vxLocal * k + 6, py - vyLocal * k - 4);
      ctx.fillStyle = '#86efac';
      ctx.fillText('river', px + riverSpeed * k + 6, py + 4);
      ctx.fillStyle = '#fdba74';
      ctx.fillText('ground', px + groundVx * k + 6, py - vyLocal * k + 14);

      raf = requestAnimationFrame(render);
    };

    raf = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, [groundVx, vxLocal, vyLocal, riverSpeed, crossTime]);

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
      <div className="relative min-h-[420px] overflow-hidden rounded-2xl border border-token bg-surface">
        <canvas ref={canvasRef} style={{ display: 'block', width: '100%', height: '100%' }} />
        <div className="pointer-events-none absolute left-4 top-4 rounded-lg border border-white/20 bg-black/40 px-3 py-1.5 font-mono text-[11px] uppercase tracking-[0.16em] text-white backdrop-blur">
          River crossing
        </div>
      </div>

      <div className="space-y-3">
        <div className="rounded-2xl border border-token bg-surface p-5">
          <div className="mb-4 flex gap-1 rounded-full border border-token bg-surface-2 p-0.5">
            {(['mintime', 'minpath'] as const).map((m) => (
              <button
                key={m}
                onClick={() => setMode(m)}
                className={`flex-1 rounded-full py-1.5 font-mono text-[10px] uppercase tracking-[0.12em] transition-colors ${
                  mode === m ? 'bg-accent' : 'text-token-3 hover:text-token'
                }`}
              >
                {m === 'mintime' ? 'Min time' : 'Min path'}
              </button>
            ))}
          </div>

          <Slider label="Boat speed" value={boatSpeed} min={1} max={8} step={0.1} onChange={setBoatSpeed} unit="m/s" />
          <div className="h-4" />
          <Slider label="River speed" value={riverSpeed} min={0} max={6} step={0.1} onChange={setRiverSpeed} unit="m/s" />
          {mode === 'mintime' ? null : (
            <>
              <div className="h-4" />
              <div className="rounded-lg border border-token bg-surface-2 px-3 py-2 text-[12px] text-token-2">
                <div className="font-mono text-token-3">aiming upstream by</div>
                <div className="mt-1 font-mono text-token">
                  θ = sin⁻¹(u/v) = {Math.round(Math.asin(Math.min(riverSpeed / boatSpeed, 0.995)) * (180 / Math.PI))}°
                </div>
              </div>
            </>
          )}

          <button
            onClick={() => setRunning((r) => !r)}
            className="mt-5 w-full rounded-lg border border-token bg-surface-2 py-2 text-[12px] font-medium text-token transition-colors hover:border-strong"
          >
            {running ? 'Pause' : 'Play'}
          </button>
        </div>

        <div className="rounded-2xl border border-token bg-surface p-5">
          <div className="mb-3 font-mono text-[10px] uppercase tracking-[0.16em] text-token-3">
            Live values
          </div>
          <Row label="Crossing time" value={`${crossTime.toFixed(2)} s`} accent />
          <Row label="Drift" value={`${(groundVx * crossTime).toFixed(1)} m`} />
        </div>
      </div>
    </div>
  );
};

const Slider: React.FC<{
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  unit: string;
  onChange: (v: number) => void;
}> = ({ label, value, min, max, step, unit, onChange }) => {
  const pct = ((value - min) / (max - min)) * 100;
  return (
    <div>
      <div className="mb-2 flex items-baseline justify-between">
        <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-token-3">{label}</span>
        <span className="font-mono text-[13px] text-token">
          {value.toFixed(step < 1 ? 1 : 0)} <span className="text-token-3">{unit}</span>
        </span>
      </div>
      <div className="relative h-6">
        <div className="pointer-events-none absolute inset-x-0 top-1/2 h-1.5 -translate-y-1/2 overflow-hidden rounded-full bg-surface-2">
          <div className="h-full rounded-full bg-accent" style={{ width: `${pct}%` }} />
        </div>
        <input
          type="range" min={min} max={max} step={step} value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="absolute inset-0 h-full w-full"
        />
      </div>
    </div>
  );
};

const Row: React.FC<{ label: string; value: string; accent?: boolean }> = ({ label, value, accent }) => (
  <div className="flex items-baseline justify-between border-b border-token py-2 last:border-b-0">
    <span className="text-[12px] text-token-3">{label}</span>
    <span className={`font-mono text-[13px] ${accent ? 'text-accent' : 'text-token'}`}>{value}</span>
  </div>
);