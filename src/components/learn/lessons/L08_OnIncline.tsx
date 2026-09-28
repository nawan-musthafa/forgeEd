import React from 'react';
import { LessonShell } from '../LessonShell';
import { LessonCanvas } from '../LessonCanvas';
import {
  Prose, Formula, Callout, Section, KeyList, Sub,
} from '../primitives';
import {
  clamp, easeInOutCubic, easeOutCubic, colors,
  drawLine, drawArrow, drawBall, drawLabel, vp,
} from '../animation/helpers';

export interface LessonNavProps {
  onPrev?: () => void;
  onNext?: () => void;
  prevTitle?: string;
  nextTitle?: string;
}

const GravityOnIncline: React.FC = () => (
  <LessonCanvas
    height={260}
    duration={4}
    draw={({ ctx, w, h, progress }) => {
      const groundY = h - 40;
      const originX = 60;
      const theta = (30 * Math.PI) / 180;
      const slopeLen = Math.min(w - 120, 460);
      const endX = originX + slopeLen * Math.cos(theta);
      const endY = groundY - slopeLen * Math.sin(theta);

      drawLine(ctx, originX, groundY, endX, endY, colors.text(0.6), 2);
      drawLine(ctx, originX, groundY, w - 40, groundY, colors.text(0.28), 1, [4, 4]);

      ctx.save();
      ctx.strokeStyle = colors.text(0.6);
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(originX, groundY, 42, -theta, 0);
      ctx.stroke();
      ctx.restore();
      drawLabel(ctx, 'θ', originX + 48, groundY - 12, colors.textStrong(0.95), '13px "JetBrains Mono"');

      const blockP = easeInOutCubic(clamp(progress / 0.7, 0, 1));
      const along = 120 + blockP * 100;
      const bx = originX + along * Math.cos(theta);
      const by = groundY - along * Math.sin(theta);

      const gScale = 26;
      drawArrow(ctx, bx, by, bx, by + gScale * 3, colors.ember(0.95), 2);
      drawLabel(ctx, 'mg', bx + 6, by + gScale * 3 - 12, colors.ember(0.95), '12px "JetBrains Mono"');

      const gx = -Math.sin(theta) * gScale * 2.4;
      const gy = Math.cos(theta) * gScale * 2.4;
      drawArrow(ctx, bx, by, bx + gx, by + gy, colors.sage(0.95), 2);
      drawLabel(ctx, 'mg sin θ', bx + gx - 20, by + gy + 14, colors.sage(0.95), '11px "JetBrains Mono"');

      const nx = -Math.cos(theta) * gScale * 2.0;
      const ny = -Math.sin(theta) * gScale * 2.0;
      drawArrow(ctx, bx, by, bx + nx, by + ny, colors.accent(0.95), 2);
      drawLabel(ctx, 'mg cos θ', bx + nx - 26, by + ny - 10, colors.accent(0.95), '11px "JetBrains Mono"');

      ctx.save();
      ctx.strokeStyle = colors.text(0.3);
      ctx.setLineDash([3, 4]);
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(bx + gx, by + gy);
      ctx.lineTo(bx + gx + nx, by + gy + ny);
      ctx.lineTo(bx + nx, by + ny);
      ctx.stroke();
      ctx.restore();

      drawBall(ctx, bx, by, 6, colors.textStrong(1));
      drawLabel(ctx, 'gravity decomposes on the tilted surface', 24, 22, colors.textStrong(0.9));
    }}
  />
);

