import React, { useState } from 'react';
import { LessonShell } from '../LessonShell';
import { LessonCanvas } from '../LessonCanvas';
import { Prose, Formula, Callout, Section, KeyList, Sub, TryIt, NumberedSteps } from '../primitives';

export interface LessonNavProps {
  onPrev?: () => void;
  onNext?: () => void;
  prevTitle?: string;
  nextTitle?: string;
}

export const L06_ProjectileBasics: React.FC<LessonNavProps> = (nav) => {
  const [u, setU] = useState(20);
  const [angle, setAngle] = useState(45);
  const g = 9.81;

  const theta = (angle * Math.PI) / 180;
  const ux = u * Math.cos(theta);
  const uy = u * Math.sin(theta);
  const T = (2 * uy) / g;
  const H = (uy * uy) / (2 * g);
  const R = (u * u * Math.sin(2 * theta)) / g;

  return (
    <LessonShell
      eyebrow="Chapter 06 · The main event"
      title="Projectile motion — derivations"
      lede="A projectile is any object thrown or launched into the air, moving under gravity alone. Here we derive every standard result from first principles using the tools from chapters 1–5."
      {...nav}
    >
      <Section title="What makes a motion a projectile">
        <KeyList
          items={[
            <>Launched with some initial velocity u at angle θ.</>,
            <>Only force acting: gravity (downward).</>,
            <>Air resistance ignored (for now).</>,
            <>
              Horizontal motion is <strong className="text-sky-300">uniform</strong> (a
              <Sub>x</Sub> = 0). Vertical motion is <strong className="text-emerald-300">
              uniformly accelerated</strong> (a<Sub>y</Sub> = −g).
            </>,
          ]}
        />
        <Callout tone="info" title="NCERT symbols you must know">
          u = initial speed · θ = angle of projection · T = time of flight · H = maximum
          height · R = horizontal range · g = acceleration due to gravity.
        </Callout>
      </Section>

      <Section title="Step 1 — resolve the initial velocity">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Formula label="Horizontal" accent="sky">
            u<Sub>x</Sub> = u cos θ
          </Formula>
          <Formula label="Vertical" accent="emerald">
            u<Sub>y</Sub> = u sin θ
          </Formula>
        </div>
        <Prose>
          Once launched, u<Sub>x</Sub> never changes. Gravity doesn't touch it. Only u
          <Sub>y</Sub> evolves over time.
        </Prose>
      </Section>

      <Section title="Step 2 — derive the time of flight T">
        <Prose>
          The projectile returns to the ground when y = 0. Using the vertical equation of
          motion with y<Sub>0</Sub> = 0, u<Sub>y</Sub> = u sin θ, a = −g:
        </Prose>
        <Formula accent="amber">
          0 = u sin θ · T − ½ g T²
        </Formula>
        <Prose>
          Factor out T (the trivial solution T = 0 is launch):
        </Prose>
        <Formula label="Time of flight" accent="amber">
          T = 2u sin θ / g
        </Formula>
      </Section>

      <Section title="Step 3 — derive the maximum height H">
        <Prose>
          At the highest point, the vertical velocity v<Sub>y</Sub> = 0. Using{' '}
          <span className="font-mono">v² = u² + 2as</span> along the y-axis:
        </Prose>
        <Formula accent="amber">
          0 = (u sin θ)² − 2 g H
        </Formula>
        <Formula label="Maximum height" accent="amber">
          H = u² sin²θ / (2g)
        </Formula>
      </Section>

      <Section title="Step 4 — derive the range R">
        <Prose>
          The horizontal distance covered in time T is just u<Sub>x</Sub> · T, since
          horizontal velocity is constant:
        </Prose>
        <Formula accent="rose">
          R = u cos θ · (2u sin θ / g)
        </Formula>
        <Prose>
          Using the identity sin 2θ = 2 sin θ cos θ:
        </Prose>
        <Formula label="Range" accent="rose">
          R = u² sin 2θ / g
        </Formula>
        <Callout tone="tip" title="Maximum range">
          R is maximum when sin 2θ = 1, i.e. θ = 45°. Complementary angles 30° and 60°
          give the same range.
        </Callout>
      </Section>

      <Section title="Step 5 — the trajectory equation">
        <Prose>
          Eliminate t between x = u cos θ · t and y = u sin θ · t − ½gt². From the first, t
          = x / (u cos θ). Substitute:
        </Prose>
        <Formula label="Trajectory" accent="violet">
          y = x tan θ − g x² / (2u² cos²θ)
        </Formula>
        <Prose>
          This is the shape of the path — a downward-opening parabola, independent of
          time. Every projectile ever thrown follows this curve.
        </Prose>
      </Section>

      <Section title="Try it — one projectile, every quantity">
        <LessonCanvas
          height={300}
          animated
          draw={({ ctx, w, h, time }) => {
            ctx.clearRect(0, 0, w, h);
            ctx.fillStyle = 'rgba(15,23,42,0.7)';
            ctx.fillRect(0, 0, w, h);

            const pad = 36;
            const maxX = Math.max(R * 1.1, 10);
            const maxY = Math.max(H * 1.25, 4);
            const scale = Math.min((w - pad * 2) / maxX, (h - pad * 2) / maxY);
            const originX = pad;
            const originY = h - pad;
            const mapX = (x: number) => originX + x * scale;
            const mapY = (y: number) => originY - y * scale;

            // Ground
            ctx.strokeStyle = 'rgba(56,189,248,0.55)';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(pad, originY);
            ctx.lineTo(w - pad, originY);
            ctx.stroke();

            // Trajectory curve
            ctx.strokeStyle = 'rgba(56,189,248,0.6)';
            ctx.setLineDash([4, 4]);
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            for (let i = 0; i <= 100; i += 1) {
              const x = (i / 100) * R;
              const y = x * Math.tan(theta) - (g * x * x) / (2 * u * u * Math.cos(theta) * Math.cos(theta));
              if (y < 0) break;
              const px = mapX(x);
              const py = mapY(y);
              if (i === 0) ctx.moveTo(px, py);
              else ctx.lineTo(px, py);
            }
            ctx.stroke();
            ctx.setLineDash([]);

            // Apex marker
            const apexX = R / 2;
            const apexY = H;
            ctx.fillStyle = 'rgba(251,191,36,0.7)';
            ctx.beginPath();
            ctx.arc(mapX(apexX), mapY(apexY), 4, 0, Math.PI * 2);
            ctx.fill();

            // Animated projectile
            const cycle = 4; // seconds
            const t = ((time / 1000) % cycle) * (T / cycle);
            const x = ux * t;
            const y = uy * t - 0.5 * g * t * t;
            if (y >= 0) {
              const px = mapX(x);
              const py = mapY(y);

              // Trail
              ctx.strokeStyle = '#fbbf24';
              ctx.lineWidth = 2.5;
              ctx.beginPath();
              for (let i = 0; i <= 40; i += 1) {
                const tau = (i / 40) * t;
                const xx = ux * tau;
                const yy = uy * tau - 0.5 * g * tau * tau;
                const pxx = mapX(xx);
                const pyy = mapY(yy);
                if (i === 0) ctx.moveTo(pxx, pyy);
                else ctx.lineTo(pxx, pyy);
              }
              ctx.stroke();

              // Ball
              const radius = 10;
              ctx.shadowColor = 'rgba(239,68,68,0.55)';
              ctx.shadowBlur = 14;
              const grad = ctx.createRadialGradient(
                px - radius * 0.3,
                py - radius * 0.35,
                1,
                px,
                py,
                radius,
              );
              grad.addColorStop(0, '#fca5a5');
              grad.addColorStop(0.55, '#dc2626');
              grad.addColorStop(1, '#7f1d1d');
              ctx.fillStyle = grad;
              ctx.beginPath();
              ctx.arc(px, py, radius, 0, Math.PI * 2);
              ctx.fill();
              ctx.shadowBlur = 0;
            }

            // Labels
            ctx.fillStyle = 'rgba(148,163,184,0.9)';
            ctx.font = '11px ui-monospace, monospace';
            ctx.textAlign = 'left';
            ctx.fillText(`T = ${T.toFixed(2)} s`, pad, 16);
            ctx.fillText(`H = ${H.toFixed(2)} m`, pad, 32);
            ctx.fillText(`R = ${R.toFixed(2)} m`, pad, 48);
          }}
        />

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <TryIt label="Launch speed u" min={5} max={40} step={0.5} value={u} onChange={setU} unit="m/s" />
          <TryIt label="Angle θ" min={10} max={80} step={1} value={angle} onChange={setAngle} unit="°" accent="emerald" />
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <Formula label="T" accent="amber">
            {T.toFixed(2)} s
          </Formula>
          <Formula label="H" accent="amber">
            {H.toFixed(2)} m
          </Formula>
          <Formula label="R" accent="rose">
            {R.toFixed(2)} m
          </Formula>
        </div>
      </Section>

      <Section title="Everything you now know">
        <NumberedSteps
          steps={[
            <>u<Sub>x</Sub> = u cos θ is constant throughout the flight.</>,
            <>u<Sub>y</Sub> = u sin θ decreases linearly at rate g.</>,
            <>At the apex, v<Sub>y</Sub> = 0 but speed ≠ 0.</>,
            <>Total flight time T = 2u sin θ / g.</>,
            <>Maximum height H = u² sin²θ / (2g).</>,
            <>Horizontal range R = u² sin 2θ / g.</>,
            <>The path is a parabola: y = x tan θ − g x² / (2u² cos²θ).</>,
          ]}
        />
        <Callout tone="tip" title="What's next">
          In the following lessons we extend this to projectiles launched from a height,
          projectiles on inclined planes, and relative-velocity projectile problems. The
          physics is the same — only the geometry changes.
        </Callout>
      </Section>
    </LessonShell>
  );
};