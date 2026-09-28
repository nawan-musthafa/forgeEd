import React, { useState } from 'react';
import { LessonShell } from '../LessonShell';
import { LessonCanvas } from '../LessonCanvas';
import { Prose, Formula, Callout, Section, KeyList, Sub, TryIt } from '../primitives';

export interface LessonNavProps {
  onPrev?: () => void;
  onNext?: () => void;
  prevTitle?: string;
  nextTitle?: string;
}

export const L05_RelativeVelocity: React.FC<LessonNavProps> = (nav) => {
  const [vBoat, setVBoat] = useState(4);
  const [vRiver, setVRiver] = useState(3);

  const drift = Math.atan2(vRiver, vBoat) * (180 / Math.PI);
  const resultantSpeed = Math.hypot(vBoat, vRiver);

  return (
    <LessonShell
      eyebrow="Chapter 05 · Frames of reference"
      title="Relative velocity"
      lede="Two observers can disagree about the velocity of the same object and both be right. Understanding how to move between reference frames unlocks a whole family of problems — including river crossings."
      {...nav}
    >
      <Section title="The relative velocity formula">
        <Formula label="Velocity of A as seen from B" accent="sky">
          v<Sub>AB</Sub> = v<Sub>A</Sub> − v<Sub>B</Sub>
        </Formula>
        <Prose>
          Both v<Sub>A</Sub> and v<Sub>B</Sub> must be measured in the <em>same</em>{' '}
          reference frame — usually the ground. Then their difference gives the velocity
          one sees from the other.
        </Prose>
        <Callout tone="info" title="Intuition">
          If you're on a train moving at 60 km/h and someone walks past you at 5 km/h, a
          person on the ground sees them at 65 km/h. But you see them at 5 km/h. Same
          walk, different frames.
        </Callout>
      </Section>

      <Section title="River-boat problem">
        <Prose>
          A classic 2-D relative velocity situation: a boat points at some heading on a
          river that flows sideways. The boat's velocity relative to the ground is the
          vector sum of its velocity in still water and the river's velocity.
        </Prose>
        <KeyList
          items={[
            <>
              <strong className="text-sky-300">Aim straight across</strong>: you'll drift
              downstream by (v<Sub>river</Sub>/v<Sub>boat</Sub>) × width.
            </>,
            <>
              <strong className="text-emerald-300">Aim upstream to reach directly opposite</strong>:
              point the bow at angle sin⁻¹(v<Sub>river</Sub>/v<Sub>boat</Sub>) upstream.
            </>,
            <>
              <strong className="text-amber-300">Crossing time</strong> is minimized by
              pointing straight across — time = width / v<Sub>boat</Sub>.
            </>,
          ]}
        />
      </Section>

      <Section title="Try it — a river crossing">
        <LessonCanvas
          height={280}
          draw={({ ctx, w, h, time }) => {
            ctx.clearRect(0, 0, w, h);
            ctx.fillStyle = 'rgba(15,23,42,0.7)';
            ctx.fillRect(0, 0, w, h);

            const pad = 40;
            const riverH = h - pad * 2;
            const riverW = w - pad * 2;

            // River band
            const grad = ctx.createLinearGradient(pad, pad, pad, h - pad);
            grad.addColorStop(0, 'rgba(14,116,144,0.28)');
            grad.addColorStop(1, 'rgba(30,64,175,0.20)');
            ctx.fillStyle = grad;
            ctx.fillRect(pad, pad, riverW, riverH);

            // Banks
            ctx.fillStyle = 'rgba(30,41,59,0.85)';
            ctx.fillRect(0, 0, w, pad);
            ctx.fillRect(0, h - pad, w, pad);

            // Flow arrows
            ctx.strokeStyle = 'rgba(56,189,248,0.5)';
            ctx.lineWidth = 1.5;
            for (let i = 0; i < 6; i += 1) {
              const y = pad + 20 + i * ((riverH - 40) / 5);
              ctx.beginPath();
              ctx.moveTo(pad + 10, y);
              ctx.lineTo(pad + riverW * 0.35, y);
              ctx.stroke();
              ctx.beginPath();
              ctx.moveTo(pad + riverW * 0.35, y);
              ctx.lineTo(pad + riverW * 0.35 - 8, y - 4);
              ctx.moveTo(pad + riverW * 0.35, y);
              ctx.lineTo(pad + riverW * 0.35 - 8, y + 4);
              ctx.stroke();
            }

            // Boat start
            const startX = pad + 30;
            const startY = h - pad - 40;
            const boatX = startX + vBoat * 14;
            const boatY = startY - vRiver * 14;

            // Boat's straight-across path (ghost)
            ctx.setLineDash([5, 5]);
            ctx.strokeStyle = 'rgba(148,163,184,0.4)';
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.moveTo(startX, startY);
            ctx.lineTo(startX, pad + 40);
            ctx.stroke();
            ctx.setLineDash([]);

            // Actual path
            ctx.strokeStyle = '#fbbf24';
            ctx.lineWidth = 2.5;
            ctx.beginPath();
            ctx.moveTo(startX, startY);
            ctx.lineTo(boatX, boatY);
            ctx.stroke();

            // Velocity arrows at start
            // Boat's own velocity (up, green)
            const arrowScale = 14;
            ctx.strokeStyle = '#34d399';
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.moveTo(startX, startY);
            ctx.lineTo(startX, startY - vBoat * arrowScale);
            ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(startX, startY - vBoat * arrowScale);
            ctx.lineTo(startX - 5, startY - vBoat * arrowScale + 8);
            ctx.lineTo(startX + 5, startY - vBoat * arrowScale + 8);
            ctx.closePath();
            ctx.fillStyle = '#34d399';
            ctx.fill();

            // River velocity (right, blue)
            ctx.strokeStyle = '#38bdf8';
            ctx.beginPath();
            ctx.moveTo(startX, startY);
            ctx.lineTo(startX + vRiver * arrowScale, startY);
            ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(startX + vRiver * arrowScale, startY);
            ctx.lineTo(startX + vRiver * arrowScale - 8, startY - 5);
            ctx.lineTo(startX + vRiver * arrowScale - 8, startY + 5);
            ctx.closePath();
            ctx.fillStyle = '#38bdf8';
            ctx.fill();

            // Resultant (pink)
            ctx.strokeStyle = '#f472b6';
            ctx.beginPath();
            ctx.moveTo(startX, startY);
            ctx.lineTo(startX + vRiver * arrowScale, startY - vBoat * arrowScale);
            ctx.stroke();

            // Boat
            ctx.fillStyle = '#f8fafc';
            ctx.beginPath();
            ctx.arc(boatX, boatY, 7, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = 'rgba(15,23,42,0.9)';
            ctx.lineWidth = 2;
            ctx.stroke();

            // Labels
            ctx.fillStyle = 'rgba(226,232,240,0.9)';
            ctx.font = 'bold 11px ui-monospace, monospace';
            ctx.fillText(`Drift angle = ${drift.toFixed(1)}°`, pad + 12, pad + 18);
            ctx.fillText(`Resultant speed = ${resultantSpeed.toFixed(2)} m/s`, pad + 12, pad + 34);
          }}
        />

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <TryIt label="Boat speed (still water)" min={1} max={8} step={0.5} value={vBoat} onChange={setVBoat} unit="m/s" accent="emerald" />
          <TryIt label="River speed" min={0} max={6} step={0.5} value={vRiver} onChange={setVRiver} unit="m/s" />
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Formula label="Resultant speed" accent="sky">
            √({vBoat}² + {vRiver}²) = <strong>{resultantSpeed.toFixed(2)} m/s</strong>
          </Formula>
          <Formula label="Drift angle from straight" accent="amber">
            tan⁻¹({vRiver}/{vBoat}) = <strong>{drift.toFixed(1)}°</strong>
          </Formula>
        </div>
      </Section>

      <Callout tone="trap" title="The subtle trap">
        For the crossing <em>time</em>, only the boat's perpendicular component matters.
        The river's flow doesn't help you cross faster — it only pushes you sideways.
        Time = width / v<Sub>boat,⊥</Sub>.
      </Callout>
    </LessonShell>
  );
};