const TiltedTrajectory: React.FC = () => (
  <LessonCanvas
    height={300}
    duration={6}
    draw={({ ctx, w, h, progress }) => {
      const originX = 70;
      const originY = h - 44;
      const theta = (20 * Math.PI) / 180;
      const alpha = (55 * Math.PI) / 180;
      const u = 20, g = 10;
      const cx = Math.cos(theta), cy = Math.sin(theta);
      const slopeLen = 520;
      const endX = originX + slopeLen * cx;
      const endY = originY - slopeLen * cy;

      drawLine(ctx, originX, originY, endX, endY, colors.text(0.55), 2);
      drawLine(ctx, originX, originY, w - 40, originY, colors.text(0.25), 1, [3, 4]);

      const sx = 6, sy = 6;
      const T = (2 * u * Math.sin(alpha)) / (g * Math.cos(theta));
      const launchP = easeInOutCubic(clamp(progress / 0.85, 0, 1));

      ctx.save();
      ctx.strokeStyle = colors.ember(0.75);
      ctx.lineWidth = 2;
      ctx.beginPath();
      for (let i = 0; i <= 80; i++) {
        const p = (i / 80) * launchP;
        const tt = p * T;
        const xp = u * Math.cos(alpha) * tt - 0.5 * g * Math.sin(theta) * tt * tt;
        const yp = u * Math.sin(alpha) * tt - 0.5 * g * Math.cos(theta) * tt * tt;
        const wx = xp * cx - yp * cy;
        const wy = xp * cy + yp * cx;
        const [px, py] = vp(wx, wy, { ox: originX, oy: originY, sx, sy });
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.stroke();
      ctx.restore();

      const tt = launchP * T;
      const xp = u * Math.cos(alpha) * tt - 0.5 * g * Math.sin(theta) * tt * tt;
      const yp = u * Math.sin(alpha) * tt - 0.5 * g * Math.cos(theta) * tt * tt;
      const wx = xp * cx - yp * cy;
      const wy = xp * cy + yp * cx;
      const [px, py] = vp(wx, wy, { ox: originX, oy: originY, sx, sy });
      drawBall(ctx, px, py, 7, colors.ball(1));

      drawArrow(ctx, originX, originY, originX + 60 * cx, originY - 60 * cy, colors.accent(0.7), 2);
      drawArrow(ctx, originX, originY, originX - 60 * cy, originY - 60 * cx, colors.sage(0.7), 2);
      drawLabel(ctx, "x'", originX + 70 * cx, originY - 70 * cy + 4, colors.accent(0.95));
      drawLabel(ctx, "y'", originX - 60 * cy - 20, originY - 60 * cx - 4, colors.sage(0.95));

      drawLabel(ctx, 'θ = 20°  ·  α = 55°  ·  u = 20 m/s', 24, 22, colors.textStrong(0.9));
      drawLabel(ctx, `T = ${T.toFixed(2)} s`, w - 130, 22, colors.text(0.9));
    }}
  />
);

const InclineSweep: React.FC = () => (
  <LessonCanvas
    height={260}
    duration={6}
    draw={({ ctx, w, h, progress }) => {
      const originX = 70;
      const originY = h - 44;
      const theta = (20 * Math.PI) / 180;
      const u = 20, g = 10;
      const cx = Math.cos(theta), cy = Math.sin(theta);
      const endX = originX + 520 * cx;
      const endY = originY - 520 * cy;
      drawLine(ctx, originX, originY, endX, endY, colors.text(0.5), 2);
      drawLine(ctx, originX, originY, w - 40, originY, colors.text(0.22), 1, [3, 4]);

      const sx = 6, sy = 6;
      const launchP = easeOutCubic(clamp(progress / 0.9, 0, 1));
      const angles = [30, 60, 90, 120];
      const tone = [colors.accent(0.9), colors.sage(0.9), colors.ember(0.9), colors.rose(0.9)];

      angles.forEach((deg, idx) => {
        const a = (deg * Math.PI) / 180;
        const T = (2 * u * Math.sin(a)) / (g * Math.cos(theta));
        ctx.save();
        ctx.strokeStyle = tone[idx].replace(/[\d.]+\)$/, '0.35)');
        ctx.lineWidth = 1.4;
        ctx.setLineDash([3, 3]);
        ctx.beginPath();
        for (let i = 0; i <= 60; i++) {
          const p = i / 60;
          const tt = p * T;
          const xp = u * Math.cos(a) * tt - 0.5 * g * Math.sin(theta) * tt * tt;
          const yp = u * Math.sin(a) * tt - 0.5 * g * Math.cos(theta) * tt * tt;
          const wx = xp * cx - yp * cy;
          const wy = xp * cy + yp * cx;
          const [px, py] = vp(wx, wy, { ox: originX, oy: originY, sx, sy });
          if (i === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        }
        ctx.stroke();
        ctx.restore();

        const tt = launchP * T;
        const xp = u * Math.cos(a) * tt - 0.5 * g * Math.sin(theta) * tt * tt;
        const yp = u * Math.sin(a) * tt - 0.5 * g * Math.cos(theta) * tt * tt;
        const wx = xp * cx - yp * cy;
        const wy = xp * cy + yp * cx;
        const [px, py] = vp(wx, wy, { ox: originX, oy: originY, sx, sy });
        drawBall(ctx, px, py, 5, tone[idx].replace(/[\d.]+\)$/, '1)'));
      });

      drawLabel(ctx, 'launch angle from slope: 30° · 60° · 90° · 120°', 24, 22, colors.textStrong(0.9));
      drawLabel(ctx, 'range measured along the incline', 24, h - 14, colors.text(0.85));
    }}
  />
);

