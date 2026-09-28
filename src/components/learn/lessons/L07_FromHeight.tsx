import React from 'react';
import { LessonShell } from '../LessonShell';
import { LessonCanvas } from '../LessonCanvas';
import {
  Prose, Formula, Callout, Section, KeyList, Sub, NumberedSteps,
} from '../primitives';
import {
  clamp, easeOutCubic, easeInOutCubic, lerp,
  colors, drawLine, drawArrow, drawBall, drawGrid, drawLabel, vp,
} from '../animation/helpers';

export interface LessonNavProps {
  onPrev?: () => void;
  onNext?: () => void;
  prevTitle?: string;
  nextTitle?: string;
}

/* ------------------------------------------------------------------ */
/* Figure 1 — horizontal launch from height, two balls race            */
/* ------------------------------------------------------------------ */

const HorizontalFromHeight: React.FC = () => (
  <LessonCanvas
    height={260}
    duration={5}
    draw={({ ctx, w, h, progress }) => {
      const pad = 40;
      const groundY = h - pad;
      const originX = pad + 20;
      const originY = pad + 10;
      const sx = (w - pad * 2 - 20) / 10;
      const sy = (groundY - originY - 10) / 5;

      // --- static scene ---
      drawGrid(ctx, w, h, 12, 6, colors.border(0.35));
      drawLine(ctx, pad, groundY, w - pad, groundY, colors.text(0.5), 1.5);

      // launch height
      drawLine(ctx, originX, originY, originX, groundY, colors.text(0.4), 1, [4, 4]);

      // --- falling ball (free fall, left) ---
      const fallProgress = easeInOutCubic(clamp(progress / 0.8, 0, 1));
      const fallY = lerp(originY, groundY, fallProgress);
      drawBall(ctx, originX, fallY, 6, colors.textStrong(0.65));

      // --- projectile ball (right) ---
      // Physics: x = u·t, y = 1/2 g t^2 with u chosen so it lands at x = 7 m
      const launchP = easeInOutCubic(clamp(progress / 0.8, 0, 1));
      const px = originX + sx * 7 * launchP;
      const py = lerp(originY, groundY, launchP * launchP); // parabola: y ∝ t²
      // trail
      ctx.save();
      ctx.strokeStyle = colors.ember(0.7);
      ctx.lineWidth = 2;
      ctx.beginPath();
      for (let i = 0; i <= 60; i++) {
        const p = i / 60;
        if (p > launchP) break;
        const x = originX + sx * 7 * p;
        const y = lerp(originY, groundY, p * p);
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
      ctx.restore();
      drawBall(ctx, px, py, 7, colors.ball(1));

      // --- labels ---
      drawLabel(ctx, 'h', originX - 16, (originY + groundY) / 2, colors.text(0.9));
      drawLabel(ctx, 'u = 7 m/s', originX + 4, originY - 14, colors.accent(0.95));
      drawLabel(
        ctx,
        `t = ${(launchP * 1.2).toFixed(2)} s`,
        w - pad - 96, pad + 8, colors.text(0.9),
      );
      drawLabel(
        ctx,
        'both hit the ground simultaneously',
        pad, pad - 20, colors.textStrong(0.75),
      );
    }}
  />
);

/* ------------------------------------------------------------------ */
/* Figure 2 — angled launch from height, T and R live                  */
/* ------------------------------------------------------------------ */

const AngledFromHeight: React.FC = () => (
  <LessonCanvas
    height={280}
    duration={6}
    draw={({ ctx, w, h, progress }) => {
      const pad = 40;
      const groundY = h - pad;
      const originX = pad + 24;
      const originY = pad + 24;

      // Physics: u = 20, θ = 30°, h = 20 m
      const u = 20, theta = (30 * Math.PI) / 180, g = 10, h0 = 20;
      const ux = u * Math.cos(theta);
      const uy = u * Math.sin(theta);
      const T = (uy + Math.sqrt(uy * uy + 2 * g * h0)) / g;
      const R = ux * T;

      // world→screen scale
      const sx = (w - pad * 2 - 24) / (R * 1.15);
      const sy = (groundY - originY - 10) / (h0 * 1.4);

      drawGrid(ctx, w, h, 12, 6, colors.border(0.35));
      drawLine(ctx, pad, groundY, w - pad, groundY, colors.text(0.5), 1.5);
      // height guide
      drawLine(ctx, originX, originY, originX, groundY, colors.text(0.35), 1, [4, 4]);

      const launchP = easeInOutCubic(clamp(progress / 0.85, 0, 1));
      const t = launchP * T;
      const x = ux * t;
      const y = h0 + uy * t - 0.5 * g * t * t;

      // predict trail
      ctx.save();
      ctx.strokeStyle = colors.ember(0.75);
      ctx.lineWidth = 2;
      ctx.beginPath();
      for (let i = 0; i <= 80; i++) {
        const p = i / 80;
        if (p > launchP) break;
        const tt = p * T;
        const xx = ux * tt;
        const yy = h0 + uy * tt - 0.5 * g * tt * tt;
        const [px, py] = vp(xx, yy, { ox: originX, oy: groundY, sx, sy });
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.stroke();
      ctx.restore();

      // live velocity vectors at current ball
      const [bx, by] = vp(x, y, { ox: originX, oy: groundY, sx, sy });
      const vx = ux;
      const vy = uy - g * t;
      const k = 5; // px per m/s
      if (launchP < 1) {
        drawArrow(ctx, bx, by, bx + vx * k, by, colors.accent(0.95), 2);
        drawArrow(ctx, bx, by, bx, by - vy * k, colors.sage(0.95), 2);
        drawArrow(ctx, bx, by, bx + vx * k, by - vy * k, colors.rose(0.75), 2);
      }
      drawBall(ctx, bx, by, 7, colors.ball(1));

      // apex marker
      const tApex = uy / g;
      const yApex = h0 + (uy * uy) / (2 * g);
      if (tApex > 0 && tApex < T) {
        const [ax, ay] = vp(ux * tApex, yApex, { ox: originX, oy: groundY, sx, sy });
        ctx.save();
        ctx.fillStyle = colors.ember(0.85);
        ctx.beginPath();
        ctx.arc(ax, ay, 3, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
        drawLabel(ctx, 'apex', ax + 6, ay - 8, colors.ember(0.95));
      }

      // labels
      drawLabel(ctx, `u = ${u} m/s`, originX + 4, originY - 16, colors.accent(0.95));
      drawLabel(ctx, `θ = 30°`, originX + 4, originY - 4, colors.sage(0.95));
      drawLabel(ctx, `h = ${h0} m`, originX - 18, (originY + groundY) / 2, colors.text(0.9));
      drawLabel(
        ctx,
        `t = ${t.toFixed(2)} s`,
        w - pad - 88, pad + 6, colors.text(0.95),
      );
      drawLabel(
        ctx,
        `T_total = ${T.toFixed(2)} s   ·   R = ${R.toFixed(1)} m`,
        w - pad - 240, groundY + 26, colors.textStrong(0.95),
      );
    }}
  />
);

/* ------------------------------------------------------------------ */
/* Figure 3 — three launch angles from the same height, same speed     */
/* ------------------------------------------------------------------ */

const AngleSweep: React.FC = () => (
  <LessonCanvas
    height={240}
    duration={7}
    draw={({ ctx, w, h, progress }) => {
      const pad = 30;
      const groundY = h - pad;
      const originX = pad + 16;
      const originY = pad + 16;
      const u = 18, g = 10, h0 = 12;
      const angles = [-30, 0, 30, 60];

      const sx = (w - pad * 2 - 16) / 55;
      const sy = (groundY - originY - 10) / (h0 * 1.3);

      drawGrid(ctx, w, h, 11, 5, colors.border(0.3));
      drawLine(ctx, pad, groundY, w - pad, groundY, colors.text(0.45), 1.5);
      drawLine(ctx, originX, originY, originX, groundY, colors.text(0.3), 1, [3, 4]);

      const tone = [colors.accent(0.9), colors.sage(0.9), colors.ember(0.9), colors.rose(0.9)];
      const launchP = easeOutCubic(clamp(progress / 0.85, 0, 1));

      angles.forEach((deg, idx) => {
        const th = (deg * Math.PI) / 180;
        const ux = u * Math.cos(th);
        const uy = u * Math.sin(th);
        const T = (uy + Math.sqrt(Math.max(0, uy * uy + 2 * g * h0))) / g;

        ctx.save();
        ctx.strokeStyle = tone[idx];
        ctx.lineWidth = 1.6;
        ctx.setLineDash([3, 3]);
        ctx.beginPath();
        for (let i = 0; i <= 60; i++) {
          const p = i / 60;
          const tt = p * T;
          const xx = ux * tt;
          const yy = h0 + uy * tt - 0.5 * g * tt * tt;
          if (yy < 0) break;
          const [px, py] = vp(xx, yy, { ox: originX, oy: groundY, sx, sy });
          if (i === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        }
        ctx.stroke();
        ctx.restore();

        // ball
        const tt = launchP * T;
        const xx = ux * tt;
        const yy = h0 + uy * tt - 0.5 * g * tt * tt;
        if (yy >= 0) {
          const [px, py] = vp(xx, yy, { ox: originX, oy: groundY, sx, sy });
          drawBall(ctx, px, py, 5.5, tone[idx].replace(/[\d.]+\)$/, '1)'));
        }
      });

      drawLabel(ctx, `u = ${u} m/s  ·  h = ${h0} m`, pad, pad - 14, colors.textStrong(0.85));
      drawLabel(ctx, 'launch angle:  −30° · 0° · +30° · +60°', pad, h - 12, colors.text(0.85));
    }}
  />
);

/* ------------------------------------------------------------------ */
/* Lesson                                                              */
/* ------------------------------------------------------------------ */

export const L07_FromHeight: React.FC<LessonNavProps> = (nav) => {
  return (
    <LessonShell
      eyebrow="Chapter 07 · Projectile Motion"
      title="Projectile from a height"
      lede="When a projectile is launched from an elevated platform, the ground itself becomes a moving target. The horizontal equation doesn't change — but the vertical equation gains a head start."
      {...nav}
    >
      <Section title="The one idea that unlocks everything">
        <Prose>
          The projectile falls until its vertical position reaches zero. That
          "zero" is now the ground <em>below</em> the launch point, not the
          launch point itself. Everything else — the constant horizontal
          velocity, the linear decrease in vertical velocity — is identical to
          what you already know.
        </Prose>
        <Callout tone="tip" title="The one equation you must write down">
          <span className="font-mono">
            y(t) = h + u<Sub>y</Sub>t − ½gt²
          </span>
          . Set y = 0 and solve for t. That's the flight time. Everything else
          follows.
        </Callout>
      </Section>

      <Section title="Horizontal launch: the cleanest case">
        <Prose>
          Fire a ball horizontally from height h. It has zero initial vertical
          velocity — it just falls. A second ball released at the same instant
          falls straight down next to it. Both hit the ground at the same time.
        </Prose>
        <HorizontalFromHeight />
        <Callout tone="history" title="Galileo's experiment">
          This superposition — that horizontal motion and vertical fall
          don't interfere — was Galileo's breakthrough. He demonstrated it
          with balls rolling off a table and hitting the floor at the same
          instant as a ball dropped from rest.
        </Callout>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <Formula label="Flight time" accent="amber">
            T = √(2h / g)
          </Formula>
          <Formula label="Range" accent="rose">
            R = u · T = u√(2h / g)
          </Formula>
          <Formula label="Impact velocity" accent="sky">
            v = √(u² + 2gh)
          </Formula>
        </div>
      </Section>

      <Section title="Angled launch from height">
        <Prose>
          Now tilt the launch upward at angle θ. The vertical equation picks
          up the upward component of the launch, and the flight time becomes
          the root of a quadratic.
        </Prose>
        <NumberedSteps
          steps={[
            <>Resolve the initial velocity: <span className="font-mono text-token">u<Sub>x</Sub> = u cos θ, u<Sub>y</Sub> = u sin θ</span>.</>,
            <>Write the vertical position: <span className="font-mono text-token">y(t) = h + u<Sub>y</Sub>t − ½gt²</span>.</>,
            <>Set y = 0 and solve the quadratic for t. Take the positive root.</>,
            <>Multiply by u<Sub>x</Sub> to get the range.</>,
          ]}
        />
        <AngledFromHeight />
        <Formula label="Flight time (elevated, angled launch)" accent="amber">
          T = [u sin θ + √(u² sin²θ + 2gh)] / g
        </Formula>
        <Formula label="Range" accent="rose">
          R = u cos θ · T
        </Formula>
        <Callout tone="trap" title="The trap most students fall into">
          When the launch angle is <em>downward</em>, sin θ is negative. The
          formula still works — but you must keep the sign. A negative
          u<Sub>y</Sub> gives a shorter flight, which is physically correct.
        </Callout>
      </Section>

      <Section title="Angle sweep at fixed speed">
        <Prose>
          Hold launch speed and height fixed. Change only the angle. Notice:
          a shallow downward angle gives a short, fast flight; a steep
          upward angle gives a long, slow one. Somewhere in between is the
          angle that maximises range — and it is <em>not</em> 45°, because
          the projectile has a head start in height.
        </Prose>
        <AngleSweep />
        <Callout tone="info" title="Optimal angle from a height">
          For a launch from height h, the range is maximised at an angle
          slightly <em>less</em> than 45°. As h → 0, the optimum converges
          back to 45°. This is a favourite JEE Advanced question.
        </Callout>
      </Section>

      <Section title="Worked example">
        <Prose>
          A shell is fired from the top of a 20 m cliff with speed 20 m/s at
          30° above the horizontal. Take g = 10 m/s². Find the flight time
          and the horizontal range.
        </Prose>
        <div className="space-y-3 rounded-xl border border-token bg-surface-2 p-5">
          <p className="text-[15px] leading-relaxed text-token-2">
            <span className="font-serif italic">Step 1 — resolve.</span>{' '}
            <span className="font-mono text-token">
              u<Sub>x</Sub> = 20 cos 30° = 10√3 ≈ 17.3 m/s, &nbsp;
              u<Sub>y</Sub> = 20 sin 30° = 10 m/s.
            </span>
          </p>
          <p className="text-[15px] leading-relaxed text-token-2">
            <span className="font-serif italic">Step 2 — vertical equation.</span>{' '}
            <span className="font-mono text-token">
              0 = 20 + 10T − 5T² &nbsp;⟹&nbsp; T² − 2T − 4 = 0.
            </span>
          </p>
          <p className="text-[15px] leading-relaxed text-token-2">
            <span className="font-serif italic">Step 3 — positive root.</span>{' '}
            <span className="font-mono text-token">
              T = (2 + √20)/2 = 1 + √5 ≈ 3.24 s.
            </span>
          </p>
          <p className="text-[15px] leading-relaxed text-token-2">
            <span className="font-serif italic">Step 4 — range.</span>{' '}
            <span className="font-mono text-token">
              R = u<Sub>x</Sub> · T = (10√3)(1 + √5) ≈ 56.1 m.
            </span>
          </p>
        </div>
      </Section>

      <Section title="Everything you now know">
        <KeyList
          items={[
            <>The horizontal equation is unchanged. Only the vertical start position changes.</>,
            <>Horizontal launch: T = √(2h/g), R = u√(2h/g).</>,
            <>Angled launch: T = [u sin θ + √(u² sin²θ + 2gh)] / g.</>,
            <>The angle for maximum range from height h is <em>less</em> than 45°.</>,
            <>Every formula reduces to the ground-launch form when h → 0.</>,
          ]}
        />
        <Callout tone="tip" title="What's next">
          Lesson 08 tilts the ground itself. On an incline, gravity has a
          component along the surface and a component perpendicular to it —
          and the projectile becomes a tilted parabola.
        </Callout>
      </Section>
    </LessonShell>
  );
};