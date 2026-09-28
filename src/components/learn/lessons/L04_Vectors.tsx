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

export const L04_Vectors: React.FC<LessonNavProps> = (nav) => {
  const [mag, setMag] = useState(10);
  const [angle, setAngle] = useState(35);

  const rad = (angle * Math.PI) / 180;
  const ax = mag * Math.cos(rad);
  const ay = mag * Math.sin(rad);

  return (
    <LessonShell
      eyebrow="Chapter 04 · Mathematical tools"
      title="Vectors and components"
      lede="Every quantity with a direction is a vector. Splitting a vector into x- and y-components is the single most useful skill in projectile motion — everything else is arithmetic."
      {...nav}
    >
      <Section title="Scalar vs vector">
        <Prose>
          A <strong className="text-slate-100">scalar</strong> has magnitude only — mass,
          time, temperature. A <strong className="text-slate-100">vector</strong> has
          magnitude <em>and</em> direction — displacement, velocity, acceleration, force.
        </Prose>
        <Prose>
          Vectors are drawn as arrows: the length is the magnitude, the arrowhead shows
          the direction.
        </Prose>
      </Section>

      <Section title="Resolving into components">
        <Prose>
          Any 2-D vector can be written as the sum of a horizontal piece and a vertical
          piece. If a vector of magnitude A makes an angle θ with the +x axis:
        </Prose>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Formula label="x-component" accent="sky">
            A<Sub>x</Sub> = A cos θ
          </Formula>
          <Formula label="y-component" accent="emerald">
            A<Sub>y</Sub> = A sin θ
          </Formula>
        </div>
        <Prose>
          You can also go the other way — from components back to magnitude and direction:
        </Prose>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Formula label="Magnitude" accent="violet">
            A = √(A<Sub>x</Sub>² + A<Sub>y</Sub>²)
          </Formula>
          <Formula label="Direction" accent="amber">
            θ = tan⁻¹(A<Sub>y</Sub> / A<Sub>x</Sub>)
          </Formula>
        </div>
      </Section>

      <Section title="Try it — resolve a vector">
        <Prose>
          Drag the magnitude and the angle. The diagram shows the original vector (pink),
          its horizontal component (blue), and its vertical component (green).
        </Prose>

        <LessonCanvas
          height={280}
          draw={({ ctx, w, h, time }) => {
            ctx.clearRect(0, 0, w, h);
            ctx.fillStyle = 'rgba(15,23,42,0.7)';
            ctx.fillRect(0, 0, w, h);

            const originX = w * 0.28;
            const originY = h * 0.82;
            const pxPerUnit = Math.min((w - originX - 40) / 16, (originY - 40) / 12);

            // Axes
            ctx.strokeStyle = 'rgba(148,163,184,0.35)';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(originX - 20, originY);
            ctx.lineTo(w - 20, originY);
            ctx.moveTo(originX, originY + 10);
            ctx.lineTo(originX, 20);
            ctx.stroke();

            // Ticks
            ctx.fillStyle = 'rgba(148,163,184,0.7)';
            ctx.font = '10px ui-monospace, monospace';
            for (let i = 2; i <= 16; i += 2) {
              const x = originX + i * pxPerUnit;
              if (x > w - 20) break;
              ctx.fillText(`${i}`, x - 4, originY + 16);
            }

            const tipX = originX + ax * pxPerUnit;
            const tipY = originY - ay * pxPerUnit;

            // x-component (blue)
            ctx.strokeStyle = '#38bdf8';
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.moveTo(originX, originY);
            ctx.lineTo(tipX, originY);
            ctx.stroke();

            // y-component (green)
            ctx.strokeStyle = '#34d399';
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.moveTo(originX, originY);
            ctx.lineTo(originX, tipY);
            ctx.stroke();

            // Resultant (pink)
            ctx.strokeStyle = '#f472b6';
            ctx.lineWidth = 3.5;
            ctx.beginPath();
            ctx.moveTo(originX, originY);
            ctx.lineTo(tipX, tipY);
            ctx.stroke();

            // Arrowhead
            const dx = tipX - originX;
            const dy = tipY - originY;
            const len = Math.hypot(dx, dy);
            if (len > 1) {
              const ux = dx / len;
              const uy = dy / len;
              ctx.beginPath();
              ctx.moveTo(tipX, tipY);
              ctx.lineTo(tipX - ux * 12 - uy * 5, tipY - uy * 12 + ux * 5);
              ctx.lineTo(tipX - ux * 12 + uy * 5, tipY - uy * 12 - ux * 5);
              ctx.closePath();
              ctx.fillStyle = '#f472b6';
              ctx.fill();
            }

            // Dashed helper lines
            ctx.setLineDash([4, 4]);
            ctx.strokeStyle = 'rgba(148,163,184,0.4)';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(tipX, tipY);
            ctx.lineTo(tipX, originY);
            ctx.moveTo(tipX, tipY);
            ctx.lineTo(originX, tipY);
            ctx.stroke();
            ctx.setLineDash([]);

            // Angle arc
            ctx.strokeStyle = 'rgba(251,191,36,0.6)';
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.arc(originX, originY, 34, -rad, 0);
            ctx.stroke();
            ctx.fillStyle = 'rgba(251,191,36,0.9)';
            ctx.font = 'bold 11px ui-monospace, monospace';
            ctx.fillText(`θ = ${angle}°`, originX + 38, originY - 8);

            // Labels
            ctx.fillStyle = '#38bdf8';
            ctx.font = 'bold 11px ui-monospace, monospace';
            ctx.fillText(`Aₓ = ${ax.toFixed(2)}`, (originX + tipX) / 2 - 30, originY + 16);

            ctx.save();
            ctx.translate(originX - 8, (originY + tipY) / 2);
            ctx.rotate(-Math.PI / 2);
            ctx.fillStyle = '#34d399';
            ctx.fillText(`A_y = ${ay.toFixed(2)}`, -36, 0);
            ctx.restore();

            ctx.fillStyle = '#f472b6';
            ctx.fillText(`A = ${mag.toFixed(1)}`, (originX + tipX) / 2 + 8, (originY + tipY) / 2 - 8);
          }}
        />

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <TryIt label="Magnitude A" min={2} max={16} step={0.5} value={mag} onChange={setMag} unit="units" />
          <TryIt label="Angle θ" min={0} max={90} step={1} value={angle} onChange={setAngle} unit="°" accent="emerald" />
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Formula label="Aₓ = A cos θ" accent="sky">
            {mag} · cos {angle}° = <strong>{ax.toFixed(2)}</strong>
          </Formula>
          <Formula label="A_y = A sin θ" accent="emerald">
            {mag} · sin {angle}° = <strong>{ay.toFixed(2)}</strong>
          </Formula>
        </div>
      </Section>

      <Section title="Adding vectors">
        <Prose>
          To add two vectors, split both into components, add the components separately,
          then recombine. Never add magnitudes directly unless the vectors are parallel.
        </Prose>
        <Formula label="Vector addition" accent="sky">
          A + B = (A<Sub>x</Sub> + B<Sub>x</Sub>) î + (A<Sub>y</Sub> + B<Sub>y</Sub>) ĵ
        </Formula>
        <Callout tone="tip" title="Why components work">
          The x-direction and y-direction are <em>independent</em>. Motion along one axis
          never affects the other. This is the deepest idea behind projectile motion, and
          we'll use it constantly from here on.
        </Callout>
      </Section>

      <Callout tone="trap" title="A common error">
        Writing <span className="font-mono">Aₓ = A sin θ</span> when θ is measured from
        the x-axis. The rule is: <em>adjacent to θ → cos; opposite to θ → sin.</em> Draw
        the triangle. Never memorise blindly.
      </Callout>
    </LessonShell>
  );
};