export const L08_OnIncline: React.FC<LessonNavProps> = (nav) => {
  return (
    <LessonShell
      eyebrow="Chapter 08 · Projectile Motion"
      title="Projectile on an incline"
      lede="Tilt the ground and every quantity rotates with it. The horizontal-vertical split you know stops being useful — but a new split, along the incline and perpendicular to it, works exactly the same way."
      {...nav}
    >
      <Section title="Tilt the axes, not the physics">
        <Prose>
          The projectile still obeys the same two facts: no horizontal
          acceleration, and gravity points straight down. But "horizontal" and
          "vertical" are no longer aligned with the surface. So we rotate the
          frame.
        </Prose>
        <Callout tone="info" title="The trick, in one sentence">
          Choose your axes along and perpendicular to the incline, and gravity
          splits into <span className="font-mono">g sin θ</span> along the
          slope and <span className="font-mono">g cos θ</span> into the slope.
          Then solve two independent 1-D problems.
        </Callout>
        <GravityOnIncline />
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Formula label="Along the slope" accent="sage">
            a<Sub>∥</Sub> = − g sin θ
          </Formula>
          <Formula label="Perpendicular to slope" accent="sky">
            a<Sub>⊥</Sub> = − g cos θ
          </Formula>
        </div>
      </Section>

      <Section title="Launch at angle α above the incline">
        <Prose>
          Fire a projectile at speed u making angle α with the slope. Resolve u
          into components along and perpendicular to the incline — exactly the
          way you resolved it horizontally and vertically back on flat ground.
        </Prose>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Formula label="Along slope" accent="sage">
            u<Sub>∥</Sub> = u cos α
          </Formula>
          <Formula label="Perpendicular" accent="sky">
            u<Sub>⊥</Sub> = u sin α
          </Formula>
        </div>
        <Prose>
          The ball returns to the incline when its perpendicular displacement
          is zero. That gives the time of flight.
        </Prose>
        <Formula label="Flight time on incline" accent="amber">
          T = 2u sin α / (g cos θ)
        </Formula>
        <Formula label="Range along slope" accent="rose">
          R = u<Sub>∥</Sub>T + ½(−g sin θ)T² = (u² / g) · [sin(2α + θ) − sin θ] / cos²θ
        </Formula>
        <Callout tone="trap" title="A shape worth remembering">
          The trajectory in the tilted frame is still a parabola — just
          rotated. But the range formula is <em>not</em> simply u² sin 2α / g.
          The slope curvature adds a correction term.
        </Callout>
      </Section>

      <Section title="The trajectory, tilted">
        <Prose>
          Below, the projectile is drawn in the tilted coordinate frame
          (indigo axis along the slope, green axis perpendicular). The
          trajectory is a clean parabola in this frame — the physics is exactly
          what you learned on flat ground.
        </Prose>
        <TiltedTrajectory />
        <Callout tone="tip" title="Angle for maximum range on an incline">
          On a slope of angle θ, the angle (measured from the incline) that
          maximises range is <span className="font-mono">α = 45° + θ/2</span>.
          On flat ground (θ = 0) this reduces to 45°, as expected.
        </Callout>
      </Section>

      <Section title="Sweep the launch angle">
        <Prose>
          Same launch speed, same incline, four different angles. Notice how
          the trajectory in the world frame looks distorted — but the shape in
          the tilted frame stays a clean parabola.
        </Prose>
        <InclineSweep />
      </Section>

      <Section title="Worked example">
        <Prose>
          A ball is thrown up a 20° slope with speed 20 m/s at an angle of 55°
          from the slope. Take g = 10 m/s². Find the flight time and range
          along the slope.
        </Prose>
        <div className="space-y-3 rounded-xl border border-token bg-surface-2 p-5">
          <p className="text-[15px] leading-relaxed text-token-2">
            <span className="font-serif italic">Step 1 — flight time.</span>{' '}
            <span className="font-mono text-token">
              T = 2(20) sin 55° / (10 cos 20°) ≈ 32.77 / 9.397 ≈ 3.49 s.
            </span>
          </p>
          <p className="text-[15px] leading-relaxed text-token-2">
            <span className="font-serif italic">Step 2 — parallel component.</span>{' '}
            <span className="font-mono text-token">
              u<Sub>∥</Sub> = 20 cos 55° ≈ 11.47 m/s.
            </span>
          </p>
          <p className="text-[15px] leading-relaxed text-token-2">
            <span className="font-serif italic">Step 3 — range along slope.</span>{' '}
            <span className="font-mono text-token">
              R = u<Sub>∥</Sub>T + ½(−g sin θ)T² ≈ 40.0 − 1.71(12.18) ≈ 19.2 m.
            </span>
          </p>
        </div>
      </Section>

      <Section title="Everything you now know">
        <KeyList
          items={[
            <>Rotate axes to align with the incline — one along, one perpendicular.</>,
            <>Gravity splits into g sin θ along the slope and g cos θ perpendicular to it.</>,
            <>Flight time on incline: T = 2u sin α / (g cos θ).</>,
            <>Best launch angle from the slope: α = 45° + θ/2.</>,
            <>In the tilted frame, the trajectory is still a parabola.</>,
          ]}
        />
        <Callout tone="tip" title="What's next">
          Lesson 09 removes the ground entirely. Two projectiles in the air.
          When both have the same gravity, their <em>relative</em> motion is a
          straight line.
        </Callout>
      </Section>
    </LessonShell>
  );
};