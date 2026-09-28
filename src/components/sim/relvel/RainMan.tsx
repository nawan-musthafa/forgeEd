import React, { useEffect, useRef, useState } from 'react';

interface Drop { x: number; y: number; spd: number; len: number; }

export const RainMan: React.FC = () => {
  const [rainSpeed, setRainSpeed] = useState(6);
  const [manSpeed, setManSpeed] = useState(4);
  const [rainTilt, setRainTilt] = useState(0);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const dropsRef = useRef<Drop[]>([]);
  const propsRef = useRef({ rainSpeed, manSpeed, rainTilt });
  propsRef.current = { rainSpeed, manSpeed, rainTilt };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let raf = 0;
    let last = performance.now();

    const resize = () => {
      const w = canvas.parentElement?.clientWidth ?? 720;
      const h = canvas.parentElement?.clientHeight ?? 420;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      const drops: Drop[] = [];
      for (let i = 0; i < 160; i++) {
        drops.push({
          x: Math.random() * w,
          y: Math.random() * h,
          spd: 0.75 + Math.random() * 0.5,
          len: 8 + Math.random() * 12,
        });
      }
      dropsRef.current = drops;
    };
    resize();
    const ro = new ResizeObserver(resize);
    if (canvas.parentElement) ro.observe(canvas.parentElement);

    const drawPerson = (
      ctx: CanvasRenderingContext2D,
      x: number, y: number,
      tiltRad: number,
    ) => {
      // shadow
      ctx.fillStyle = 'rgba(0,0,0,0.25)';
      ctx.beginPath();
      ctx.ellipse(x, y + 3, 24, 5, 0, 0, Math.PI * 2);
      ctx.fill();

      // legs
      ctx.strokeStyle = '#1e293b';
      ctx.lineWidth = 7;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(x - 3, y - 26);
      ctx.lineTo(x - 8, y - 1);
      ctx.moveTo(x + 3, y - 26);
      ctx.lineTo(x + 9, y - 1);
      ctx.stroke();

      // torso
      ctx.strokeStyle = '#0f172a';
      ctx.lineWidth = 14;
      ctx.beginPath();
      ctx.moveTo(x, y - 26);
      ctx.lineTo(x, y - 54);
      ctx.stroke();

      // head
      ctx.fillStyle = '#f1c7a8';
      ctx.beginPath();
      ctx.arc(x, y - 64, 9, 0, Math.PI * 2);
      ctx.fill();

      // hair
      ctx.fillStyle = '#1f2937';
      ctx.beginPath();
      ctx.arc(x, y - 66, 9, Math.PI * 1.05, Math.PI * 2.05);
      ctx.fill();

      // arm
      ctx.strokeStyle = '#0f172a';
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.moveTo(x, y - 50);
      ctx.lineTo(x + 16, y - 58);
      ctx.stroke();

      // umbrella (rotate about shoulder)
      ctx.save();
      ctx.translate(x + 16, y - 58);
      ctx.rotate(tiltRad);

      // pole
      ctx.strokeStyle = '#78350f';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(0, -46);
      ctx.stroke();

      // canopy
      const cg = ctx.createLinearGradient(-36, -80, 36, -44);
      cg.addColorStop(0, '#f43f5e');
      cg.addColorStop(0.5, '#fb7185');
      cg.addColorStop(1, '#e11d48');
      ctx.fillStyle = cg;
      ctx.beginPath();
      ctx.moveTo(-36, -46);
      ctx.quadraticCurveTo(0, -92, 36, -46);
      for (let i = 3; i >= 0; i--) {
        const x1 = -36 + (i * 72) / 4;
        const x2 = -36 + ((i + 1) * 72) / 4;
        ctx.quadraticCurveTo((x1 + x2) / 2, -42, x2, -46);
      }
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = '#7f1d1d';
      ctx.lineWidth = 1.2;
      ctx.stroke();

      ctx.strokeStyle = 'rgba(127, 29, 29, 0.55)';
      ctx.lineWidth = 0.8;
      for (let i = -3; i <= 3; i += 2) {
        ctx.beginPath();
        ctx.moveTo(0, -46);
        ctx.lineTo(i * 11, -66);
        ctx.stroke();
      }

      ctx.fillStyle = '#7f1d1d';
      ctx.beginPath();
      ctx.arc(0, -90, 3, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
    };

    const render = (now: number) => {
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const W = canvas.width / dpr;
      const H = canvas.height / dpr;

      const { rainSpeed: rS, manSpeed: mS, rainTilt: tiltDeg } = propsRef.current;
      const actualTiltRad = (tiltDeg * Math.PI) / 180;

      // Sky
      const sky = ctx.createLinearGradient(0, 0, 0, H);
      sky.addColorStop(0, '#0a0d14');
      sky.addColorStop(0.55, '#141a26');
      sky.addColorStop(1, '#1f2937');
      ctx.fillStyle = sky;
      ctx.fillRect(0, 0, W, H);

      // City silhouette
      ctx.fillStyle = 'rgba(10, 13, 20, 0.7)';
      for (let i = 0; i < 14; i++) {
        const bx = (i * W) / 14 + ((i * 37) % 20);
        const bw = 20 + ((i * 13) % 30);
        const bh = 40 + ((i * 29) % 60);
        ctx.fillRect(bx, H - 100 - bh, bw, bh + 100);
      }

      // Windows
      ctx.fillStyle = 'rgba(251, 191, 36, 0.4)';
      for (let i = 0; i < 14; i++) {
        const bx = (i * W) / 14 + ((i * 37) % 20);
        const bw = 20 + ((i * 13) % 30);
        const bh = 40 + ((i * 29) % 60);
        for (let w = 0; w < 6; w++) {
          for (let h = 0; h < Math.floor(bh / 14); h++) {
            if ((i + w + h) % 3 === 0) continue;
            ctx.fillRect(bx + 4 + w * 4, H - 100 - bh + 6 + h * 12, 2.5, 4);
          }
        }
      }

      // Ground
      const groundY = H - 55;
      const ground = ctx.createLinearGradient(0, groundY, 0, H);
      ground.addColorStop(0, '#1a1f2e');
      ground.addColorStop(1, '#0a0d14');
      ctx.fillStyle = ground;
      ctx.fillRect(0, groundY, W, H - groundY);

      ctx.fillStyle = 'rgba(251, 191, 36, 0.06)';
      for (let i = 0; i < 20; i++) {
        ctx.fillRect((i * 53) % W, groundY + 5, 8, 2);
      }

      /* ---------------- PHYSICS ----------------
       * Actual rain in world frame:
       *   rainAx = -sin(tilt) * rS    (positive tilt → rain drifts LEFT)
       *   rainAy = -cos(tilt) * rS    (always downward)
       * Apparent rain in man's frame:
       *   relVx = rainAx - mS
       *   relVy = rainAy
       * Canvas y is downward, so vyPx = -relVy * PX_PER_M.
       */
      const rainAx = -Math.sin(actualTiltRad) * rS;
      const rainAy = -Math.cos(actualTiltRad) * rS;
      const relVx = rainAx - mS;
      const relVy = rainAy;

      const PX_PER_M = 26;
      const vxPx = relVx * PX_PER_M;
      const vyPx = -relVy * PX_PER_M;   // flip for canvas y-down
      const speedPx = Math.hypot(vxPx, vyPx) || 1;

      // Man position
      const cycle = 7;
      const localT = (now / 1000) % cycle;
      const manX = W * 0.18 + (W * 0.62) * (localT / cycle);
      const manY = groundY;

      // Rain drops
      const drops = dropsRef.current;
      for (const d of drops) {
        d.x += vxPx * d.spd * dt;
        d.y += vyPx * d.spd * dt;

        if (d.x < -20) d.x += W + 40;
        if (d.x > W + 20) d.x -= W + 40;
        if (d.y > H + 20) { d.y = -20; d.x = Math.random() * W; }
        if (d.y < -20) { d.y = H + 20; d.x = Math.random() * W; }

        const dirX = vxPx / speedPx;
        const dirY = vyPx / speedPx;
        const len = d.len * (rS / 6);

        ctx.strokeStyle = `rgba(191, 219, 254, ${0.25 + 0.35 * (rS / 12)})`;
        ctx.lineWidth = 1.4;
        ctx.beginPath();
        ctx.moveTo(d.x, d.y);
        ctx.lineTo(d.x - dirX * len, d.y - dirY * len);
        ctx.stroke();
      }

      // Umbrella tilt: magnitude of apparent angle, applied clockwise (into the rain from the right)
      const apparentAngleRad = Math.atan2(Math.abs(relVx), Math.abs(relVy));
      const umbrellaTilt = relVx < 0 ? apparentAngleRad : -apparentAngleRad;
      drawPerson(ctx, manX, manY, umbrellaTilt);

      // HUD
      ctx.font = '11px "JetBrains Mono", ui-monospace, monospace';
      ctx.fillStyle = '#94a3b8';
      ctx.fillText(`actual rain: ${rS.toFixed(1)} m/s, ${tiltDeg}° from vertical`, 24, 30);
      ctx.fillStyle = '#fb923c';
      ctx.fillText(`apparent angle: ${Math.round((apparentAngleRad * 180) / Math.PI)}° from vertical`, 24, 48);
      ctx.fillStyle = '#4ade80';
      ctx.fillText(`man speed: ${mS.toFixed(1)} m/s`, 24, 66);
      ctx.fillStyle = '#60a5fa';
      ctx.fillText(`|v_rel|: ${Math.hypot(relVx, relVy).toFixed(2)} m/s`, 24, 84);

      raf = requestAnimationFrame(render);
    };
    raf = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, []);

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
      <div className="relative min-h-[440px] overflow-hidden rounded-3xl border border-token bg-surface shadow-soft">
        <canvas ref={canvasRef} style={{ display: 'block', width: '100%', height: '100%' }} />
        <div className="pointer-events-none absolute left-5 top-5 rounded-xl border border-white/10 bg-black/50 px-3.5 py-2 font-mono text-[11px] font-bold uppercase tracking-[0.16em] text-white backdrop-blur">
          Rain & man
        </div>
      </div>

      <div className="space-y-3">
        <div className="space-y-5 rounded-3xl border border-token bg-surface p-6 shadow-soft">
          <Slider label="Rain speed" value={rainSpeed} min={2} max={12} step={0.1} onChange={setRainSpeed} unit="m/s" hue="234 88 12" />
          <Slider label="Man speed" value={manSpeed} min={0} max={10} step={0.1} onChange={setManSpeed} unit="m/s" hue="13 148 136" />
          <Slider label="Rain tilt (positive → left)" value={rainTilt} min={-45} max={45} step={1} onChange={setRainTilt} unit="°" hue="124 58 237" />
        </div>
        <div className="rounded-3xl border border-token bg-surface p-6 shadow-soft">
          <div className="mb-3 font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-token-3">
            Umbrella points
          </div>
          <Row label="Apparent angle" value={`${Math.round(Math.atan2(manSpeed, rainSpeed) * (180 / Math.PI))}°`} accent />
          <Row label="Direction" value="into the apparent rain" />
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