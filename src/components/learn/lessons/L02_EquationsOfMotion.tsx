import React, { useState } from 'react';
import { LessonShell } from '../LessonShell';
import { LessonCanvas } from '../LessonCanvas';
import { Prose, Formula, Callout, Section, KeyList, Sub, NumberedSteps, TryIt } from '../primitives';

export interface LessonNavProps {
  onPrev?: () => void;
  onNext?: () => void;
  prevTitle?: string;
  nextTitle?: string;
}

export const L02_EquationsOfMotion: React.FC<LessonNavProps> = (nav) => {
  const [u, setU] = useState(5);
  const [a, setA] = useState(2);
  const [t, setT] = useState(0);

  const v = u + a * t;
  const s = u * t + 0.5 * a * t * t;

  return (
    <LessonShell
      eyebrow="Chapter 02 · Kinematics"
      title="The three equations of motion"
      lede="With constant acceleration, every motion in this chapter is fully described by three compact equations. Here we derive them and see what each one really tells us."
      {...nav}
    >
      <Section title="Assumption: constant acceleration">
        <Prose>
          All our equations assume the acceleration is <strong className="text-slate-100">
          constant in magnitude and direction</strong>. This is exactly true for free-fall
          near the Earth's surface (a = g ≈ 9.8 m/s²) and a good approximation for many
          real situations.
        </Prose>
        <KeyList
          items={[
            <>u — initial velocity (m/s)</>,
            <>v — final velocity at time t (m/s)</>,
            <>a — constant acceleration (m/s²)</>,
            <>t — elapsed time (s)</>,
            <>s — displacement from start (m)</>,
          ]}
        />
      </Section>

      <Section title="The three equations">
        <Formula label="Equation 1 — velocity from time" accent="sky">
          v = u + a t
        </Formula>
        <Formula label="Equation 2 — displacement from time" accent="emerald">
          s = u t + ½ a t²
        </Formula>
        <Formula label="Equation 3 — velocity from displacement" accent="violet">
          v² = u² + 2 a s
        </Formula>
        <Callout tone="tip" title="How to choose one">
          Identify which quantity is <em>missing</em> from the problem. If t is missing,
          use equation 3. If s is missing, use equation 1. If v is missing, use equation 2.
        </Callout>
      </Section>

      <Section title="Derivations from first principles">
        <Prose>
          These equations aren't magic — each falls out of two basic definitions:
          acceleration is the rate of change of velocity, and velocity is the rate of
          change of position.
        </Prose>
        <NumberedSteps
          steps={[
            <>
              Starting from <span className="font-mono text-sky-300">a = dv/dt</span>,
              integrate with constant a:{' '}
              <span className="font-mono text-sky-300">
                ∫ dv = ∫ a dt  ⟹  v = u + a t
              </span>
              .
            </>,
            <>
              Now <span className="font-mono text-sky-300">v = dx/dt</span>. Substitute
              the expression above and integrate:{' '}
              <span className="font-mono text-sky-300">
                ∫ dx = ∫ (u + a t) dt  ⟹  s = u t + ½ a t²
              </span>
              .
            </>,
            <>
              Combine the two by eliminating t: from equation 1, t = (v − u)/a. Substitute
              into equation 2 and simplify to get{' '}
              <span className="font-mono text-sky-300">v² = u² + 2 a s</span>.
            </>,
          ]}
        />
      </Section>

      <Section title="Try it — a moving particle with constant acceleration">
        <LessonCanvas
          height={200}
          draw={({ ctx, w, h, time }) => {
            const pad = 32;
            const axisY = h - 46;
            const totalDistance = Math.max(u * 3 + 0.5 * a * 9, 4);
            const maxX = totalDistance * 1.05;
            const scale = (w - pad * 2) / maxX;
            const toScreenX = (x: number) => pad + x * scale;
            const maxT = 3;

            ctx.clearRect(0, 0, w, h);
            ctx.fillStyle = 'rgba(15,23,42,0.7)';
            ctx.fillRect(0, 0, w, h);

            // Ground line
            ctx.strokeStyle = 'rgba(56,189,248,0.6)';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(pad, axisY);
            ctx.lineTo(w - pad, axisY);
            ctx.stroke();

            // Axis ticks
            ctx.fillStyle = 'rgba(148,163,184,0.7)';
            ctx.font = '10px ui-monospace, monospace';
            ctx.textAlign = 'center';
            for (let i = 0; i <= maxX; i += Math.max(1, Math.round(maxX / 6))) {
              const x = toScreenX(i);
              ctx.fillText(`${i}m`, x, axisY + 18);
            }

            // Positions at sample times (ghost markers)
            for (let tau = 0; tau <= maxT; tau += 0.5) {
              const sTau = u * tau + 0.5 * a * tau * tau;
              if (sTau > maxX) continue;
              const px = toScreenX(sTau);
              ctx.fillStyle = 'rgba(148,163,184,0.18)';
              ctx.beginPath();
              ctx.arc(px, axisY - 40, 3, 0, Math.PI * 2);
              ctx.fill();
            }

            // Current position
            const xNow = toScreenX(Math.min(s, maxX));

            // Trail
            ctx.strokeStyle = 'rgba(52,211,153,0.6)';
            ctx.lineWidth = 2.5;
            ctx.beginPath();
            ctx.moveTo(toScreenX(0), axisY - 40);
            ctx.lineTo(xNow, axisY - 40);
            ctx.stroke();

            // Ball
            const radius = 13;
            ctx.shadowColor = 'rgba(239,68,68,0.55)';
            ctx.shadowBlur = 14;
            const grad = ctx.createRadialGradient(
              xNow - radius * 0.3,
              axisY - 40 - radius * 0.35,
              1,
              xNow,
              axisY - 40,
              radius,
            );
            grad.addColorStop(0, '#fca5a5');
            grad.addColorStop(0.55, '#dc2626');
            grad.addColorStop(1, '#7f1d1d');
            ctx.fillStyle = grad;
            ctx.beginPath();
            ctx.arc(xNow, axisY - 40, radius, 0, Math.PI * 2);
            ctx.fill();
            ctx.shadowBlur = 0;

            // Velocity arrow
            if (v > 0.1) {
              const arrowLen = Math.min(80, v * 12);
              ctx.strokeStyle = '#34d399';
              ctx.lineWidth = 2.5;
              ctx.beginPath();
              ctx.moveTo(xNow + radius + 6, axisY - 40);
              ctx.lineTo(xNow + radius + 6 + arrowLen, axisY - 40);
              ctx.stroke();
              ctx.beginPath();
              const tipX = xNow + radius + 6 + arrowLen;
              ctx.moveTo(tipX, axisY - 40);
              ctx.lineTo(tipX - 8, axisY - 44);
              ctx.lineTo(tipX - 8, axisY - 36);
              ctx.closePath();
              ctx.fillStyle = '#34d399';
              ctx.fill();
            }

            // Labels
            ctx.fillStyle = 'rgba(226,232,240,0.9)';
            ctx.font = '11px ui-monospace, monospace';
            ctx.textAlign = 'left';
            ctx.fillText(`s = ${s.toFixed(2)} m`, pad, 18);
            ctx.fillText(`v = ${v.toFixed(2)} m/s`, pad, 34);
          }}
        />

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <TryIt label="Initial u" min={0} max={10} step={0.5} value={u} onChange={setU} unit="m/s" />
          <TryIt label="Acceleration a" min={-2} max={5} step={0.1} value={a} onChange={setA} unit="m/s²" accent="emerald" />
          <TryIt label="Time t" min={0} max={3} step={0.05} value={t} onChange={setT} unit="s" accent="amber" />
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Formula label="v = u + at" accent="sky">
            {v.toFixed(2)} = {u.toFixed(1)} + {a.toFixed(1)}·{t.toFixed(2)} ={' '}
            <strong>{v.toFixed(2)} m/s</strong>
          </Formula>
          <Formula label="s = ut + ½at²" accent="emerald">
            {u.toFixed(1)}·{t.toFixed(2)} + ½·{a.toFixed(1)}·{t.toFixed(2)}² ={' '}
            <strong>{s.toFixed(2)} m</strong>
          </Formula>
        </div>
      </Section>

      <Callout tone="trap" title="The most common mistake">
        <span className="font-mono">s = ut + ½at²</span> uses <em>displacement</em>, not
        total distance. If the object reverses direction, distance &gt; |displacement|.
      </Callout>
    </LessonShell>
  );
};