import React, { useState } from 'react';
import { LessonShell } from '../LessonShell';
import { LessonCanvas } from '../LessonCanvas';
import { Prose, Formula, Callout, Section, KeyList, TryIt } from '../primitives';

export interface LessonNavProps {
  onPrev?: () => void;
  onNext?: () => void;
  prevTitle?: string;
  nextTitle?: string;
}

export const L03_MotionGraphs: React.FC<LessonNavProps> = (nav) => {
  const [u, setU] = useState(4);
  const [a, setA] = useState(-2);
  const [tMax, setTMax] = useState(4);

  return (
    <LessonShell
      eyebrow="Chapter 03 · Visual language"
      title="Reading motion graphs"
      lede="A graph tells the whole story of a motion at a glance. Learn to read three plots — position, velocity, acceleration — and problems that took ten lines of algebra will solve themselves visually."
      {...nav}
    >
      <Section title="Three graphs, three meanings">
        <KeyList
          items={[
            <>
              <strong className="text-sky-300">x–t graph</strong> — its{' '}
              <em>slope</em> is velocity.
            </>,
            <>
              <strong className="text-emerald-300">v–t graph</strong> — its{' '}
              <em>slope</em> is acceleration; the <em>area under it</em> is displacement.
            </>,
            <>
              <strong className="text-amber-300">a–t graph</strong> — for constant
              acceleration, a horizontal line.
            </>,
          ]}
        />
        <Formula label="Slope relationship" accent="sky">
          v = dx/dt &nbsp;&nbsp;·&nbsp;&nbsp; a = dv/dt = d²x/dt²
        </Formula>
        <Formula label="Area relationship" accent="emerald">
          s = ∫ v dt &nbsp;&nbsp;·&nbsp;&nbsp; Δv = ∫ a dt
        </Formula>
      </Section>

      <Section title="Try it — play with a moving object">
        <Prose>
          Set an initial velocity and a constant acceleration. The three graphs below
          update live. Notice how the v–t slope always equals a, and how the
          x–t curve bends toward the direction of a.
        </Prose>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <TryIt label="Initial u" min={-4} max={8} step={0.5} value={u} onChange={setU} unit="m/s" />
          <TryIt label="Acceleration a" min={-4} max={4} step={0.1} value={a} onChange={setA} unit="m/s²" accent="emerald" />
          <TryIt label="Time window" min={1} max={8} step={0.5} value={tMax} onChange={setTMax} unit="s" accent="amber" />
        </div>

        <div className="grid grid-cols-1 gap-3 lg:grid-cols-3">
          {[
            { kind: 'x' as const, color: '#38bdf8', label: 'x–t' },
            { kind: 'v' as const, color: '#34d399', label: 'v–t' },
            { kind: 'a' as const, color: '#fbbf24', label: 'a–t' },
          ].map(({ kind, color, label }) => (
            <LessonCanvas
              key={kind}
              height={160}
              draw={({ ctx, w, h, time }) => {
                ctx.clearRect(0, 0, w, h);
                ctx.fillStyle = 'rgba(15,23,42,0.7)';
                ctx.fillRect(0, 0, w, h);

                const pad = 30;
                const plotW = w - pad * 2;
                const plotH = h - pad * 2;

                // Axes
                ctx.strokeStyle = 'rgba(148,163,184,0.35)';
                ctx.lineWidth = 1;
                const axisY = pad + plotH / 2;
                ctx.beginPath();
                ctx.moveTo(pad, pad);
                ctx.lineTo(pad, pad + plotH);
                ctx.stroke();
                ctx.beginPath();
                ctx.moveTo(pad, axisY);
                ctx.lineTo(pad + plotW, axisY);
                ctx.stroke();

                // Sample the function
                const samples = 120;
                const compute = (t: number) => {
                  if (kind === 'x') return u * t + 0.5 * a * t * t;
                  if (kind === 'v') return u + a * t;
                  return a;
                };
                const values = Array.from({ length: samples }, (_, i) =>
                  compute((i / (samples - 1)) * tMax),
                );
                const maxAbs = Math.max(1, ...values.map((val) => Math.abs(val)));
                const mapY = (val: number) => axisY - (val / maxAbs) * (plotH / 2 - 8);
                const mapX = (i: number) => pad + (i / (samples - 1)) * plotW;

                // Curve
                ctx.strokeStyle = color;
                ctx.lineWidth = 2.5;
                ctx.beginPath();
                values.forEach((val, i) => {
                  const px = mapX(i);
                  const py = mapY(val);
                  if (i === 0) ctx.moveTo(px, py);
                  else ctx.lineTo(px, py);
                });
                ctx.stroke();

                // Title
                ctx.fillStyle = 'rgba(226,232,240,0.9)';
                ctx.font = 'bold 11px ui-monospace, monospace';
                ctx.textAlign = 'left';
                ctx.fillText(label, pad + 2, pad - 8);
                ctx.textAlign = 'right';
                ctx.fillStyle = 'rgba(148,163,184,0.8)';
                ctx.font = '10px ui-monospace, monospace';
                ctx.fillText(`max ${maxAbs.toFixed(2)}`, pad + plotW, pad - 8);
              }}
            />
          ))}
        </div>
      </Section>

      <Section title="Landmark features to look for">
        <KeyList
          items={[
            <>
              Where the <strong className="text-sky-300">v–t curve crosses zero</strong>,
              the object is momentarily at rest — this is a turning point in x–t.
            </>,
            <>
              Where <strong className="text-emerald-300">x–t is flat</strong>, velocity is
              zero. Where <strong className="text-emerald-300">x–t is steepest</strong>,
              speed is maximum.
            </>,
            <>
              The <strong className="text-amber-300">area between v–t and the time
              axis</strong> is the displacement. Area above the axis is positive; below
              is negative.
            </>,
          ]}
        />
      </Section>

      <Callout tone="tip" title="Physics from slopes">
        If you're ever given a graph without an equation, you can still answer most
        questions: draw a tangent to get the local slope, count squares for the area.
        Graphs are queries that algebra can't always answer.
      </Callout>
    </LessonShell>
  );
};