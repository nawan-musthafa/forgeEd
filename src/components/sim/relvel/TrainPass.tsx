import React, { useEffect, useRef, useState } from 'react';

export const TrainPass: React.FC = () => {
  const [speedA, setSpeedA] = useState(24);
  const [lenA, setLenA] = useState(160);
  const [speedB, setSpeedB] = useState(18);
  const [lenB, setLenB] = useState(120);
  const [direction, setDirection] = useState<'opposite' | 'same'>('opposite');

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const propsRef = useRef({ speedA, lenA, speedB, lenB, direction });
  propsRef.current = { speedA, lenA, speedB, lenB, direction };
  const timeRef = useRef(0);
  const lastCycleRef = useRef(-1);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let raf = 0;
    let last = performance.now();

    const resize = () => {
      const w = canvas.parentElement?.clientWidth ?? 720;
      const h = canvas.parentElement?.clientHeight ?? 440;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
    };
    resize();
    const ro = new ResizeObserver(resize);
    if (canvas.parentElement) ro.observe(canvas.parentElement);

    const drawTrain = (
      ctx: CanvasRenderingContext2D,
      x: number, y: number,
      lengthPx: number, heightPx: number,
      bodyTop: string, bodyBottom: string, stripe: string,
      facing: 1 | -1,
      name: string, speed: number,
    ) => {
      ctx.fillStyle = 'rgba(0,0,0,0.28)';
      ctx.beginPath();
      ctx.ellipse(x + lengthPx / 2, y + 6, lengthPx / 2, 4, 0, 0, Math.PI * 2);
      ctx.fill();

      const g = ctx.createLinearGradient(0, y - heightPx, 0, y);
      g.addColorStop(0, bodyTop);
      g.addColorStop(1, bodyBottom);
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.roundRect(x, y - heightPx, lengthPx, heightPx, 8);
      ctx.fill();
      ctx.strokeStyle = 'rgba(0,0,0,0.4)';
      ctx.lineWidth = 1.2;
      ctx.stroke();

      const winCount = Math.max(2, Math.floor(lengthPx / 34));
      const winW = Math.min(22, lengthPx / (winCount * 2));
      const totalWin = winCount * winW + (winCount - 1) * 8;
      const winStart = x + (lengthPx - totalWin) / 2;
      ctx.fillStyle = 'rgba(191, 226, 245, 0.9)';
      for (let i = 0; i < winCount; i++) {
        ctx.beginPath();
        ctx.roundRect(winStart + i * (winW + 8), y - heightPx + 8, winW, heightPx * 0.4, 3);
        ctx.fill();
      }

      ctx.fillStyle = stripe;
      ctx.fillRect(x + 4, y - heightPx * 0.3, lengthPx - 8, 3);

      ctx.fillStyle = '#fef3c7';
      const hx = facing === 1 ? x + lengthPx - 6 : x + 6;
      ctx.beginPath();
      ctx.arc(hx, y - heightPx * 0.42, 3, 0, Math.PI * 2);
      ctx.fill();

      const cx = facing === 1 ? x + lengthPx * 0.15 : x + lengthPx * 0.85;
      ctx.fillStyle = bodyBottom;
      ctx.fillRect(cx - 3, y - heightPx - 8, 6, 8);

      ctx.fillStyle = '#111827';
      const wheelCount = Math.max(3, Math.floor(lengthPx / 36));
      const wp = lengthPx / (wheelCount + 1);
      for (let i = 1; i <= wheelCount; i++) {
        ctx.beginPath();
        ctx.arc(x + i * wp, y + 2, 5, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.fillStyle = '#0f172a';
      ctx.font = 'bold 11px "JetBrains Mono", ui-monospace, monospace';
      ctx.fillText(name, x + 8, y + 24);
      ctx.fillStyle = '#475569';
      ctx.font = '10px "JetBrains Mono", ui-monospace, monospace';
      ctx.fillText(`${speed} m/s`, x + 8, y + 38);
    };

    const drawSmoke = (ctx: CanvasRenderingContext2D, x: number, y: number, t: number) => {
      for (let k = 0; k < 5; k++) {
        const phase = (t + k * 0.35) % 1;
        const r = 6 + phase * 16;
        const alpha = 0.35 * (1 - phase);
        ctx.fillStyle = `rgba(203, 213, 225, ${alpha})`;
        ctx.beginPath();
        ctx.arc(x - phase * 24, y - phase * 26, r, 0, Math.PI * 2);
        ctx.fill();
      }
    };

    const render = (now: number) => {
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const W = canvas.width / dpr;
      const H = canvas.height / dpr;

      const { speedA: vA, lenA: LA, speedB: vB, lenB: LB, direction: dir } = propsRef.current;

      // Physics
      const sceneMetres = Math.max((LA + LB) * 2.2, 500);
      const PX_PER_M = W / sceneMetres;
      const LApx = LA * PX_PER_M;
      const LBpx = LB * PX_PER_M;
      const relSpeed = dir === 'opposite' ? vA + vB : Math.max(1, Math.abs(vA - vB));
      const passTime = (LA + LB) / relSpeed;

      // Cycle: enough time for both trains to fully traverse the screen.
      // A: from x=-LApx to x=W (needs W + LApx pixels) at vA·PX_PER_M px/s
      // B: from x=W to x=-LBpx (needs W + LBpx pixels) at vB·PX_PER_M px/s
      const traverseA = (W + LApx) / (vA * PX_PER_M);
      const traverseB = (W + LBpx) / (vB * PX_PER_M);
      const cycle = Math.max(traverseA, traverseB, 3 * passTime) + 0.8;

      // Advance time
      timeRef.current += dt;
      if (timeRef.current >= cycle) {
        timeRef.current -= cycle;
        lastCycleRef.current = now;
      }
      const t = timeRef.current;

      // Sky
      const sky = ctx.createLinearGradient(0, 0, 0, H);
      sky.addColorStop(0, '#0c1220');
      sky.addColorStop(0.55, '#1a2436');
      sky.addColorStop(1, '#3a4a63');
      ctx.fillStyle = sky;
      ctx.fillRect(0, 0, W, H);

      // Stars
      ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
      for (let i = 0; i < 40; i++) {
        ctx.fillRect((i * 137) % W, (i * 71) % (H * 0.5), 1.2, 1.2);
      }

      // Hills
      ctx.fillStyle = 'rgba(15, 23, 42, 0.7)';
      ctx.beginPath();
      ctx.moveTo(0, H * 0.5);
      for (let x = 0; x <= W; x += 30) {
        ctx.lineTo(x, H * 0.5 + Math.sin(x * 0.008) * 22 + Math.cos(x * 0.02) * 8);
      }
      ctx.lineTo(W, H);
      ctx.lineTo(0, H);
      ctx.closePath();
      ctx.fill();

      const railA = H * 0.58;
      const railB = H * 0.86;

      // Sleepers
      const scrollPx = t * 60;
      ctx.fillStyle = 'rgba(120, 53, 15, 0.7)';
      for (let x = -((scrollPx) % 40); x < W + 40; x += 40) {
        ctx.fillRect(x, railA + 5, 14, 4);
        ctx.fillRect(x, railB + 5, 14, 4);
      }

      // Rails
      ctx.strokeStyle = '#94a3b8';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(0, railA); ctx.lineTo(W, railA);
      ctx.moveTo(0, railB); ctx.lineTo(W, railB);
      ctx.stroke();
      ctx.strokeStyle = 'rgba(226, 232, 240, 0.4)';
      ctx.lineWidth = 0.8;
      ctx.beginPath();
      ctx.moveTo(0, railA - 1); ctx.lineTo(W, railA - 1);
      ctx.moveTo(0, railB - 1); ctx.lineTo(W, railB - 1);
      ctx.stroke();

      // Train A — always left to right
      const xA = -LApx + vA * t * PX_PER_M;
      // Train B — depends on direction
      let xB: number;
      if (dir === 'opposite') {
        xB = W - vB * t * PX_PER_M;
      } else {
        // Same direction: B starts behind A, both moving right
        xB = -LApx - LBpx - 40 + vB * t * PX_PER_M;
      }

      drawTrain(ctx, xA, railA, LApx, 42, '#6366f1', '#4f46e5', '#fbbf24', 1, 'Train A', vA);
      drawSmoke(ctx, xA + LApx * 0.15, railA - 50, t);
      drawTrain(ctx, xB, railB, LBpx, 42, '#16a34a', '#15803d', '#fbbf24', dir === 'opposite' ? -1 : 1, 'Train B', vB);
      drawSmoke(ctx, xB + LBpx * (dir === 'opposite' ? 0.85 : 0.15), railB - 50, t + 0.5);

      // HUD
      const elapsed = Math.min(t, cycle);
      ctx.font = 'bold 11px "JetBrains Mono", ui-monospace, monospace';
      ctx.fillStyle = '#e2e8f0';
      ctx.fillText('relative speed', 24, 28);
      ctx.fillStyle = '#fbbf24';
      ctx.font = 'bold 18px "JetBrains Mono", ui-monospace, monospace';
      ctx.fillText(`${relSpeed.toFixed(1)} m/s`, 24, 50);

      ctx.font = 'bold 11px "JetBrains Mono", ui-monospace, monospace';
      ctx.fillStyle = '#e2e8f0';
      ctx.fillText('pass time', 24, 78);
      ctx.fillStyle = '#60a5fa';
      ctx.font = 'bold 18px "JetBrains Mono", ui-monospace, monospace';
      ctx.fillText(`${passTime.toFixed(2)} s`, 24, 100);

      ctx.font = 'bold 11px "JetBrains Mono", ui-monospace, monospace';
      ctx.fillStyle = '#e2e8f0';
      ctx.fillText('elapsed', W - 130, 28);
      ctx.fillStyle = '#4ade80';
      ctx.font = 'bold 18px "JetBrains Mono", ui-monospace, monospace';
      ctx.fillText(`${elapsed.toFixed(2)} s`, W - 130, 50);

      raf = requestAnimationFrame(render);
    };
    raf = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, []);

  const relSpeed = direction === 'opposite' ? speedA + speedB : Math.abs(speedA - speedB);
  const passTime = relSpeed > 0 ? (lenA + lenB) / relSpeed : Infinity;

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
      <div className="relative min-h-[440px] overflow-hidden rounded-3xl border border-token bg-surface shadow-soft">
        <canvas ref={canvasRef} style={{ display: 'block', width: '100%', height: '100%' }} />
        <div className="pointer-events-none absolute left-5 top-5 rounded-xl border border-white/10 bg-black/50 px-3.5 py-2 font-mono text-[11px] font-bold uppercase tracking-[0.16em] text-white backdrop-blur">
          Train passing
        </div>
      </div>

      <div className="space-y-3">
        <div className="space-y-5 rounded-3xl border border-token bg-surface p-6 shadow-soft">
          <div className="flex gap-1 rounded-full border border-token bg-surface-2 p-1">
            {(['opposite', 'same'] as const).map((d) => (
              <button key={d} onClick={() => setDirection(d)}
                className={`flex-1 rounded-full py-2 font-mono text-[10.5px] font-bold uppercase tracking-[0.12em] transition-colors ${
                  direction === d ? 'bg-accent' : 'text-token-3 hover:text-token'
                }`}>
                {d === 'opposite' ? 'Opposite' : 'Same direction'}
              </button>
            ))}
          </div>
          <Slider label="Train A speed" value={speedA} min={5} max={50} step={1} onChange={setSpeedA} unit="m/s" hue="234 88 12" />
          <Slider label="Train A length" value={lenA} min={40} max={400} step={10} onChange={setLenA} unit="m" hue="234 88 12" />
          <Slider label="Train B speed" value={speedB} min={5} max={50} step={1} onChange={setSpeedB} unit="m/s" hue="13 148 136" />
          <Slider label="Train B length" value={lenB} min={40} max={400} step={10} onChange={setLenB} unit="m" hue="13 148 136" />
        </div>

        <div className="rounded-3xl border border-token bg-surface p-6 shadow-soft">
          <div className="mb-3 font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-token-3">Result</div>
          <Row label="Relative speed" value={`${relSpeed.toFixed(1)} m/s`} accent />
          <Row label="Total length" value={`${lenA + lenB} m`} />
          <Row label="Time to fully pass" value={isFinite(passTime) ? `${passTime.toFixed(2)} s` : 'never'} />
        </div>
      </div>
    </div>
  );
};

