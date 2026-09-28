import React from 'react';
import { LessonShell } from '../LessonShell';
import { LessonCanvas } from '../LessonCanvas';
import {
  Prose, Formula, Callout, Section, KeyList, Sub, NumberedSteps,
} from '../primitives';
import {
  clamp, easeInOutCubic, colors,
  drawArrow, drawBall, drawGrid, drawLabel,
} from '../animation/helpers';

export interface LessonNavProps {
  onPrev?: () => void;
  onNext?: () => void;
  prevTitle?: string;
  nextTitle?: string;
}

/* ------------------------------------------------------------------ */
/* Figure 1 — two projectiles, relative path is a straight line        */
/* ------------------------------------------------------------------ */

const RelativeLine: React.FC = () => (
  <LessonCanvas
    height={300}
    duration={6}
    draw={({ ctx, w, h, progress }) => {
      const originX = 70;
      const groundY = h - 40;

      const u = 24, g = 10;
      const thA = (60 * Math.PI) / 180;
      const thB = (30 * Math.PI) / 180;
      const sx = 4.5, sy = 4.5;

      const launchP = easeInOutCubic(clamp(progress / 0.88, 0, 1));
      const tMax = 4;
      const t = launchP * tMax;

      const ax = u * Math.cos(thA) * t;
      const ay = u * Math.sin(thA) * t - 0.5 * g * t * t;
      const bx = 8 + u * Math.cos(thB) * t;
      const by = u * Math.sin(thB) * t - 0.5 * g * t * t;

      drawGrid(ctx, w, h, 14, 6, colors.border(0.25));

      const toScreen = (x: number, y: number): [number, number] => [
        originX + (x - 2) * sx,
        groundY - y * sy - 30,
      ];

      // ground line
      const [g0x, g0y] = toScreen(-2, 0);
      const [g1x, g1y] = toScreen(20, 0);
      ctx.save();
      ctx.strokeStyle = colors.text(0.5);
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(g0x, g0y);
      ctx.lineTo(g1x, g1y);
      ctx.stroke();
      ctx.restore();

      // Trails
      const trail = (ux: number, uy: number, x0: number, tone: string) => {
        ctx.save();
        ctx.strokeStyle = tone;
        ctx.lineWidth = 1.4;
        ctx.setLineDash([3, 3]);
        ctx.beginPath();
        for (let i = 0; i <= 60; i++) {
          const p = (i / 60) * launchP;
          const tt = p * tMax;
          const xx = x0 + ux * tt;
          const yy = uy * tt - 0.5 * g * tt * tt;
          const [px, py] = toScreen(xx, yy);
          if (i === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        }
        ctx.stroke();
        ctx.restore();
      };
      trail(u * Math.cos(thA), u * Math.sin(thA), 0, colors.accent(0.65));
      trail(u * Math.cos(thB), u * Math.sin(thB), 8, colors.sage(0.65));

      // Relative position vector
      const [axs, ays] = toScreen(ax, ay);
      const [bxs, bys] = toScreen(bx, by);
      ctx.save();
      ctx.strokeStyle = colors.rose(0.6);
      ctx.lineWidth = 1.8;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(axs, ays);
      ctx.lineTo(bxs, bys);
      ctx.stroke();
      ctx.restore();

      drawBall(ctx, axs, ays, 7, colors.accent(1));
      drawBall(ctx, bxs, bys, 7, colors.sage(1));

      drawLabel(ctx, 'A', axs + 10, ays - 10, colors.accent(0.95), '13px "JetBrains Mono"');
      drawLabel(ctx, 'B', bxs + 10, bys - 10, colors.sage(0.95), '13px "JetBrains Mono"');
      drawLabel(
        ctx,
        'r_AB  ·  straight line',
        (axs + bxs) / 2 - 40,
        (ays + bys) / 2 - 12,
        colors.rose(0.95),
        '11px "JetBrains Mono"',
      );

      drawLabel(ctx, `t = ${t.toFixed(2)} s`, w - 120, 24, colors.text(0.95));
      drawLabel(
        ctx,
        'u = 24 m/s for both, launched together',
        24,
        24,
        colors.textStrong(0.9),
      );
    }}
  />
);

/* ------------------------------------------------------------------ */
/* Figure 2 — relative velocity vectors                                */
/* ------------------------------------------------------------------ */

const RelativeVelocityVectors: React.FC = () => (
  <LessonCanvas
    height={240}
    duration={5}
    draw={({ ctx, w, h, progress }) => {
      const ox = 120;
      const oy = h - 50;
      const g = 10;
      const tMax = 3;

      const t = easeInOutCubic(clamp(progress / 0.85, 0, 1)) * tMax;

      const uA = { x: 12, y: 20 };
      const uB = { x: 18, y: 14 };

      const vA = { x: uA.x, y: uA.y - g * t };
      const vB = { x: uB.x, y: uB.y - g * t };
      const vRel = { x: vB.x - vA.x, y: vB.y - vA.y };

      drawGrid(ctx, w, h, 12, 5, colors.border(0.25));

      // axes
      ctx.save();
      ctx.strokeStyle = colors.text(0.4);
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(40, oy);
      ctx.lineTo(w - 40, oy);
      ctx.moveTo(ox, 30);
      ctx.lineTo(ox, oy);
      ctx.stroke();
      ctx.restore();

      const scale = 4;
      drawArrow(ctx, ox, oy, ox + vA.x * scale, oy - vA.y * scale, colors.accent(0.95), 2);
      drawLabel(
        ctx,
        'v_A',
        ox + vA.x * scale + 8,
        oy - vA.y * scale,
        colors.accent(0.95),
      );

      const aTipX = ox + vA.x * scale;
      const aTipY = oy - vA.y * scale;
      drawArrow(
        ctx,
        aTipX,
        aTipY,
        aTipX + (vB.x - vA.x) * scale,
        aTipY - (vB.y - vA.y) * scale,
        colors.rose(0.95),
        2,
      );
      drawLabel(
        ctx,
        'v_BA',
        aTipX + (vB.x - vA.x) * scale + 8,
        aTipY - (vB.y - vA.y) * scale,
        colors.rose(0.95),
      );

      drawArrow(ctx, ox, oy, ox + vB.x * scale, oy - vB.y * scale, colors.sage(0.9), 2);
      drawLabel(
        ctx,
        'v_B',
        ox + vB.x * scale + 8,
        oy - vB.y * scale,
        colors.sage(0.95),
      );

      drawLabel(ctx, 'v_BA = v_B − v_A  is time-independent', 24, 24, colors.textStrong(0.95));
      drawLabel(
        ctx,
        `|v_BA| = ${Math.hypot(vRel.x, vRel.y).toFixed(1)} m/s`,
        24,
        44,
        colors.rose(0.95),
      );
      drawLabel(ctx, `t ≈ ${t.toFixed(2)} s`, w - 120, 24, colors.text(0.9));
    }}
  />
);

/* ------------------------------------------------------------------ */
/* Figure 3 — minimum distance between two projectiles                 */
/* ------------------------------------------------------------------ */

const MinDistance: React.FC = () => (
  <LessonCanvas
    height={280}
    duration={6}
    draw={({ ctx, w, h, progress }) => {
      const originX = 70;
      const groundY = h - 40;
      const sx = 5, sy = 5;
      const g = 10;

      const uA = { mag: 20, th: (70 * Math.PI) / 180 };
      const uB = { mag: 22, th: (45 * Math.PI) / 180 };
      const Ax0 = 0, Bx0 = 10;
      const uAx = uA.mag * Math.cos(uA.th);
      const uAy = uA.mag * Math.sin(uA.th);
      const uBx = uB.mag * Math.cos(uB.th);
      const uBy = uB.mag * Math.sin(uB.th);

      const toScreen = (x: number, y: number): [number, number] => [
        originX + (x - 1) * sx,
        groundY - y * sy - 20,
      ];

      drawGrid(ctx, w, h, 14, 6, colors.border(0.25));

      // ground line
      const [g0x, g0y] = toScreen(-1, 0);
      const [g1x, g1y] = toScreen(20, 0);
      ctx.save();
      ctx.strokeStyle = colors.text(0.45);
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(g0x, g0y);
      ctx.lineTo(g1x, g1y);
      ctx.stroke();
      ctx.restore();

      const r0x = Bx0 - Ax0;
      const r0y = 0;
      const vrx = uBx - uAx;
      const vry = uBy - uAy;
      const tMin = -(r0x * vrx + r0y * vry) / (vrx * vrx + vry * vry);
      const dMin = Math.hypot(r0x + vrx * tMin, r0y + vry * tMin);

      const drawPath = (x0: number, ux: number, uy: number, tone: string) => {
        ctx.save();
        ctx.strokeStyle = tone;
        ctx.lineWidth = 1.4;
        ctx.setLineDash([3, 3]);
        ctx.beginPath();
        for (let i = 0; i <= 60; i++) {
          const p = i / 60;
          const tt = p * 3;
          const yy = uy * tt - 0.5 * g * tt * tt;
          if (yy < 0) break;
          const [px, py] = toScreen(x0 + ux * tt, yy);
          if (i === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        }
        ctx.stroke();
        ctx.restore();
      };
      drawPath(Ax0, uAx, uAy, colors.accent(0.55));
      drawPath(Bx0, uBx, uBy, colors.sage(0.55));

      const launchP = easeInOutCubic(clamp(progress / 0.85, 0, 1));
      const t = launchP * 3;

      const ax = Ax0 + uAx * t;
      const ay = uAy * t - 0.5 * g * t * t;
      const bx = Bx0 + uBx * t;
      const by = uBy * t - 0.5 * g * t * t;

      const [axs, ays] = toScreen(ax, ay);
      const [bxs, bys] = toScreen(bx, by);

      ctx.save();
      ctx.strokeStyle = colors.rose(0.75);
      ctx.lineWidth = 1.8;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(axs, ays);
      ctx.lineTo(bxs, bys);
      ctx.stroke();
      ctx.restore();

      const atMin = Math.abs(t - tMin) < 0.06;
      if (atMin) {
        ctx.save();
        ctx.strokeStyle = colors.ember(0.95);
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc((axs + bxs) / 2, (ays + bys) / 2, 14, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
      }

      drawBall(ctx, axs, ays, 7, colors.accent(1));
      drawBall(ctx, bxs, bys, 7, colors.sage(1));

      drawLabel(
        ctx,
        `d(t) = ${Math.hypot(bx - ax, by - ay).toFixed(2)} m`,
        24,
        24,
        colors.rose(0.95),
      );
      drawLabel(
        ctx,
        `d_min = ${dMin.toFixed(2)} m  at t = ${tMin.toFixed(2)} s`,
        24,
        44,
        colors.ember(0.95),
      );
      drawLabel(ctx, 'A', axs - 18, ays - 4, colors.accent(0.95), '13px "JetBrains Mono"');
      drawLabel(ctx, 'B', bxs + 10, bys - 4, colors.sage(0.95), '13px "JetBrains Mono"');
    }}
  />
);

/* ------------------------------------------------------------------ */
/* Lesson                                                              */
/* ------------------------------------------------------------------ */

export const L09_RelativeProjectile: React.FC<LessonNavProps> = (nav) => {
  return (
    <LessonShell
      eyebrow="Chapter 09 · Advanced"
      title="Relative projectile motion"
      lede="Put two projectiles in the air at once. Each one on its own is a parabola. But from the perspective of the other, the motion becomes a straight line — and that single fact turns every interception and minimum-distance problem into arithmetic."
      {...nav}
    >
      <Section title="The one line that changes everything">
        <Prose>
          Two projectiles in the same gravitational field both feel the same
          acceleration. When you subtract one motion from the other, the{' '}
          <span className="font-mono text-token">−g</span> cancels.
        </Prose>
        <Formula label="Relative acceleration" accent="violet">
          a<Sub>BA</Sub> = a<Sub>B</Sub> − a<Sub>A</Sub> = (−g) − (−g) = 0
        </Formula>
        <Callout tone="tip" title="The consequence">
          In the frame of projectile A, projectile B has <em>no acceleration</em>.
          It moves in a straight line at constant velocity. Every relative
          projectile problem reduces to straight-line kinematics.
        </Callout>
        <RelativeVelocityVectors />
      </Section>

      <Section title="The straight-line picture">
        <Prose>
          In the ground frame, both projectiles trace parabolas. But draw a
          line joining them at each instant, and the shape of that line — and
          the rate at which the two balls converge or diverge — is governed
          entirely by the <em>relative</em> velocity, which is constant.
        </Prose>
        <RelativeLine />
        <Formula label="Relative velocity" accent="rose">
          v<Sub>BA</Sub> = v<Sub>B</Sub> − v<Sub>A</Sub> &nbsp; (constant)
        </Formula>
        <Formula label="Relative position" accent="amber">
          r<Sub>BA</Sub>(t) = r<Sub>BA</Sub>(0) + v<Sub>BA</Sub> · t
        </Formula>
      </Section>

      <Section title="Minimum distance between two projectiles">
        <Prose>
          Because <span className="font-mono">r<Sub>BA</Sub>(t)</span> is a
          linear function of t, the squared distance{' '}
          <span className="font-mono">|r<Sub>BA</Sub>(t)|²</span> is a
          quadratic. Finding the minimum is one derivative away.
        </Prose>
        <NumberedSteps
          steps={[
            <>
              Write the initial relative position:{' '}
              <span className="font-mono text-token">
                r<Sub>0</Sub> = r<Sub>B</Sub>(0) − r<Sub>A</Sub>(0)
              </span>
              .
            </>,
            <>
              Write the relative velocity:{' '}
              <span className="font-mono text-token">
                v<Sub>rel</Sub> = v<Sub>B</Sub>(0) − v<Sub>A</Sub>(0)
              </span>
              .
            </>,
            <>
              The distance at time t is{' '}
              <span className="font-mono text-token">|r<Sub>0</Sub> + v<Sub>rel</Sub>t|</span>.
            </>,
            <>
              Minimise:{' '}
              <span className="font-mono text-token">
                t<Sub>min</Sub> = −(r<Sub>0</Sub>·v<Sub>rel</Sub>) / |v<Sub>rel</Sub>|²
              </span>
              .
            </>,
            <>
              Plug back to get <span className="font-mono text-token">d<Sub>min</Sub></span>.
            </>,
          ]}
        />
        <MinDistance />
      </Section>

      <Section title="Worked example — interception">
        <Prose>
          A ball is thrown from the origin at 20 m/s, 70° above horizontal. A
          second ball is thrown from (10 m, 0) at the same instant, and we
          want it to hit the first ball mid-air. What launch velocity must the
          second ball have?
        </Prose>
        <Callout tone="info" title="The beautiful trick">
          For a collision, we need <span className="font-mono">r<Sub>BA</Sub>(t) = 0</span>{' '}
          for some t &gt; 0. That means{' '}
          <span className="font-mono">r<Sub>0</Sub> = −v<Sub>rel</Sub> · t</span>,
          i.e. the relative velocity must point directly opposite to the
          initial separation vector.
        </Callout>
        <div className="space-y-3 rounded-xl border border-token bg-surface-2 p-5">
          <p className="text-[15px] leading-relaxed text-token-2">
            <span className="font-serif italic">Setup.</span> Initial separation{' '}
            <span className="font-mono text-token">r₀ = (10, 0)</span>. So{' '}
            <span className="font-mono text-token">v<Sub>rel</Sub></span> must
            point in the (−1, 0) direction — i.e. purely horizontal, leftward.
          </p>
          <p className="text-[15px] leading-relaxed text-token-2">
            <span className="font-serif italic">Vertical condition.</span>{' '}
            <span className="font-mono text-token">
              v<Sub>By</Sub> − v<Sub>Ay</Sub> = 0 ⟹ u<Sub>B</Sub> sin θ<Sub>B</Sub> = u<Sub>A</Sub> sin θ<Sub>A</Sub> = 20 sin 70° ≈ 18.79 m/s.
            </span>
          </p>
          <p className="text-[15px] leading-relaxed text-token-2">
            <span className="font-serif italic">Horizontal condition.</span>{' '}
            <span className="font-mono text-token">
              v<Sub>Bx</Sub> &lt; v<Sub>Ax</Sub> so the second ball catches up.
            </span>{' '}
            Choose <span className="font-mono text-token">u<Sub>B</Sub> = 22 m/s</span>,
            giving <span className="font-mono text-token">sin θ<Sub>B</Sub> ≈ 0.854</span>,
            i.e. <span className="font-mono text-token">θ<Sub>B</Sub> ≈ 58.6°</span>.
            Then <span className="font-mono text-token">v<Sub>Bx</Sub> ≈ 11.46 m/s</span>{' '}
            and <span className="font-mono text-token">v<Sub>Ax</Sub> ≈ 6.84 m/s</span>,
            so the second ball has <em>greater</em> horizontal velocity — the
            second ball does not catch up.
          </p>
          <p className="text-[15px] leading-relaxed text-token-2">
            <span className="font-serif italic">Correction.</span> We want the
            second ball to be <em>slower</em> horizontally, or launched from
            the other side. Reversing: let the second ball be launched from
            the origin and the first from (10 m, 0). Then the same condition
            holds with signs swapped — and the collision happens at{' '}
            <span className="font-mono text-token">
              t = 10 / (v<Sub>Ax</Sub> − v<Sub>Bx</Sub>) ≈ 2.17 s
            </span>
            , well within flight.
          </p>
        </div>
        <Callout tone="trap" title="The classic mistake">
          Students compute when each ball reaches its own apex and try to
          match those times. That is almost never the collision time. The
          right condition is a single vector equation:{' '}
          <span className="font-mono">r₀ + v<Sub>rel</Sub> t = 0</span>.
        </Callout>
      </Section>

      <Section title="Everything you now know">
        <KeyList
          items={[
            <>Two projectiles in the same g-field have zero relative acceleration.</>,
            <>From one projectile's frame, the other moves in a straight line at constant velocity.</>,
            <>Minimum distance is the perpendicular distance from origin to the relative-velocity line.</>,
            <>
              Interception requires <span className="font-mono">r₀ ∥ v<Sub>rel</Sub></span>{' '}
              with opposite signs.
            </>,
            <>Every "two projectiles meet" problem is linear algebra in disguise.</>,
          ]}
        />
      </Section>
    </LessonShell>
  );
};