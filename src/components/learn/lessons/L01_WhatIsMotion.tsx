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

export const L01_WhatIsMotion: React.FC<LessonNavProps> = (nav) => {
  const [x1, setX1] = useState(2);
  const [v, setV] = useState(3);
  const [t, setT] = useState(0);

  // Play a simple animation when the user drags t
  const xFinal = x1 + v * t;

  return (
    <LessonShell
      eyebrow="Chapter 01 · Foundations"
      title="What is motion?"
      lede="Before we throw a single ball, we need to agree on what it means for something to move — and how to describe that motion precisely enough to predict it."
      {...nav}
    >
      <Section title="Motion is change of position, relative to something">
        <Prose>
          A ball resting on a moving train is at rest relative to the train, but moving
          relative to the platform. <strong className="text-slate-100">Motion is always
          defined with respect to a reference frame.</strong> In this chapter we always
          pick the ground as our frame unless told otherwise.
        </Prose>
        <Prose>
          Position is measured from a fixed origin. Displacement is the change in position
          — a vector. Distance is the total path travelled — a scalar. Students who mix
          these two up lose marks on the easiest questions.
        </Prose>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Formula label="Displacement" accent="sky">
            Δx = x<Sub>f</Sub> − x<Sub>i</Sub>
          </Formula>
          <Formula label="Average velocity" accent="emerald">
            v<Sub>avg</Sub> = Δx / Δt
          </Formula>
        </div>
      </Section>

      <Section title="Motion comes in flavours">
        <KeyList
          items={[
            <>
              <strong className="text-slate-100">1-D motion</strong> — along a straight
              line. A car on a straight road, a ball dropped from rest.
            </>,
            <>
              <strong className="text-slate-100">2-D motion</strong> — in a plane. A
              projectile, a boat crossing a river.
            </>,
            <>
              <strong className="text-slate-100">3-D motion</strong> — in space. A drone,
              a satellite.
            </>,
          ]}
        />
        <Callout tone="info" title="Why we start with 1-D">
          Every 2-D motion can be split into two independent 1-D motions along the axes.
          Master 1-D, and 2-D becomes bookkeeping.
        </Callout>
      </Section>

      <Section title="Try it — move a particle along a line">
        <Prose>
          Drag the three sliders to set the initial position, the constant velocity, and
          the elapsed time. Watch the ball slide along the axis.
        </Prose>

        <LessonCanvas
          height={180}
          draw={({ ctx, w, h, time }) => {
            const pad = 30;
            const axisY = h / 2;
            const min = -4;
            const max = 12;
            const scale = (w - pad * 2) / (max - min);
            const toScreenX = (x: number) => pad + (x - min) * scale;

            ctx.clearRect(0, 0, w, h);

            // Background
            ctx.fillStyle = 'rgba(15,23,42,0.7)';
            ctx.fillRect(0, 0, w, h);

            // Axis
            ctx.strokeStyle = 'rgba(148,163,184,0.4)';
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.moveTo(pad, axisY);
            ctx.lineTo(w - pad, axisY);
            ctx.stroke();

            // Tick marks
            ctx.fillStyle = 'rgba(148,163,184,0.7)';
            ctx.font = '10px ui-monospace, monospace';
            ctx.textAlign = 'center';
            for (let i = min; i <= max; i += 2) {
              const x = toScreenX(i);
              ctx.beginPath();
              ctx.moveTo(x, axisY - 4);
              ctx.lineTo(x, axisY + 4);
              ctx.stroke();
              ctx.fillText(`${i}m`, x, axisY + 20);
            }

            // Initial position marker
            const xi = toScreenX(x1);
            ctx.fillStyle = 'rgba(56,189,248,0.4)';
            ctx.beginPath();
            ctx.arc(xi, axisY, 6, 0, Math.PI * 2);
            ctx.fill();

            // Trail from initial to current
            const xf = toScreenX(xFinal);
            const grad = ctx.createLinearGradient(xi, 0, xf, 0);
            grad.addColorStop(0, 'rgba(56,189,248,0.15)');
            grad.addColorStop(1, 'rgba(56,189,248,0.5)');
            ctx.strokeStyle = grad;
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.moveTo(xi, axisY - 28);
            ctx.lineTo(xf, axisY - 28);
            ctx.stroke();

            // Ball
            ctx.shadowColor = 'rgba(239,68,68,0.6)';
            ctx.shadowBlur = 14;
            const radius = 12;
            const ballGrad = ctx.createRadialGradient(
              xf - radius * 0.3,
              axisY - radius * 0.35,
              1,
              xf,
              axisY,
              radius,
            );
            ballGrad.addColorStop(0, '#fca5a5');
            ballGrad.addColorStop(0.55, '#dc2626');
            ballGrad.addColorStop(1, '#7f1d1d');
            ctx.fillStyle = ballGrad;
            ctx.beginPath();
            ctx.arc(xf, axisY, radius, 0, Math.PI * 2);
            ctx.fill();
            ctx.shadowBlur = 0;

            // Highlight
            ctx.fillStyle = 'rgba(255,255,255,0.85)';
            ctx.beginPath();
            ctx.arc(xf - radius * 0.3, axisY - radius * 0.35, radius * 0.22, 0, Math.PI * 2);
            ctx.fill();

            // Label
            ctx.fillStyle = 'rgba(226,232,240,0.9)';
            ctx.font = '11px ui-monospace, monospace';
            ctx.textAlign = 'center';
            ctx.fillText(`x = ${xFinal.toFixed(2)} m`, xf, axisY - radius - 12);
          }}
        />

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <TryIt label="Initial x" min={-2} max={4} step={0.1} value={x1} onChange={setX1} unit="m" />
          <TryIt label="Velocity v" min={-3} max={4} step={0.1} value={v} onChange={setV} unit="m/s" accent="emerald" />
          <TryIt label="Time t" min={0} max={3} step={0.05} value={t} onChange={setT} unit="s" accent="amber" />
        </div>

        <Formula label="Predicted position" accent="sky">
          x(t) = x<Sub>0</Sub> + v·t = {x1.toFixed(1)} + {v.toFixed(1)}·{t.toFixed(2)} ={' '}
          <strong>{xFinal.toFixed(2)} m</strong>
        </Formula>
      </Section>

      <Section title="The four quantities you'll use everywhere">
        <NumberedSteps
          steps={[
            <>
              <strong className="text-slate-100">Position (x)</strong> — where the object
              is, measured from origin. SI unit: metre.
            </>,
            <>
              <strong className="text-slate-100">Displacement (Δx)</strong> — vector
              change in position. Can be negative.
            </>,
            <>
              <strong className="text-slate-100">Velocity (v)</strong> — rate of change of
              position. SI unit: m/s. Vector.
            </>,
            <>
              <strong className="text-slate-100">Acceleration (a)</strong> — rate of
              change of velocity. SI unit: m/s². Vector.
            </>,
          ]}
        />
      </Section>

      <Callout tone="history" title="A very short history">
        Galileo (1638) was among the first to describe motion with mathematics rather than
        philosophy. Newton (1687) then unified it into the laws we still teach. Every
        formula in this chapter traces back to their work.
      </Callout>
    </LessonShell>
  );
};