const Slider: React.FC<{
  label: string; value: number; min: number; max: number; step: number;
  unit: string; onChange: (v: number) => void; hue: string;
}> = ({ label, value, min, max, step, unit, onChange, hue }) => {
  const pct = ((value - min) / (max - min)) * 100;
  return (
    <div>
      <div className="mb-2 flex items-baseline justify-between">
        <span className="text-[11px] font-bold uppercase tracking-[0.14em] text-token-3">{label}</span>
        <span className="font-mono text-[13px] font-semibold tabular text-token">
          {value.toFixed(step < 1 ? 1 : 0)} <span className="text-token-3">{unit}</span>
        </span>
      </div>
      <div className="relative h-6">
        <div className="pointer-events-none absolute inset-x-0 top-1/2 h-1.5 -translate-y-1/2 overflow-hidden rounded-full bg-surface-2">
          <div className="h-full rounded-full" style={{ width: `${pct}%`, background: `rgb(${hue})` }} />
        </div>
        <input type="range" min={min} max={max} step={step} value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="absolute inset-0 h-full w-full" />
      </div>
    </div>
  );
};

const Row: React.FC<{ label: string; value: string; accent?: boolean }> = ({ label, value, accent }) => (
  <div className="flex items-baseline justify-between border-b border-token py-2 last:border-b-0">
    <span className="text-[12.5px] text-token-3">{label}</span>
    <span className={`font-mono text-[13px] font-semibold ${accent ? 'text-accent' : 'text-token'}`}>{value}</span>
  </div>
);